<?php

namespace App\Http\Controllers;

use App\Models\MinistryVideo;
use Illuminate\Http\Request;

class MinistryVideoController extends Controller
{
    public function uploadVideo(Request $request, string $ministryId)
    {
        if (!$request->hasFile('video')) {
            return response()->json(['error' => 'No se proporcionó video'], 400);
        }
        $file = $request->file('video');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'video/')) {
            return response()->json(['error' => 'El archivo debe ser un video'], 400);
        }

        $maxSort = MinistryVideo::where('ministryId', $ministryId)->max('sortOrder') ?? -1;

        $video = MinistryVideo::create([
            'ministryId' => $ministryId,
            'videoData' => file_get_contents($file->getRealPath()),
            'videoMime' => $mime,
            'videoName' => $file->getClientOriginalName(),
            'sortOrder' => $maxSort + 1,
        ]);

        return response()->json([
            'message' => 'Video guardado',
            'videoId' => $video->id,
            'videoUrl' => "/api/ministry/{$ministryId}/video/{$video->id}",
            'videoName' => $video->videoName,
        ]);
    }

    public function getVideo(string $ministryId, int $videoId)
    {
        $video = MinistryVideo::where('id', $videoId)
            ->where('ministryId', $ministryId)->first();
        if (!$video || empty($video->videoData)) {
            return response()->json(['error' => 'No hay video'], 404);
        }
        return response($video->videoData)
            ->header('Content-Type', $video->videoMime ?? 'video/mp4')
            ->header('Content-Disposition', 'inline; filename="' . ($video->videoName ?? 'video.mp4') . '"')
            ->header('Accept-Ranges', 'bytes')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteVideo(string $ministryId, int $videoId)
    {
        MinistryVideo::where('id', $videoId)
            ->where('ministryId', $ministryId)->delete();
        return response()->json(['message' => 'Video eliminado']);
    }

    public function listVideos(string $ministryId)
    {
        $videos = MinistryVideo::where('ministryId', $ministryId)
            ->orderBy('sortOrder')
            ->select('id', 'videoName', 'sortOrder')
            ->get();

        return response()->json([
            'videos' => $videos->map(fn($v) => [
                'id' => $v->id,
                'name' => $v->videoName,
                'url' => "/api/ministry/{$ministryId}/video/{$v->id}",
            ]),
        ]);
    }
}

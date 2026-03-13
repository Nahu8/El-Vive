<?php

namespace App\Http\Controllers;

use App\Models\EventMedia;
use Illuminate\Http\Request;

class EventMediaController extends Controller
{
    public function uploadIcon(Request $request, string $eventId)
    {
        if (!$request->hasFile('icon')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('icon');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        EventMedia::where('eventId', $eventId)->where('mediaType', 'icon')->delete();

        $media = EventMedia::create([
            'eventId' => $eventId,
            'mediaType' => 'icon',
            'imageData' => file_get_contents($file->getRealPath()),
            'imageMime' => $mime,
            'imageName' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message' => 'Ícono guardado',
            'iconUrl' => "/api/event/{$eventId}/icon",
            'imageName' => $media->imageName,
        ]);
    }

    public function getIcon(string $eventId)
    {
        $media = EventMedia::where('eventId', $eventId)->where('mediaType', 'icon')->first();
        if (!$media || empty($media->imageData)) {
            return response()->json(['error' => 'No hay ícono'], 404);
        }
        return response($media->imageData)
            ->header('Content-Type', $media->imageMime ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteIcon(string $eventId)
    {
        EventMedia::where('eventId', $eventId)->where('mediaType', 'icon')->delete();
        return response()->json(['message' => 'Ícono eliminado']);
    }

    public function uploadBackground(Request $request, string $eventId)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('image');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        EventMedia::where('eventId', $eventId)->where('mediaType', 'background')->delete();

        $media = EventMedia::create([
            'eventId' => $eventId,
            'mediaType' => 'background',
            'imageData' => file_get_contents($file->getRealPath()),
            'imageMime' => $mime,
            'imageName' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message' => 'Imagen de fondo guardada',
            'backgroundUrl' => "/api/event/{$eventId}/background",
            'imageName' => $media->imageName,
        ]);
    }

    public function getBackground(string $eventId)
    {
        $media = EventMedia::where('eventId', $eventId)->where('mediaType', 'background')->first();
        if (!$media || empty($media->imageData)) {
            return response()->json(['error' => 'No hay imagen de fondo'], 404);
        }
        return response($media->imageData)
            ->header('Content-Type', $media->imageMime ?? 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteBackground(string $eventId)
    {
        EventMedia::where('eventId', $eventId)->where('mediaType', 'background')->delete();
        return response()->json(['message' => 'Imagen de fondo eliminada']);
    }
}

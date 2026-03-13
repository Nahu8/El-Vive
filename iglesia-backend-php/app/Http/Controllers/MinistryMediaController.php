<?php

namespace App\Http\Controllers;

use App\Models\MinistryMedia;
use App\Models\MinistryVideo;
use App\Models\MinistryCardImage;
use Illuminate\Http\Request;

class MinistryMediaController extends Controller
{
    // === ICON ===
    public function uploadIcon(Request $request, string $ministryId)
    {
        if (!$request->hasFile('icon')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('icon');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        MinistryMedia::where('ministryId', $ministryId)->where('mediaType', 'icon')->delete();

        $media = MinistryMedia::create([
            'ministryId' => $ministryId,
            'mediaType' => 'icon',
            'imageData' => file_get_contents($file->getRealPath()),
            'imageMime' => $mime,
            'imageName' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message' => 'Ícono guardado',
            'iconUrl' => "/api/ministry/{$ministryId}/icon",
            'imageName' => $media->imageName,
        ]);
    }

    public function getIcon(string $ministryId)
    {
        $media = MinistryMedia::where('ministryId', $ministryId)
            ->where('mediaType', 'icon')->first();
        if (!$media || empty($media->imageData)) {
            return response()->json(['error' => 'No hay ícono'], 404);
        }
        return response($media->imageData)
            ->header('Content-Type', $media->imageMime ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteIcon(string $ministryId)
    {
        MinistryMedia::where('ministryId', $ministryId)->where('mediaType', 'icon')->delete();
        return response()->json(['message' => 'Ícono eliminado']);
    }

    // === PHOTOS ===
    public function uploadPhoto(Request $request, string $ministryId)
    {
        if (!$request->hasFile('photo')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('photo');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        $maxSort = MinistryMedia::where('ministryId', $ministryId)
            ->where('mediaType', 'photo')->max('sortOrder') ?? -1;

        $media = MinistryMedia::create([
            'ministryId' => $ministryId,
            'mediaType' => 'photo',
            'imageData' => file_get_contents($file->getRealPath()),
            'imageMime' => $mime,
            'imageName' => $file->getClientOriginalName(),
            'sortOrder' => $maxSort + 1,
        ]);

        return response()->json([
            'message' => 'Foto guardada',
            'photoId' => $media->id,
            'photoUrl' => "/api/ministry/{$ministryId}/photo/{$media->id}",
            'imageName' => $media->imageName,
        ]);
    }

    public function getPhoto(string $ministryId, int $photoId)
    {
        $media = MinistryMedia::where('id', $photoId)
            ->where('ministryId', $ministryId)
            ->where('mediaType', 'photo')->first();
        if (!$media || empty($media->imageData)) {
            return response()->json(['error' => 'No hay foto'], 404);
        }
        return response($media->imageData)
            ->header('Content-Type', $media->imageMime ?? 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deletePhoto(string $ministryId, int $photoId)
    {
        MinistryMedia::where('id', $photoId)
            ->where('ministryId', $ministryId)
            ->where('mediaType', 'photo')->delete();
        return response()->json(['message' => 'Foto eliminada']);
    }

    // === CARD IMAGE (fondo de la card) ===
    public function uploadCardImage(Request $request, string $ministryId)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('image');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        $card = MinistryCardImage::updateOrCreate(
            ['ministryId' => $ministryId],
            [
                'imageData' => file_get_contents($file->getRealPath()),
                'imageMime' => $mime,
                'imageName' => $file->getClientOriginalName(),
            ]
        );

        return response()->json([
            'message' => 'Imagen de card guardada',
            'cardImageUrl' => "/api/ministry/{$ministryId}/card-image",
            'imageName' => $card->imageName,
        ]);
    }

    public function getCardImage(string $ministryId)
    {
        $card = MinistryCardImage::where('ministryId', $ministryId)->first();
        if (!$card || empty($card->imageData)) {
            return response()->json(['error' => 'No hay imagen de card'], 404);
        }
        return response($card->imageData)
            ->header('Content-Type', $card->imageMime ?? 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteCardImage(string $ministryId)
    {
        MinistryCardImage::where('ministryId', $ministryId)->delete();
        return response()->json(['message' => 'Imagen de card eliminada']);
    }

    public function listMedia(string $ministryId)
    {
        $icon = MinistryMedia::where('ministryId', $ministryId)
            ->where('mediaType', 'icon')
            ->select('id', 'imageName')
            ->first();

        $photos = MinistryMedia::where('ministryId', $ministryId)
            ->where('mediaType', 'photo')
            ->orderBy('sortOrder')
            ->select('id', 'imageName', 'sortOrder')
            ->get();

        $videos = MinistryVideo::where('ministryId', $ministryId)
            ->orderBy('sortOrder')
            ->select('id', 'videoName', 'sortOrder')
            ->get();

        $hasCardImage = MinistryCardImage::where('ministryId', $ministryId)->exists();

        return response()->json([
            'hasIcon' => $icon !== null,
            'hasCardImage' => $hasCardImage,
            'cardImageUrl' => $hasCardImage ? "/api/ministry/{$ministryId}/card-image" : null,
            'iconName' => $icon?->imageName,
            'iconUrl' => $icon ? "/api/ministry/{$ministryId}/icon" : null,
            'photos' => $photos->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->imageName,
                'url' => "/api/ministry/{$ministryId}/photo/{$p->id}",
            ]),
            'videos' => $videos->map(fn($v) => [
                'id' => $v->id,
                'name' => $v->videoName,
                'url' => "/api/ministry/{$ministryId}/video/{$v->id}",
            ]),
        ]);
    }
}

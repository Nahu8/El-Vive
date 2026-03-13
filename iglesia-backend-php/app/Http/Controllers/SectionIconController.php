<?php

namespace App\Http\Controllers;

use App\Models\SectionIcon;
use Illuminate\Http\Request;

class SectionIconController extends Controller
{
    public function upload(Request $request, string $pageKey, string $sectionKey)
    {
        if (!$request->hasFile('icon')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('icon');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        SectionIcon::updateOrCreate(
            ['page_key' => $pageKey, 'section_key' => $sectionKey],
            [
                'imageData' => file_get_contents($file->getRealPath()),
                'imageMime' => $mime,
                'imageName' => $file->getClientOriginalName(),
            ]
        );

        return response()->json([
            'message' => 'Ícono guardado',
            'iconUrl' => "/api/section-icon/{$pageKey}/{$sectionKey}",
        ]);
    }

    public function getIcon(string $pageKey, string $sectionKey)
    {
        $icon = SectionIcon::where('page_key', $pageKey)->where('section_key', $sectionKey)->first();
        if (!$icon || empty($icon->imageData)) {
            return response()->json(['error' => 'No hay ícono'], 404);
        }
        return response($icon->imageData)
            ->header('Content-Type', $icon->imageMime ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteIcon(string $pageKey, string $sectionKey)
    {
        SectionIcon::where('page_key', $pageKey)->where('section_key', $sectionKey)->delete();
        return response()->json(['message' => 'Ícono eliminado']);
    }
}

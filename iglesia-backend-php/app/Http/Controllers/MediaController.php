<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function listMedia(Request $request)
    {
        $query = Media::orderBy('created_at', 'desc');
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        return response()->json($query->get());
    }

    public function uploadMedia(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No se proporcionó ningún archivo'], 400);
        }

        $file = $request->file('file');
        $mime = $file->getMimeType();

        $mediaType = 'image';
        $subdir = 'images';
        if (str_starts_with($mime, 'video/')) {
            $mediaType = 'video';
            $subdir = 'videos';
        }
        if ($request->input('category') === 'icon') {
            $mediaType = 'icon';
            $subdir = 'icons';
        }

        $filename = $file->getClientOriginalName();
        $uniqueName = uniqid('file-') . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("uploads/{$subdir}", $uniqueName, 'public');

        $media = Media::create([
            'filename' => $uniqueName,
            'originalName' => $filename,
            'path' => '/storage/' . $path,
            'type' => $mediaType,
            'size' => $file->getSize(),
        ]);

        return response()->json([
            'id' => $media->id,
            'filename' => $media->filename,
            'originalName' => $media->originalName,
            'path' => $media->path,
            'url' => $media->path,
            'type' => $media->type,
            'size' => $media->size,
        ], 201);
    }

    public function deleteMedia(string $id)
    {
        $media = Media::find($id);
        if (!$media) return response()->json(['error' => 'Archivo no encontrado'], 404);

        $storagePath = str_replace('/storage/', '', $media->path);
        Storage::disk('public')->delete($storagePath);
        $media->delete();

        return response()->json(['message' => 'Archivo eliminado exitosamente']);
    }
}

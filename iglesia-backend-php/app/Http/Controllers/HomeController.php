<?php

namespace App\Http\Controllers;

use App\Models\Home;
use App\Models\MeetingCardImage;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    private function homeWithoutBlob()
    {
        return Home::select(array_filter(
            (new Home())->getFillable(),
            fn($col) => !in_array($col, ['heroVideoData', 'heroVideo2Data', 'heroIconDomData', 'heroIconMierData'])
        ))->addSelect(['id', 'created_at', 'updated_at']);
    }

    public function getHome()
    {
        $home = $this->homeWithoutBlob()->first();
        if (!$home) {
            $home = Home::create([
                'heroTitle' => 'ÉL VIVE IGLESIA',
                'heroButton1Text' => 'VER EVENTOS',
                'heroButton1Link' => '/dias-reunion',
                'heroButton2Text' => 'CONOCE MÁS',
                'heroButton2Link' => '/contacto',
            ]);
        }

        $hasVideo1 = Home::where('id', $home->id)->whereNotNull('heroVideoData')->exists();
        $hasVideo2 = Home::where('id', $home->id)->whereNotNull('heroVideo2Data')->exists();
        $hasIconDom = Home::where('id', $home->id)->whereNotNull('heroIconDomData')->exists();
        $hasIconMier = Home::where('id', $home->id)->whereNotNull('heroIconMierData')->exists();

        $cardImages = MeetingCardImage::select('cardIndex', 'imageName')->get()->keyBy('cardIndex');

        return response()->json([
            'id' => $home->id,
            'heroTitle' => $home->heroTitle,
            'heroButton1Text' => $home->heroButton1Text,
            'heroButton1Link' => $home->heroButton1Link,
            'heroButton2Text' => $home->heroButton2Text,
            'heroButton2Link' => $home->heroButton2Link,
            'heroVideoUrl' => $home->heroVideoUrl ?? '',
            'hasVideoDomingo' => $hasVideo1,
            'heroVideoDomingoName' => $home->heroVideoName ?? '',
            'hasVideoMiercoles' => $hasVideo2,
            'heroVideoMiercolesName' => $home->heroVideo2Name ?? '',
            'hasIconDomingo' => $hasIconDom,
            'heroIconDomingoName' => $home->heroIconDomName ?? '',
            'hasIconMiercoles' => $hasIconMier,
            'heroIconMiercolesName' => $home->heroIconMierName ?? '',
            'video1Url' => $home->video1Url ?? '',
            'video2Url' => $home->video2Url ?? '',
            'celebrations' => $home->celebrations ?? [],
            'meetingDaysSummary' => $home->meetingDaysSummary,
            'ministriesSummary' => $home->ministriesSummary,
            'cardImages' => $cardImages,
            'createdAt' => $home->created_at,
            'updatedAt' => $home->updated_at,
        ]);
    }

    public function updateHome(Request $request)
    {
        $home = Home::first();
        if (!$home) {
            $home = Home::create($request->except(['heroVideoData', 'heroVideo2Data']));
            return response()->json(['message' => 'Home creado'], 201);
        }
        $home->update($request->except(['heroVideoData', 'heroVideo2Data']));
        return response()->json(['message' => 'Home actualizado']);
    }

    public function updateHero(Request $request)
    {
        $home = Home::first() ?? Home::create([]);
        $data = [
            'heroTitle' => $request->input('heroTitle', $home->heroTitle),
            'heroButton1Text' => $request->input('heroButton1Text', $home->heroButton1Text),
            'heroButton1Link' => $request->input('heroButton1Link', $home->heroButton1Link),
            'heroButton2Text' => $request->input('heroButton2Text', $home->heroButton2Text),
            'heroButton2Link' => $request->input('heroButton2Link', $home->heroButton2Link),
        ];
        $home->update($data);
        return response()->json(['message' => 'Hero actualizado']);
    }

    // === VIDEO DOMINGOS (Jueves a Domingo) ===
    public function uploadHeroVideo(Request $request)
    {
        if (!$request->hasFile('video')) {
            return response()->json(['error' => 'No se proporcionó ningún archivo de video'], 400);
        }
        $file = $request->file('video');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'video/')) {
            return response()->json(['error' => 'El archivo debe ser un video'], 400);
        }

        $home = Home::first() ?? Home::create([]);
        $home->heroVideoData = file_get_contents($file->getRealPath());
        $home->heroVideoMime = $mime;
        $home->heroVideoName = $file->getClientOriginalName();
        $home->save();

        return response()->json([
            'message' => 'Video Domingos guardado',
            'heroVideoName' => $home->heroVideoName,
        ]);
    }

    public function getHeroVideo()
    {
        $home = Home::first();
        if (!$home || empty($home->heroVideoData)) {
            return response()->json(['error' => 'No hay video guardado'], 404);
        }
        return response($home->heroVideoData)
            ->header('Content-Type', $home->heroVideoMime ?? 'video/mp4')
            ->header('Content-Disposition', 'inline; filename="' . ($home->heroVideoName ?? 'video.mp4') . '"')
            ->header('Accept-Ranges', 'bytes')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteHeroVideo()
    {
        $home = Home::first();
        if (!$home) return response()->json(['error' => 'No encontrado'], 404);
        $home->update(['heroVideoData' => null, 'heroVideoMime' => null, 'heroVideoName' => null]);
        return response()->json(['message' => 'Video eliminado']);
    }

    // === VIDEO MIERCOLES (Lunes a Miercoles) ===
    public function uploadHeroVideo2(Request $request)
    {
        if (!$request->hasFile('video')) {
            return response()->json(['error' => 'No se proporcionó ningún archivo de video'], 400);
        }
        $file = $request->file('video');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'video/')) {
            return response()->json(['error' => 'El archivo debe ser un video'], 400);
        }

        $home = Home::first() ?? Home::create([]);
        $home->heroVideo2Data = file_get_contents($file->getRealPath());
        $home->heroVideo2Mime = $mime;
        $home->heroVideo2Name = $file->getClientOriginalName();
        $home->save();

        return response()->json([
            'message' => 'Video Miércoles guardado',
            'heroVideoName' => $home->heroVideo2Name,
        ]);
    }

    public function getHeroVideo2()
    {
        $home = Home::first();
        if (!$home || empty($home->heroVideo2Data)) {
            return response()->json(['error' => 'No hay video guardado'], 404);
        }
        return response($home->heroVideo2Data)
            ->header('Content-Type', $home->heroVideo2Mime ?? 'video/mp4')
            ->header('Content-Disposition', 'inline; filename="' . ($home->heroVideo2Name ?? 'video.mp4') . '"')
            ->header('Accept-Ranges', 'bytes')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteHeroVideo2()
    {
        $home = Home::first();
        if (!$home) return response()->json(['error' => 'No encontrado'], 404);
        $home->update(['heroVideo2Data' => null, 'heroVideo2Mime' => null, 'heroVideo2Name' => null]);
        return response()->json(['message' => 'Video eliminado']);
    }

    // === CURRENT VIDEO (auto-rotation by Argentine day) ===
    public function getCurrentVideo()
    {
        $home = Home::first();
        if (!$home) return response()->json(['error' => 'No hay video'], 404);

        // Argentine timezone UTC-3
        $now = new \DateTime('now', new \DateTimeZone('America/Argentina/Buenos_Aires'));
        $dayOfWeek = (int) $now->format('N'); // 1=Mon ... 7=Sun

        // Mon(1), Tue(2), Wed(3) → Miercoles video
        // Thu(4), Fri(5), Sat(6), Sun(7) → Domingos video
        if ($dayOfWeek <= 3 && !empty($home->heroVideo2Data)) {
            return response($home->heroVideo2Data)
                ->header('Content-Type', $home->heroVideo2Mime ?? 'video/mp4')
                ->header('Content-Disposition', 'inline')
                ->header('Cache-Control', 'public, max-age=3600');
        }

        if (!empty($home->heroVideoData)) {
            return response($home->heroVideoData)
                ->header('Content-Type', $home->heroVideoMime ?? 'video/mp4')
                ->header('Content-Disposition', 'inline')
                ->header('Cache-Control', 'public, max-age=3600');
        }

        return response()->json(['error' => 'No hay video para hoy'], 404);
    }

    // === ICON DOMINGOS (Thu-Sun) ===
    public function uploadIconDom(Request $request)
    {
        if (!$request->hasFile('icon')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('icon');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }
        $home = Home::first() ?? Home::create([]);
        $home->heroIconDomData = file_get_contents($file->getRealPath());
        $home->heroIconDomMime = $mime;
        $home->heroIconDomName = $file->getClientOriginalName();
        $home->save();
        return response()->json(['message' => 'Ícono Domingos guardado', 'iconName' => $home->heroIconDomName]);
    }

    public function getIconDom()
    {
        $home = Home::first();
        if (!$home || empty($home->heroIconDomData)) {
            return response()->json(['error' => 'No hay ícono'], 404);
        }
        return response($home->heroIconDomData)
            ->header('Content-Type', $home->heroIconDomMime ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteIconDom()
    {
        $home = Home::first();
        if (!$home) return response()->json(['error' => 'No encontrado'], 404);
        $home->update(['heroIconDomData' => null, 'heroIconDomMime' => null, 'heroIconDomName' => null]);
        return response()->json(['message' => 'Ícono eliminado']);
    }

    // === ICON MIERCOLES (Mon-Wed) ===
    public function uploadIconMier(Request $request)
    {
        if (!$request->hasFile('icon')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('icon');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }
        $home = Home::first() ?? Home::create([]);
        $home->heroIconMierData = file_get_contents($file->getRealPath());
        $home->heroIconMierMime = $mime;
        $home->heroIconMierName = $file->getClientOriginalName();
        $home->save();
        return response()->json(['message' => 'Ícono Miércoles guardado', 'iconName' => $home->heroIconMierName]);
    }

    public function getIconMier()
    {
        $home = Home::first();
        if (!$home || empty($home->heroIconMierData)) {
            return response()->json(['error' => 'No hay ícono'], 404);
        }
        return response($home->heroIconMierData)
            ->header('Content-Type', $home->heroIconMierMime ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteIconMier()
    {
        $home = Home::first();
        if (!$home) return response()->json(['error' => 'No encontrado'], 404);
        $home->update(['heroIconMierData' => null, 'heroIconMierMime' => null, 'heroIconMierName' => null]);
        return response()->json(['message' => 'Ícono eliminado']);
    }

    // === CURRENT ICON (auto-rotation by Argentine day) ===
    public function getCurrentIcon()
    {
        $home = Home::first();
        if (!$home) return response()->json(['error' => 'No hay ícono'], 404);

        $now = new \DateTime('now', new \DateTimeZone('America/Argentina/Buenos_Aires'));
        $dayOfWeek = (int) $now->format('N'); // 1=Mon ... 7=Sun

        if ($dayOfWeek <= 3 && !empty($home->heroIconMierData)) {
            return response($home->heroIconMierData)
                ->header('Content-Type', $home->heroIconMierMime ?? 'image/png')
                ->header('Cache-Control', 'public, max-age=3600');
        }

        if (!empty($home->heroIconDomData)) {
            return response($home->heroIconDomData)
                ->header('Content-Type', $home->heroIconDomMime ?? 'image/png')
                ->header('Cache-Control', 'public, max-age=3600');
        }

        return response()->json(['error' => 'No hay ícono para hoy'], 404);
    }

    // === MEETING CARD IMAGES ===
    public function uploadCardImage(Request $request, $index)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No se proporcionó imagen'], 400);
        }
        $file = $request->file('image');
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        $card = MeetingCardImage::updateOrCreate(
            ['cardIndex' => (int)$index],
            [
                'imageData' => file_get_contents($file->getRealPath()),
                'imageMime' => $mime,
                'imageName' => $file->getClientOriginalName(),
            ]
        );

        return response()->json([
            'message' => 'Imagen de card guardada',
            'imageName' => $card->imageName,
            'imageUrl' => "/api/home/card-image/{$index}",
        ]);
    }

    public function getCardImage($index)
    {
        $card = MeetingCardImage::where('cardIndex', (int)$index)->first();
        if (!$card || empty($card->imageData)) {
            return response()->json(['error' => 'No hay imagen'], 404);
        }
        return response($card->imageData)
            ->header('Content-Type', $card->imageMime ?? 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteCardImage($index)
    {
        MeetingCardImage::where('cardIndex', (int)$index)->delete();
        return response()->json(['message' => 'Imagen eliminada']);
    }

    // === OTHER HOME UPDATES ===
    public function updateCelebrations(Request $request)
    {
        $home = Home::first() ?? Home::create([]);
        $home->update(['celebrations' => $request->input('celebrations', [])]);
        return response()->json(['message' => 'Celebraciones actualizadas']);
    }

    public function updateMeetingDaysSummary(Request $request)
    {
        $home = Home::first() ?? Home::create([]);
        $home->update(['meetingDaysSummary' => $request->input('meetingDaysSummary', $home->meetingDaysSummary)]);
        return response()->json(['message' => 'Resumen de días de reunión actualizado']);
    }

    public function updateMinistriesSummary(Request $request)
    {
        $home = Home::first() ?? Home::create([]);
        $home->update(['ministriesSummary' => $request->input('ministriesSummary', $home->ministriesSummary)]);
        return response()->json(['message' => 'Resumen de ministerios actualizado']);
    }
}

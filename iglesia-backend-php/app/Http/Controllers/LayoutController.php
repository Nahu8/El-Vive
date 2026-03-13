<?php

namespace App\Http\Controllers;

use App\Models\Layout;
use Illuminate\Http\Request;

class LayoutController extends Controller
{
    public function getLayout()
    {
        $layout = Layout::first();
        if (!$layout) {
            $layout = Layout::create([
                'navLinks' => [['label'=>'Inicio','path'=>'/'],['label'=>'Ministerios','path'=>'/ministerios'],['label'=>'Días de Reunión','path'=>'/dias-reunion'],['label'=>'Contacto','path'=>'/contacto']],
                'footerBrandTitle' => 'ÉL VIVE IGLESIA',
                'footerBrandDescription' => 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.',
                'quickLinks' => [['label'=>'Días de Reunión','path'=>'/dias-reunion'],['label'=>'Ministerios','path'=>'/ministerios'],['label'=>'Contacto','path'=>'/contacto']],
            ]);
        }

        return response()->json([
            'id' => $layout->id,
            'navLinks' => $layout->navLinks ?? [],
            'footerBrandTitle' => $layout->footerBrandTitle ?? '',
            'footerBrandDescription' => $layout->footerBrandDescription ?? '',
            'footerFacebookUrl' => $layout->footerFacebookUrl ?? '',
            'footerInstagramUrl' => $layout->footerInstagramUrl ?? '',
            'footerYoutubeUrl' => $layout->footerYoutubeUrl ?? '',
            'footerAddress' => $layout->footerAddress ?? '',
            'footerEmail' => $layout->footerEmail ?? '',
            'footerPhone' => $layout->footerPhone ?? '',
            'footerCopyright' => $layout->footerCopyright ?? '',
            'footerPrivacyUrl' => $layout->footerPrivacyUrl ?? '#',
            'footerTermsUrl' => $layout->footerTermsUrl ?? '#',
            'quickLinks' => $layout->quickLinks ?? [],
        ]);
    }

    public function updateLayout(Request $request)
    {
        $layout = Layout::first() ?? Layout::create([]);
        $data = [];
        foreach (['navLinks','footerBrandTitle','footerBrandDescription','footerFacebookUrl','footerInstagramUrl','footerYoutubeUrl','footerAddress','footerEmail','footerPhone','footerCopyright','footerPrivacyUrl','footerTermsUrl','quickLinks'] as $field) {
            if ($request->has($field)) $data[$field] = $request->input($field);
        }
        $layout->update($data);
        return response()->json($layout->fresh());
    }
}

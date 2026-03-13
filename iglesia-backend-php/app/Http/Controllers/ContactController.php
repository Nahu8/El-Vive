<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function getContact()
    {
        $c = Contact::first();
        if (!$c) {
            $c = Contact::create([
                'email' => 'elviveiglesia@gmail.com',
                'phone' => '+54 (11) 503-621-41',
                'address' => 'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
                'city' => 'La Matanza, Buenos Aires, Argentina',
                'socialMedia' => ['facebook' => '', 'instagram' => '', 'youtube' => '', 'whatsapp' => '', 'tiktok' => '', 'twitter' => ''],
                'schedules' => ['sunday' => '10:00 AM - 12:00 PM', 'wednesday' => '7:00 PM - 9:00 PM'],
                'departments' => [],
            ]);
        }

        return response()->json([
            'id' => $c->id,
            'email' => $c->email, 'phone' => $c->phone,
            'address' => $c->address, 'city' => $c->city,
            'socialMedia' => $c->socialMedia ?? [],
            'schedules' => $c->schedules ?? [],
            'departments' => $c->departments ?? [],
            'mapEmbed' => $c->mapEmbed ?? '',
            'additionalInfo' => $c->additionalInfo ?? '',
            'pageContent' => $c->pageContent ?? [],
            'createdAt' => $c->created_at,
            'updatedAt' => $c->updated_at,
        ]);
    }

    public function updateContact(Request $request)
    {
        $c = Contact::first();
        if (!$c) { $c = Contact::create($request->all()); return response()->json($c, 201); }
        $c->update($request->all());
        return response()->json($c->fresh());
    }

    public function updateBasicInfo(Request $request)
    {
        $c = Contact::first() ?? Contact::create([]);
        $c->update([
            'email' => $request->input('email', $c->email),
            'phone' => $request->input('phone', $c->phone),
            'address' => $request->input('address', $c->address),
            'city' => $request->input('city', $c->city),
            'mapEmbed' => $request->has('mapEmbed') ? $request->input('mapEmbed') : $c->mapEmbed,
        ]);
        return response()->json($c->fresh());
    }

    public function updateSocialMedia(Request $request)
    {
        $c = Contact::first() ?? Contact::create([]);
        $c->update(['socialMedia' => $request->input('socialMedia', $c->socialMedia)]);
        return response()->json($c->fresh());
    }

    public function updateSchedules(Request $request)
    {
        $c = Contact::first() ?? Contact::create([]);
        $c->update(['schedules' => $request->input('schedules', $c->schedules)]);
        return response()->json($c->fresh());
    }

    public function updateDepartments(Request $request)
    {
        $c = Contact::first() ?? Contact::create([]);
        $c->update(['departments' => $request->input('departments', $c->departments)]);
        return response()->json($c->fresh());
    }

    public function updatePageContent(Request $request)
    {
        $c = Contact::first() ?? Contact::create([]);
        $c->update(['pageContent' => $request->input('pageContent', $c->pageContent)]);
        return response()->json($c->fresh());
    }
}

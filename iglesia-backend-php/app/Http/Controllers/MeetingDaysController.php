<?php

namespace App\Http\Controllers;

use App\Models\MeetingDays;
use App\Models\EventMedia;
use App\Models\SectionIcon;
use Illuminate\Http\Request;

class MeetingDaysController extends Controller
{
    private function enrichEventsWithMedia(array $events): array
    {
        if (empty($events) || !isset($events['events'])) return $events;
        $events['events'] = collect($events['events'])->map(function ($e) {
            $id = $e['id'] ?? null;
            if ($id) {
                if (EventMedia::where('eventId', $id)->where('mediaType', 'icon')->exists()) {
                    $e['iconUrl'] = "/api/event/{$id}/icon";
                }
                if (EventMedia::where('eventId', $id)->where('mediaType', 'background')->exists()) {
                    $e['backgroundUrl'] = "/api/event/{$id}/background";
                }
            }
            return $e;
        })->toArray();
        return $events;
    }

    public function getMeetingDays()
    {
        $md = MeetingDays::first();
        if (!$md) $md = MeetingDays::create([]);

        $cal = $md->calendarEvents ?? [];
        $cal = $this->enrichEventsWithMedia($cal);
        $upcoming = $md->upcomingEvents ?? [];
        if (!empty($upcoming['events'])) {
            $upcoming['events'] = collect($upcoming['events'])->map(function ($e) {
                $id = $e['id'] ?? null;
                if ($id) {
                    if (EventMedia::where('eventId', $id)->where('mediaType', 'icon')->exists()) {
                        $e['iconUrl'] = "/api/event/{$id}/icon";
                    }
                    if (EventMedia::where('eventId', $id)->where('mediaType', 'background')->exists()) {
                        $e['backgroundUrl'] = "/api/event/{$id}/background";
                    }
                }
                return $e;
            })->toArray();
        }
        $hero = $md->hero ?? [];
        $hasHeroImage = MeetingDays::where('id', $md->id)->whereNotNull('heroImageData')->exists();

        $upcomingEventsIconUrl = SectionIcon::hasIcon('meeting-days', 'upcoming-events') ? '/api/section-icon/meeting-days/upcoming-events' : null;
        $calendarIconUrl = SectionIcon::hasIcon('meeting-days', 'calendar') ? '/api/section-icon/meeting-days/calendar' : null;

        return response()->json([
            'id' => $md->id,
            'sectionTitle' => $cal['sectionTitle'] ?? 'CALENDARIO DE EVENTOS',
            'sectionSubtitle' => $cal['sectionSubtitle'] ?? '',
            'hero' => !empty($hero) ? $hero : null,
            'hasHeroImage' => $hasHeroImage,
            'heroImageName' => $md->heroImageName ?? '',
            'heroImageUrl' => $hasHeroImage ? '/api/meeting-days/hero-image' : null,
            'calendarEvents' => $cal,
            'upcomingEvents' => !empty($upcoming) ? $upcoming : null,
            'upcomingEventsIconUrl' => $upcomingEventsIconUrl,
            'calendarIconUrl' => $calendarIconUrl,
            'eventCta' => $md->eventCta,
            'eventSettings' => $md->eventSettings ?? ['showPastEvents'=>true,'showEventCountdown'=>true,'defaultEventColor'=>'#3b82f6','defaultEventDuration'=>'120','enableEventRegistration'=>true,'emailNotifications'=>true,'reminderDaysBefore'=>'1'],
            'createdAt' => $md->created_at,
            'updatedAt' => $md->updated_at,
        ]);
    }

    public function updateMeetingDays(Request $request)
    {
        $md = MeetingDays::first();
        if (!$md) { $md = MeetingDays::create($request->all()); return response()->json($md, 201); }
        $md->update($request->all());
        return response()->json($md->fresh());
    }

    public function updateCalendarEvents(Request $request)
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $data = $request->input('calendarEvents', $request->all());
        $md->update(['calendarEvents' => $data]);
        return response()->json(['success' => true, 'calendarEvents' => $md->fresh()->calendarEvents]);
    }

    public function updateRecurringMeetings(Request $request)
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $md->update(['recurringMeetings' => $request->input('recurringMeetings', $md->recurringMeetings)]);
        return response()->json($md->fresh());
    }

    public function updateHero(Request $request)
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $md->update(['hero' => $request->input('hero')]);
        return response()->json(['success' => true, 'hero' => $md->fresh()->hero]);
    }

    public function updateUpcomingEvents(Request $request)
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $data = $request->input('upcomingEvents', $request->all());
        $md->update(['upcomingEvents' => $data]);
        return response()->json(['success' => true, 'upcomingEvents' => $md->fresh()->upcomingEvents]);
    }

    public function updateEventCta(Request $request)
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $md->update(['eventCta' => $request->input('eventCta')]);
        return response()->json(['success' => true, 'eventCta' => $md->fresh()->eventCta]);
    }

    public function updateEventSettings(Request $request)
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $md->update(['eventSettings' => $request->input('eventSettings', $md->eventSettings)]);
        return response()->json(['message' => 'Event settings actualizados']);
    }

    public function uploadHeroImage(Request $request)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No se proporcionó ninguna imagen'], 400);
        }

        $file = $request->file('image');
        $mime = $file->getMimeType();

        if (!str_starts_with($mime, 'image/')) {
            return response()->json(['error' => 'El archivo debe ser una imagen'], 400);
        }

        $md = MeetingDays::first() ?? MeetingDays::create([]);

        $md->heroImageData = file_get_contents($file->getRealPath());
        $md->heroImageMime = $mime;
        $md->heroImageName = $file->getClientOriginalName();
        $md->save();

        return response()->json([
            'message' => 'Imagen guardada en la base de datos',
            'heroImageName' => $md->heroImageName,
            'heroImageUrl' => '/api/meeting-days/hero-image',
        ]);
    }

    public function getHeroImage()
    {
        $md = MeetingDays::first();

        if (!$md || empty($md->heroImageData)) {
            return response()->json(['error' => 'No hay imagen guardada'], 404);
        }

        return response($md->heroImageData)
            ->header('Content-Type', $md->heroImageMime ?? 'image/jpeg')
            ->header('Content-Disposition', 'inline; filename="' . ($md->heroImageName ?? 'hero.jpg') . '"')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function deleteHeroImage()
    {
        $md = MeetingDays::first();
        if (!$md) return response()->json(['error' => 'No encontrado'], 404);

        $md->update([
            'heroImageData' => null,
            'heroImageMime' => null,
            'heroImageName' => null,
        ]);

        return response()->json(['message' => 'Imagen eliminada']);
    }
}

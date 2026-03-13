<?php

namespace App\Http\Controllers;

use App\Models\Home;
use App\Models\Contact;
use App\Models\Event;
use App\Models\Layout;
use App\Models\MeetingDays;
use App\Models\MeetingCardImage;
use App\Models\Ministries;
use App\Models\MinistryMedia;
use App\Models\MinistryVideo;
use App\Models\MinistryCardImage;
use App\Models\SectionIcon;
use App\Services\ThemeService;

class PublicController extends Controller
{
    public function getHomeConfig()
    {
        $home = Home::select(array_filter(
            (new Home())->getFillable(),
            fn($col) => !in_array($col, ['heroVideoData', 'heroVideo2Data', 'heroIconDomData', 'heroIconMierData'])
        ))->addSelect(['id', 'created_at', 'updated_at'])->first() ?? Home::create([]);
        $hasVideo = $home->id ? Home::where('id', $home->id)->where(function($q) {
            $q->whereNotNull('heroVideoData')->orWhereNotNull('heroVideo2Data');
        })->exists() : false;
        $theme = ThemeService::getCurrentThemeForToday();

        return response()->json([
            'id' => $home->id,
            'heroTitle' => $home->heroTitle,
            'heroButton1Text' => $home->heroButton1Text,
            'heroButton1Link' => $home->heroButton1Link,
            'heroButton2Text' => $home->heroButton2Text,
            'heroButton2Link' => $home->heroButton2Link,
            'heroVideoUrl' => '/api/home/current-video',
            'hasVideo' => $hasVideo,
            'hasIcon' => $home->id ? Home::where('id', $home->id)->where(function($q) {
                $q->whereNotNull('heroIconDomData')->orWhereNotNull('heroIconMierData');
            })->exists() : false,
            'celebrations' => $home->celebrations ?? [],
            'meetingDaysSummary' => $home->meetingDaysSummary,
            'ministriesSummary' => $this->enrichMinistriesSummary($home->ministriesSummary),
            'cardImages' => MeetingCardImage::select('cardIndex', 'imageName')->get()->keyBy('cardIndex'),
            'theme' => [
                'context' => $theme['context'],
                'videoUrl' => $theme['videoUrl'],
                'iconUrl' => $theme['iconUrl'],
                'palette' => $theme['palette'],
            ],
        ]);
    }

    private function enrichMinistriesSummary($summary)
    {
        if (!$summary) return $summary;

        // Nuevo formato: ministryIds → obtener ministerios desde la página Ministerios
        $ministryIds = $summary['ministryIds'] ?? null;
        if ($ministryIds && is_array($ministryIds)) {
            $ministryIds = array_slice(array_filter(array_map('strval', $ministryIds)), 0, 4);
            $mContent = Ministries::first();
            $allMinistries = collect($mContent->ministries ?? [])->keyBy(function ($m) {
                return (string) ($m['id'] ?? '');
            });
            $ministries = [];
            foreach ($ministryIds as $id) {
                $min = $allMinistries->get($id);
                if ($min) {
                    $ministries[] = $this->enrichMinistryWithMedia((array) $min);
                }
            }
            $summary['ministries'] = $ministries;
            return $summary;
        }

        // Formato legacy: ministries array
        if (isset($summary['ministries']) && is_array($summary['ministries'])) {
            $summary['ministries'] = collect($summary['ministries'])->map(function ($m) {
                $mid = $m['id'] ?? null;
                if ($mid) {
                    $enriched = $this->enrichMinistryWithMedia((array) $m);
                    return $enriched;
                }
                return $m;
            })->toArray();
        }
        return $summary;
    }

    private function enrichMinistryWithMedia(array $ministry): array
    {
        $mid = $ministry['id'] ?? null;
        if (!$mid) return $ministry;

        $hasIcon = MinistryMedia::where('ministryId', $mid)->where('mediaType', 'icon')->exists();
        if ($hasIcon) {
            $ministry['iconUrl'] = "/api/ministry/{$mid}/icon";
        }

        $hasCardImage = MinistryCardImage::where('ministryId', $mid)->exists();
        if ($hasCardImage) {
            $ministry['cardImageUrl'] = "/api/ministry/{$mid}/card-image";
        }

        $photos = MinistryMedia::where('ministryId', $mid)
            ->where('mediaType', 'photo')
            ->orderBy('sortOrder')
            ->select('id', 'imageName')
            ->get();
        if ($photos->isNotEmpty()) {
            $ministry['photos'] = $photos->map(fn($p) => [
                'id' => $p->id,
                'url' => "/api/ministry/{$mid}/photo/{$p->id}",
                'name' => $p->imageName,
            ])->toArray();
        }

        $internalVideos = MinistryVideo::where('ministryId', $mid)
            ->orderBy('sortOrder')
            ->select('id', 'videoName')
            ->get();
        if ($internalVideos->isNotEmpty()) {
            $ministry['internalVideos'] = $internalVideos->map(fn($v) => [
                'id' => $v->id,
                'url' => "/api/ministry/{$mid}/video/{$v->id}",
                'name' => $v->videoName,
            ])->toArray();
        }

        return $ministry;
    }

    public function getMinistriesConfig()
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $ministries = collect($m->ministries ?? [])->map(function ($min) {
            return $this->enrichMinistryWithMedia((array) $min);
        })->toArray();

        $pageContent = $m->pageContent ?? [];
        $pageContent['sectionIconUrl'] = SectionIcon::hasIcon('ministries', 'section') ? '/api/section-icon/ministries/section' : null;
        $pageContent['processIconUrl'] = SectionIcon::hasIcon('ministries', 'process') ? '/api/section-icon/ministries/process' : null;
        $pageContent['testimonialsIconUrl'] = SectionIcon::hasIcon('ministries', 'testimonials') ? '/api/section-icon/ministries/testimonials' : null;
        $pageContent['faqIconUrl'] = SectionIcon::hasIcon('ministries', 'faq') ? '/api/section-icon/ministries/faq' : null;

        return response()->json([
            'hero' => $m->hero,
            'ministries' => $ministries,
            'process' => $m->process,
            'testimonials' => $m->testimonials ?? [],
            'faqs' => $m->faqs ?? [],
            'pageContent' => $pageContent,
        ]);
    }

    public function getMinistryDetail(string $id)
    {
        $m = Ministries::first();
        if (!$m) return response()->json(['error' => 'No se encontraron ministerios'], 404);

        $list = $m->ministries ?? [];
        $ministry = collect($list)->firstWhere('id', $id);
        if (!$ministry) return response()->json(['error' => 'Ministerio no encontrado'], 404);

        $enriched = $this->enrichMinistryWithMedia((array) $ministry);
        return response()->json($enriched);
    }

    public function getMeetingDaysConfig()
    {
        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $events = Event::orderBy('date')->orderBy('time')->get();
        $now = now();
        $upcoming = $events->filter(fn($e) => $e->date && $e->date >= $now->toDateString());

        return response()->json([
            'hero' => $md->hero,
            'calendarEvents' => $md->calendarEvents,
            'upcomingEvents' => array_merge(
                $md->upcomingEvents ?? [],
                ['events' => $upcoming->map(fn($e) => [
                    'id' => $e->id, 'title' => $e->title, 'date' => $e->date,
                    'time' => $e->time, 'location' => $e->location,
                    'category' => $e->category, 'description' => $e->description,
                ])->values()->toArray()]
            ),
            'eventCta' => $md->eventCta,
            'recurringMeetings' => $md->recurringMeetings,
        ]);
    }

    public function getUpcomingEvents()
    {
        $events = Event::orderBy('date')->orderBy('time')->get();
        $now = now()->toDateString();
        $upcoming = $events->filter(fn($e) => $e->date && $e->date >= $now);
        $md = MeetingDays::first();

        return response()->json([
            'section' => $md?->upcomingEvents,
            'events' => $upcoming->values(),
        ]);
    }

    public function getCalendarEvents()
    {
        return response()->json(Event::orderBy('date')->orderBy('time')->get());
    }

    public function getContactConfig()
    {
        $c = Contact::first() ?? Contact::create([]);
        return response()->json([
            'id' => $c->id,
            'email' => $c->email,
            'phone' => $c->phone,
            'address' => $c->address,
            'city' => $c->city,
            'socialMedia' => $c->socialMedia,
            'schedules' => $c->schedules,
            'departments' => $c->departments,
            'mapEmbed' => $c->mapEmbed,
            'additionalInfo' => $c->additionalInfo,
            'pageContent' => $c->pageContent ?? [],
        ]);
    }

    public function getLayoutConfig()
    {
        $defaultNav = [
            ['label' => 'Inicio', 'path' => '/'],
            ['label' => 'Ministerios', 'path' => '/ministerios'],
            ['label' => 'Días de Reunión', 'path' => '/dias-reunion'],
            ['label' => 'Contacto', 'path' => '/contacto'],
        ];
        $defaultQuick = [
            ['label' => 'Días de Reunión', 'path' => '/dias-reunion'],
            ['label' => 'Ministerios', 'path' => '/ministerios'],
            ['label' => 'Contacto', 'path' => '/contacto'],
        ];

        $layout = Layout::first();
        if (!$layout) {
            $layout = Layout::create([
                'navLinks' => $defaultNav,
                'footerBrandTitle' => 'ÉL VIVE IGLESIA',
                'footerBrandDescription' => 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.',
                'footerFacebookUrl' => 'https://www.facebook.com/profile.php?id=100081093856222',
                'footerInstagramUrl' => 'https://www.instagram.com/elviveiglesia/',
                'footerYoutubeUrl' => 'https://www.youtube.com/@elviveiglesia',
                'footerAddress' => 'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
                'footerEmail' => 'elviveiglesia@gmail.com',
                'footerPhone' => '+54 (11) 503-621-41',
                'footerCopyright' => '© 2025 ÉL VIVE IGLESIA. Todos los derechos reservados.',
                'footerPrivacyUrl' => '#',
                'footerTermsUrl' => '#',
                'quickLinks' => $defaultQuick,
            ]);
        }

        return response()->json([
            'navLinks' => $layout->navLinks ?? $defaultNav,
            'footerBrandTitle' => $layout->footerBrandTitle ?? 'ÉL VIVE IGLESIA',
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
            'quickLinks' => $layout->quickLinks ?? $defaultQuick,
        ]);
    }
}

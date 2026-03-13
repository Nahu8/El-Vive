<?php

namespace App\Http\Controllers;

use App\Models\Ministries;
use App\Models\SectionIcon;
use Illuminate\Http\Request;

class MinistriesController extends Controller
{
    public function getMinistries()
    {
        $m = Ministries::first();
        if (!$m) $m = Ministries::create([]);

        $pageContent = $m->pageContent ?? [];
        $pageContent['sectionIconUrl'] = SectionIcon::hasIcon('ministries', 'section') ? '/api/section-icon/ministries/section' : null;
        $pageContent['processIconUrl'] = SectionIcon::hasIcon('ministries', 'process') ? '/api/section-icon/ministries/process' : null;
        $pageContent['testimonialsIconUrl'] = SectionIcon::hasIcon('ministries', 'testimonials') ? '/api/section-icon/ministries/testimonials' : null;
        $pageContent['faqIconUrl'] = SectionIcon::hasIcon('ministries', 'faq') ? '/api/section-icon/ministries/faq' : null;

        return response()->json([
            'id' => $m->id,
            'hero' => $m->hero,
            'ministries' => $m->ministries ?? [],
            'process' => $m->process,
            'testimonials' => $m->testimonials ?? [],
            'faqs' => $m->faqs ?? [],
            'pageContent' => $pageContent,
            'createdAt' => $m->created_at,
            'updatedAt' => $m->updated_at,
        ]);
    }

    public function updateMinistries(Request $request)
    {
        $m = Ministries::first();
        if (!$m) { $m = Ministries::create($request->all()); return response()->json($m, 201); }
        $m->update($request->all());
        return response()->json($m->fresh());
    }

    public function updateHero(Request $request)
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $m->update(['hero' => $request->input('hero', $m->hero)]);
        return response()->json($m->fresh());
    }

    public function updateMinistriesList(Request $request)
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $m->update(['ministries' => $request->input('ministries', [])]);
        return response()->json($m->fresh());
    }

    public function updateProcess(Request $request)
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $m->update(['process' => $request->input('process', $m->process)]);
        return response()->json($m->fresh());
    }

    public function updateTestimonials(Request $request)
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $m->update(['testimonials' => $request->input('testimonials', [])]);
        return response()->json($m->fresh());
    }

    public function updateFAQs(Request $request)
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $m->update(['faqs' => $request->input('faqs', [])]);
        return response()->json($m->fresh());
    }

    public function updatePageContent(Request $request)
    {
        $m = Ministries::first() ?? Ministries::create([]);
        $m->update(['pageContent' => $request->input('pageContent', $m->pageContent)]);
        return response()->json($m->fresh());
    }
}

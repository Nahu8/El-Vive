<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\LayoutController;
use App\Http\Controllers\MeetingDaysController;
use App\Http\Controllers\MinistriesController;
use App\Http\Controllers\MinistryMediaController;
use App\Http\Controllers\MinistryVideoController;
use App\Http\Controllers\EventMediaController;
use App\Http\Controllers\SectionIconController;
use App\Models\Event;
use App\Models\Ministry;
use App\Models\ContactMessage;

// ==================== HOME (BackOffice) ====================
Route::get('/home', [HomeController::class, 'getHome']);
Route::put('/home', [HomeController::class, 'updateHome']);
Route::patch('/home/hero', [HomeController::class, 'updateHero']);
Route::post('/home/video', [HomeController::class, 'uploadHeroVideo']);
Route::get('/home/video', [HomeController::class, 'getHeroVideo']);
Route::delete('/home/video', [HomeController::class, 'deleteHeroVideo']);
Route::post('/home/video2', [HomeController::class, 'uploadHeroVideo2']);
Route::get('/home/video2', [HomeController::class, 'getHeroVideo2']);
Route::delete('/home/video2', [HomeController::class, 'deleteHeroVideo2']);
Route::get('/home/current-video', [HomeController::class, 'getCurrentVideo']);
Route::post('/home/icon-dom', [HomeController::class, 'uploadIconDom']);
Route::get('/home/icon-dom', [HomeController::class, 'getIconDom']);
Route::delete('/home/icon-dom', [HomeController::class, 'deleteIconDom']);
Route::post('/home/icon-mier', [HomeController::class, 'uploadIconMier']);
Route::get('/home/icon-mier', [HomeController::class, 'getIconMier']);
Route::delete('/home/icon-mier', [HomeController::class, 'deleteIconMier']);
Route::get('/home/current-icon', [HomeController::class, 'getCurrentIcon']);
Route::post('/home/card-image/{index}', [HomeController::class, 'uploadCardImage']);
Route::get('/home/card-image/{index}', [HomeController::class, 'getCardImage']);
Route::delete('/home/card-image/{index}', [HomeController::class, 'deleteCardImage']);
Route::patch('/home/celebrations', [HomeController::class, 'updateCelebrations']);
Route::patch('/home/meeting-days-summary', [HomeController::class, 'updateMeetingDaysSummary']);
Route::patch('/home/ministries-summary', [HomeController::class, 'updateMinistriesSummary']);

// ==================== MEETING DAYS ====================
Route::get('/meeting-days', [MeetingDaysController::class, 'getMeetingDays']);
Route::put('/meeting-days', [MeetingDaysController::class, 'updateMeetingDays']);
Route::patch('/meeting-days/hero', [MeetingDaysController::class, 'updateHero']);
Route::patch('/meeting-days/calendar-events', [MeetingDaysController::class, 'updateCalendarEvents']);
Route::patch('/meeting-days/upcoming-events', [MeetingDaysController::class, 'updateUpcomingEvents']);
Route::patch('/meeting-days/event-cta', [MeetingDaysController::class, 'updateEventCta']);
Route::patch('/meeting-days/recurring-meetings', [MeetingDaysController::class, 'updateRecurringMeetings']);
Route::patch('/meeting-days/event-settings', [MeetingDaysController::class, 'updateEventSettings']);
Route::post('/meeting-days/hero-image', [MeetingDaysController::class, 'uploadHeroImage']);
Route::get('/meeting-days/hero-image', [MeetingDaysController::class, 'getHeroImage']);
Route::delete('/meeting-days/hero-image', [MeetingDaysController::class, 'deleteHeroImage']);

// ==================== EVENT MEDIA (icon & background for calendar events) ====================
Route::post('/event/{eventId}/icon', [EventMediaController::class, 'uploadIcon']);
Route::get('/event/{eventId}/icon', [EventMediaController::class, 'getIcon']);
Route::delete('/event/{eventId}/icon', [EventMediaController::class, 'deleteIcon']);
Route::post('/event/{eventId}/background', [EventMediaController::class, 'uploadBackground']);
Route::get('/event/{eventId}/background', [EventMediaController::class, 'getBackground']);
Route::delete('/event/{eventId}/background', [EventMediaController::class, 'deleteBackground']);

// ==================== SECTION ICONS (opcional PNG para títulos de sección) ====================
Route::post('/section-icon/{pageKey}/{sectionKey}', [SectionIconController::class, 'upload']);
Route::get('/section-icon/{pageKey}/{sectionKey}', [SectionIconController::class, 'getIcon']);
Route::delete('/section-icon/{pageKey}/{sectionKey}', [SectionIconController::class, 'deleteIcon']);

// ==================== MINISTRIES CONTENT ====================
Route::get('/ministries-content', [MinistriesController::class, 'getMinistries']);
Route::put('/ministries-content', [MinistriesController::class, 'updateMinistries']);
Route::patch('/ministries-content/hero', [MinistriesController::class, 'updateHero']);
Route::patch('/ministries-content/ministries', [MinistriesController::class, 'updateMinistriesList']);
Route::patch('/ministries-content/process', [MinistriesController::class, 'updateProcess']);
Route::patch('/ministries-content/testimonials', [MinistriesController::class, 'updateTestimonials']);
Route::patch('/ministries-content/faqs', [MinistriesController::class, 'updateFAQs']);
Route::patch('/ministries-content/page-content', [MinistriesController::class, 'updatePageContent']);

// ==================== MINISTRY MEDIA ====================
Route::get('/ministry/{ministryId}/media', [MinistryMediaController::class, 'listMedia']);
Route::post('/ministry/{ministryId}/icon', [MinistryMediaController::class, 'uploadIcon']);
Route::get('/ministry/{ministryId}/icon', [MinistryMediaController::class, 'getIcon']);
Route::delete('/ministry/{ministryId}/icon', [MinistryMediaController::class, 'deleteIcon']);
Route::post('/ministry/{ministryId}/photo', [MinistryMediaController::class, 'uploadPhoto']);
Route::get('/ministry/{ministryId}/photo/{photoId}', [MinistryMediaController::class, 'getPhoto']);
Route::delete('/ministry/{ministryId}/photo/{photoId}', [MinistryMediaController::class, 'deletePhoto']);
Route::post('/ministry/{ministryId}/video', [MinistryVideoController::class, 'uploadVideo']);
Route::get('/ministry/{ministryId}/video/{videoId}', [MinistryVideoController::class, 'getVideo']);
Route::delete('/ministry/{ministryId}/video/{videoId}', [MinistryVideoController::class, 'deleteVideo']);
Route::post('/ministry/{ministryId}/card-image', [MinistryMediaController::class, 'uploadCardImage']);
Route::get('/ministry/{ministryId}/card-image', [MinistryMediaController::class, 'getCardImage']);
Route::delete('/ministry/{ministryId}/card-image', [MinistryMediaController::class, 'deleteCardImage']);

// ==================== CONTACT INFO ====================
Route::get('/contact-info', [ContactController::class, 'getContact']);
Route::put('/contact-info', [ContactController::class, 'updateContact']);
Route::patch('/contact-info/basic', [ContactController::class, 'updateBasicInfo']);
Route::patch('/contact-info/social-media', [ContactController::class, 'updateSocialMedia']);
Route::patch('/contact-info/schedules', [ContactController::class, 'updateSchedules']);
Route::patch('/contact-info/departments', [ContactController::class, 'updateDepartments']);
Route::patch('/contact-info/page-content', [ContactController::class, 'updatePageContent']);

// ==================== LAYOUT ====================
Route::get('/layout', [LayoutController::class, 'getLayout']);
Route::put('/layout', [LayoutController::class, 'updateLayout']);
Route::patch('/layout', [LayoutController::class, 'updateLayout']);

// ==================== EVENTS (Legacy CRUD) ====================
Route::get('/events', fn() => response()->json(Event::orderBy('created_at', 'desc')->get()));
Route::post('/events', fn() => response()->json(Event::create(request()->all()), 201));
Route::put('/events/{id}', function ($id) {
    $e = Event::findOrFail($id); $e->update(request()->all()); return response()->json($e->fresh());
});
Route::delete('/events/{id}', function ($id) {
    Event::findOrFail($id)->delete(); return response()->json(['message' => 'Evento eliminado exitosamente']);
});

// ==================== MINISTRIES (Legacy CRUD) ====================
Route::get('/ministries', fn() => response()->json(Ministry::all()));
Route::post('/ministries', fn() => response()->json(Ministry::create(request()->all()), 201));
Route::put('/ministries/{id}', function ($id) {
    $m = Ministry::findOrFail($id); $m->update(request()->all()); return response()->json($m->fresh());
});
Route::delete('/ministries/{id}', function ($id) {
    Ministry::findOrFail($id)->delete(); return response()->json(['message' => 'Ministerio eliminado exitosamente']);
});

// ==================== CONTACT MESSAGES ====================
Route::post('/contact', function () {
    $msg = ContactMessage::create(request()->all());
    return response()->json(['message' => 'Mensaje enviado exitosamente', 'contact' => $msg], 201);
});
Route::get('/contact', fn() => response()->json(ContactMessage::orderBy('created_at', 'desc')->get()));
Route::get('/contact/{id}', fn($id) => response()->json(ContactMessage::findOrFail($id)));
Route::delete('/contact/{id}', function ($id) {
    ContactMessage::findOrFail($id)->delete(); return response()->json(['message' => 'Mensaje eliminado exitosamente']);
});

// ==================== MEDIA (Upload) ====================
Route::post('/media/upload', [MediaController::class, 'uploadMedia']);
Route::post('/media/upload-icon', [MediaController::class, 'uploadMedia']);
Route::get('/media', [MediaController::class, 'listMedia']);
Route::delete('/media/{id}', [MediaController::class, 'deleteMedia']);

// ==================== HEALTH ====================
Route::get('/health', fn() => response()->json(['status' => 'OK', 'message' => 'API funcionando correctamente', 'database' => 'MySQL']));

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingDays extends Model
{
    protected $table = 'meeting_days';

    protected $fillable = [
        'calendarEvents', 'recurringMeetings', 'hero',
        'heroImageData', 'heroImageMime', 'heroImageName',
        'upcomingEvents', 'eventCta', 'eventSettings',
    ];

    protected $hidden = [
        'heroImageData',
    ];

    protected $casts = [
        'calendarEvents' => 'array',
        'recurringMeetings' => 'array',
        'hero' => 'array',
        'upcomingEvents' => 'array',
        'eventCta' => 'array',
        'eventSettings' => 'array',
    ];
}

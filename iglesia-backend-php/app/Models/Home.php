<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Home extends Model
{
    protected $fillable = [
        'heroTitle', 'heroButton1Text', 'heroButton1Link',
        'heroButton2Text', 'heroButton2Link', 'heroVideoUrl',
        'heroVideoData', 'heroVideoMime', 'heroVideoName',
        'heroVideo2Data', 'heroVideo2Mime', 'heroVideo2Name',
        'heroIconDomData', 'heroIconDomMime', 'heroIconDomName',
        'heroIconMierData', 'heroIconMierMime', 'heroIconMierName',
        'video1Url', 'video2Url', 'currentTheme',
        'celebrations', 'meetingDaysSummary', 'ministriesSummary',
    ];

    protected $hidden = [
        'heroVideoData',
        'heroVideo2Data',
        'heroIconDomData',
        'heroIconMierData',
    ];

    protected $casts = [
        'celebrations' => 'array',
        'meetingDaysSummary' => 'array',
        'ministriesSummary' => 'array',
        'currentTheme' => 'integer',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MinistryVideo extends Model
{
    protected $table = 'ministry_videos';

    protected $fillable = [
        'ministryId', 'videoData', 'videoMime', 'videoName', 'sortOrder',
    ];

    protected $hidden = ['videoData'];
}

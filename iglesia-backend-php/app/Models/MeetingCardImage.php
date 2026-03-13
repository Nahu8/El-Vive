<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingCardImage extends Model
{
    protected $table = 'meeting_card_images';

    protected $fillable = [
        'cardIndex', 'imageData', 'imageMime', 'imageName',
    ];

    protected $hidden = [
        'imageData',
    ];
}

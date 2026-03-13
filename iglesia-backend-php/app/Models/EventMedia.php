<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventMedia extends Model
{
    protected $table = 'event_media';

    protected $fillable = ['eventId', 'mediaType', 'imageData', 'imageMime', 'imageName'];

    protected $hidden = ['imageData'];
}

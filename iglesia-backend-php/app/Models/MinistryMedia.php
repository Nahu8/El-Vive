<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MinistryMedia extends Model
{
    protected $table = 'ministry_media';

    protected $fillable = [
        'ministryId', 'mediaType', 'imageData', 'imageMime', 'imageName', 'sortOrder',
    ];

    protected $hidden = ['imageData'];
}

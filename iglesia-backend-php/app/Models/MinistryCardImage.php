<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MinistryCardImage extends Model
{
    protected $table = 'ministry_card_images';

    protected $fillable = ['ministryId', 'imageData', 'imageMime', 'imageName'];

    protected $hidden = ['imageData'];
}

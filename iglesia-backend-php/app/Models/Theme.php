<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Theme extends Model
{
    protected $fillable = [
        'name', 'videoUrl1', 'videoUrl2',
        'iconUrl1', 'iconUrl2', 'palette1', 'palette2',
    ];

    protected $casts = [
        'palette1' => 'array',
        'palette2' => 'array',
    ];
}

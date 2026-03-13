<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'email', 'phone', 'address', 'city',
        'socialMedia', 'schedules', 'departments',
        'mapEmbed', 'additionalInfo', 'pageContent',
    ];

    protected $casts = [
        'socialMedia' => 'array',
        'schedules' => 'array',
        'departments' => 'array',
        'pageContent' => 'array',
    ];
}

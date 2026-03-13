<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ministries extends Model
{
    protected $table = 'ministries_content';

    protected $fillable = [
        'hero', 'ministries', 'statistics',
        'process', 'testimonials', 'faqs', 'pageContent',
    ];

    protected $casts = [
        'hero' => 'array',
        'ministries' => 'array',
        'statistics' => 'array',
        'process' => 'array',
        'testimonials' => 'array',
        'faqs' => 'array',
        'pageContent' => 'array',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Layout extends Model
{
    protected $fillable = [
        'navLinks', 'footerBrandTitle', 'footerBrandDescription',
        'footerFacebookUrl', 'footerInstagramUrl', 'footerYoutubeUrl',
        'footerAddress', 'footerEmail', 'footerPhone',
        'footerCopyright', 'footerPrivacyUrl', 'footerTermsUrl',
        'quickLinks',
    ];

    protected $casts = [
        'navLinks' => 'array',
        'quickLinks' => 'array',
    ];
}

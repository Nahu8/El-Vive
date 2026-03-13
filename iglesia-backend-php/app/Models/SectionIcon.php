<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SectionIcon extends Model
{
    protected $table = 'section_icons';

    protected $fillable = ['page_key', 'section_key', 'imageData', 'imageMime', 'imageName'];

    protected $hidden = ['imageData'];

    public static function hasIcon(string $pageKey, string $sectionKey): bool
    {
        return static::where('page_key', $pageKey)
            ->where('section_key', $sectionKey)
            ->whereNotNull('imageData')
            ->exists();
    }
}

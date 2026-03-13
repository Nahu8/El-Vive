<?php

namespace App\Services;

use App\Models\Home;
use App\Models\Theme;

class ThemeService
{
    public static function getArgentinaNow(): \DateTime
    {
        try {
            return new \DateTime('now', new \DateTimeZone('America/Argentina/Buenos_Aires'));
        } catch (\Exception) {
            return new \DateTime();
        }
    }

    public static function getDayVariant(\DateTime $date): array
    {
        $day = (int)$date->format('w');

        if (in_array($day, [4, 5, 6, 0])) {
            return ['variant' => 1, 'label' => 'thursdayToSunday'];
        }
        if (in_array($day, [1, 3])) {
            return ['variant' => 2, 'label' => 'mondayWednesday'];
        }
        return ['variant' => 1, 'label' => 'default'];
    }

    public static function getCurrentThemeForToday(): array
    {
        $now = self::getArgentinaNow();
        $dayInfo = self::getDayVariant($now);
        $variant = $dayInfo['variant'];
        $label = $dayInfo['label'];

        $home = Home::first();
        if (!$home) {
            $home = Home::create([]);
        }

        $theme = null;
        if ($home->currentTheme) {
            $theme = Theme::find($home->currentTheme);
        }
        if (!$theme) {
            $theme = Theme::first();
        }

        if (!$theme) {
            return [
                'context' => ['variant' => $variant, 'variantLabel' => $label, 'now' => $now->format('c')],
                'videoUrl' => null,
                'iconUrl' => null,
                'palette' => null,
                'theme' => null,
            ];
        }

        $useFirst = $variant === 1;

        $themeVideoUrl = $useFirst
            ? ($home->video1Url ?: $theme->videoUrl1 ?: null)
            : ($home->video2Url ?: $theme->videoUrl2 ?: null);

        $iconUrl = $useFirst ? ($theme->iconUrl1 ?: null) : ($theme->iconUrl2 ?: null);
        $palette = $useFirst ? $theme->palette1 : $theme->palette2;

        return [
            'context' => ['variant' => $variant, 'variantLabel' => $label, 'now' => $now->format('c')],
            'videoUrl' => $themeVideoUrl,
            'iconUrl' => $iconUrl,
            'palette' => $palette,
            'theme' => $theme->toArray(),
        ];
    }
}

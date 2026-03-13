<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Home;
use App\Models\Layout;
use App\Models\MeetingDays;
use App\Models\Ministries;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('username', 'superadmin23380')->exists()) {
            User::create([
                'username' => 'superadmin23380',
                'password' => Hash::make('MultimediaMinisterialElvive08!'),
                'role' => 'superadmin',
            ]);
            $this->command->info('Superadmin creado.');
        }

        $home = Home::first() ?? Home::create([]);
        $home->update([
            'heroTitle' => 'ÉL VIVE IGLESIA',
            'heroButton1Text' => 'VER EVENTOS',
            'heroButton1Link' => '/dias-reunion',
            'heroButton2Text' => 'CONOCE MÁS',
            'heroButton2Link' => '/contacto',
            'heroVideoUrl' => '',
            'celebrations' => [
                ['title' => 'CELEBRACIÓN', 'subtitle' => 'Título de Celebración', 'description' => 'Bajada o descripción de la celebración.', 'videoId' => '3wuQUvXiLv8', 'startTime' => 0],
                ['title' => 'SOBRE LA ROCA', 'subtitle' => 'Título de Sobre la Roca', 'description' => 'Bajada o descripción sobre este ministerio.', 'videoId' => '2O1cS9zjM90', 'startTime' => 0],
                ['title' => 'SANTA CENA', 'subtitle' => 'Título de Santa Cena', 'description' => 'Bajada o descripción sobre la Santa Cena.', 'videoId' => '94Dje21syOA', 'startTime' => 57],
            ],
            'meetingDaysSummary' => [
                'sectionTitle' => 'DÍAS DE REUNIÓN',
                'sectionSubtitle' => 'Próximas reuniones y horarios — mantente al tanto.',
                'meetings' => [
                    ['day' => 'Miércoles', 'title' => 'SLR', 'time' => '19:00', 'note' => 'Servicio y estudio', 'colorFrom' => '#4f46e5', 'colorTo' => '#ec4899'],
                    ['day' => 'Sábado', 'title' => 'Escuelita Bíblica', 'time' => '10:00', 'note' => 'Ministerio infantil', 'colorFrom' => '#3b82f6', 'colorTo' => '#8b5cf6'],
                    ['day' => 'Domingo', 'title' => 'Celebración', 'time' => '10:00', 'note' => 'Servicio dominical', 'colorFrom' => '#ec4899', 'colorTo' => '#f59e0b'],
                ],
            ],
            'ministriesSummary' => [
                'sectionTitle' => 'NUESTROS MINISTERIOS',
                'sectionSubtitle' => 'Descubre cómo puedes servir y crecer en nuestra comunidad.',
                'ministries' => [
                    ['id' => '1', 'name' => 'Ministerio Escuela Bíblica', 'description' => 'Enseñanza bíblica formativa.', 'iconUrl' => '', 'image' => ''],
                    ['id' => '2', 'name' => 'Ministerio Efraín', 'description' => 'Acompañamiento pastoral.', 'iconUrl' => '', 'image' => ''],
                    ['id' => '3', 'name' => 'Ministerio de Jóvenes', 'description' => 'Encuentros y actividades para jóvenes.', 'iconUrl' => '', 'image' => ''],
                    ['id' => '4', 'name' => 'Remendando Redes', 'description' => 'Apoyo y reinserción social.', 'iconUrl' => '', 'image' => ''],
                ],
            ],
        ]);
        $this->command->info('Home cargado.');

        $contact = Contact::first() ?? Contact::create([]);
        $contact->update([
            'email' => 'elviveiglesia@gmail.com',
            'phone' => '+54 (11) 503-621-41',
            'address' => 'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
            'city' => 'La Matanza, Buenos Aires, Argentina',
            'schedules' => ['sunday' => '10:00 AM - 12:00 PM', 'wednesday' => '7:00 PM - 9:00 PM'],
            'departments' => [],
            'additionalInfo' => 'Estamos aquí para servirte.',
        ]);
        $this->command->info('Contact cargado.');

        $layout = Layout::first() ?? Layout::create([]);
        $layout->update([
            'navLinks' => [['label'=>'Inicio','path'=>'/'],['label'=>'Ministerios','path'=>'/ministerios'],['label'=>'Días de Reunión','path'=>'/dias-reunion'],['label'=>'Contacto','path'=>'/contacto']],
            'footerBrandTitle' => 'ÉL VIVE IGLESIA',
            'footerBrandDescription' => 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.',
            'footerFacebookUrl' => 'https://www.facebook.com/profile.php?id=100081093856222',
            'footerInstagramUrl' => 'https://www.instagram.com/elviveiglesia/',
            'footerYoutubeUrl' => 'https://www.youtube.com/@elviveiglesia',
            'footerAddress' => 'Juan Manuel de Rosas 23.380, Ruta 3, Km 40. Virrey del Pino.',
            'footerEmail' => 'elviveiglesia@gmail.com',
            'footerPhone' => '+54 (11) 503-621-41',
            'footerCopyright' => '© 2025 ÉL VIVE IGLESIA. Todos los derechos reservados.',
            'footerPrivacyUrl' => '#',
            'footerTermsUrl' => '#',
            'quickLinks' => [['label'=>'Días de Reunión','path'=>'/dias-reunion'],['label'=>'Ministerios','path'=>'/ministerios'],['label'=>'Contacto','path'=>'/contacto']],
        ]);
        $this->command->info('Layout cargado.');

        $md = MeetingDays::first() ?? MeetingDays::create([]);
        $md->update([
            'hero' => ['badgeText' => 'Calendario en tiempo real', 'title' => 'CALENDARIO DE EVENTOS', 'subtitle' => 'Planifica tu participación en nuestras reuniones y eventos especiales'],
            'calendarEvents' => ['sectionTitle' => 'CALENDARIO DE EVENTOS', 'sectionSubtitle' => 'Planifica tu participación', 'events' => []],
            'upcomingEvents' => ['sectionTitle' => 'Próximos Eventos', 'sectionSubtitle' => 'No te pierdas los eventos de los próximos días', 'events' => []],
            'eventCta' => ['badgeText' => '¿Tienes un evento?', 'title' => '¿Quieres programar un evento especial?', 'description' => 'Contáctanos.', 'buttonText' => 'Contactar coordinador', 'buttonLink' => '/contacto'],
        ]);
        $this->command->info('Meeting Days cargado.');

        $min = Ministries::first() ?? Ministries::create([]);
        $min->update([
            'hero' => ['badgeText' => 'Ministerios', 'title' => 'NUESTROS MINISTERIOS', 'subtitle' => 'Descubre cómo puedes servir.'],
            'ministries' => [
                ['id'=>'1','name'=>'Ministerio Escuela Bíblica','description'=>'Enseñanza bíblica formativa.','iconUrl'=>'','image'=>''],
                ['id'=>'2','name'=>'Ministerio Efraín','description'=>'Acompañamiento pastoral.','iconUrl'=>'','image'=>''],
                ['id'=>'3','name'=>'Ministerio de Jóvenes','description'=>'Encuentros para jóvenes.','iconUrl'=>'','image'=>''],
                ['id'=>'4','name'=>'Remendando Redes','description'=>'Apoyo y reinserción social.','iconUrl'=>'','image'=>''],
            ],
            'process' => ['title' => 'Cómo Unirte', 'subtitle' => '', 'steps' => []],
            'testimonials' => [],
            'faqs' => [],
        ]);
        $this->command->info('Ministries cargado.');

        $theme = Theme::first() ?? Theme::create(['name' => 'theme1']);
        $this->command->info('Theme cargado.');

        $this->command->info('Seed completado.');
    }
}

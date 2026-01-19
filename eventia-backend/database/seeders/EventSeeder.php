<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'title' => 'Conferencia de Tecnología 2026',
                'description' => 'Únete a la conferencia tecnológica más grande del año. Expertos de la industria compartirán las últimas tendencias en IA, Cloud Computing y Desarrollo Web.',
                'date_time' => Carbon::now()->addDays(15)->setTime(10, 0),
                'capacity' => 500,
                'modality' => 'Presencial',
                'location' => 'Centro de Convenciones - Sala Principal',
                'is_cancelled' => false,
            ],
            [
                'title' => 'Workshop de React y TypeScript',
                'description' => 'Aprende a construir aplicaciones modernas con React 19 y TypeScript. Incluye práctica hands-on y material descargable.',
                'date_time' => Carbon::now()->addDays(7)->setTime(14, 30),
                'capacity' => 50,
                'modality' => 'Virtual',
                'location' => 'Zoom - Link será enviado por email',
                'is_cancelled' => false,
            ],
            [
                'title' => 'Hackathon Universitario 2026',
                'description' => '24 horas de código intensivo. Forma tu equipo y compite por premios increíbles mientras resuelves problemas reales.',
                'date_time' => Carbon::now()->addDays(30)->setTime(9, 0),
                'capacity' => 200,
                'modality' => 'Híbrido',
                'location' => 'Campus Universitario + Streaming Online',
                'is_cancelled' => false,
            ],
            [
                'title' => 'Meetup de DevOps y CI/CD',
                'description' => 'Networking y charlas sobre las mejores prácticas en DevOps, Docker, Kubernetes y automatización de despliegues.',
                'date_time' => Carbon::now()->addDays(10)->setTime(18, 0),
                'capacity' => 80,
                'modality' => 'Presencial',
                'location' => 'Hub de Innovación - Piso 3',
                'is_cancelled' => false,
            ],
            [
                'title' => 'Curso Online: Laravel Avanzado',
                'description' => 'Domina las características avanzadas de Laravel: Queue Jobs, Broadcasting, Testing y optimización de performance.',
                'date_time' => Carbon::now()->addDays(20)->setTime(16, 0),
                'capacity' => 150,
                'modality' => 'Virtual',
                'location' => 'Plataforma de e-learning',
                'is_cancelled' => false,
            ],
            [
                'title' => 'Feria de Emprendimiento Digital',
                'description' => 'Conoce startups innovadoras, inversionistas y oportunidades de networking. Presenta tu proyecto y recibe feedback de expertos.',
                'date_time' => Carbon::now()->addDays(25)->setTime(11, 0),
                'capacity' => 300,
                'modality' => 'Híbrido',
                'location' => 'Parque Tecnológico + Streaming',
                'is_cancelled' => false,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}

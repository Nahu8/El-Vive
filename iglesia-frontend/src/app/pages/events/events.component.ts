import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-events',
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    // Datos de ejemplo - en producción vendrían del API
    this.events = [
      {
        title: 'Servicio Dominical',
        date: 'Todos los Domingos',
        time: '10:00 AM',
        location: 'Templo Principal',
        category: 'Adoración',
        description: 'Únete a nosotros para adoración, enseñanza y comunión.'
      },
      {
        title: 'Estudio Bíblico',
        date: 'Miércoles',
        time: '7:00 PM',
        location: 'Salón de Estudios',
        category: 'Enseñanza',
        description: 'Estudio profundo de la palabra de Dios en comunidad.'
      },
      {
        title: 'Reunión de Jóvenes',
        date: 'Viernes',
        time: '7:00 PM',
        location: 'Salón de Jóvenes',
        category: 'Jóvenes',
        description: 'Reunión para jóvenes con música, enseñanza y compañerismo.'
      },
      {
        title: 'Grupo de Oración',
        date: 'Lunes',
        time: '6:00 PM',
        location: 'Capilla',
        category: 'Oración',
        description: 'Tiempo de oración y intercesión por nuestras necesidades.'
      },
      {
        title: 'Escuela Dominical',
        date: 'Domingos',
        time: '9:00 AM',
        location: 'Aulas',
        category: 'Educación',
        description: 'Clases bíblicas para todas las edades.'
      },
      {
        title: 'Concierto de Alabanza',
        date: '15 de Diciembre',
        time: '7:00 PM',
        location: 'Templo Principal',
        category: 'Música',
        description: 'Noche especial de alabanza y adoración.'
      }
    ];
  }
}

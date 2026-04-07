import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Evento } from '../../services/data.service';

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-eventos.component.html',
  styleUrls: ['./admin-eventos.component.css']
})
export class AdminEventosComponent implements OnInit {
  eventos: Evento[] = [];
  showForm = false;
  editingId: string | null = null;
  form: Evento = { id: '', day: '', title: '', time: '', note: '' };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.eventos = this.dataService.getEventos();
  }

  openForm(evento?: Evento): void {
    if (evento) {
      this.editingId = evento.id;
      this.form = { ...evento };
    } else {
      this.editingId = null;
      this.form = { id: '', day: '', title: '', time: '', note: '' };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = { id: '', day: '', title: '', time: '', note: '' };
  }

  save(): void {
    if (!this.form.day.trim() || !this.form.title.trim() || !this.form.time.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    if (this.editingId) {
      this.dataService.updateEvento(this.editingId, this.form);
    } else {
      this.dataService.addEvento(this.form);
    }

    this.loadEventos();
    this.closeForm();
  }

  delete(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.dataService.deleteEvento(id);
      this.loadEventos();
    }
  }
}

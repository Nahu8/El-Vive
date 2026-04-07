import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-float.component.html',
  styleUrls: ['./whatsapp-float.component.css']
})
export class WhatsappFloatComponent implements OnInit {
  whatsappNumber = '';

  constructor(private publicApi: PublicApiService) {}

  ngOnInit() {
    this.publicApi.getLayoutConfig().subscribe({
      next: (data) => {
        this.whatsappNumber = (data.whatsappNumber || '').replace(/\D/g, '');
      }
    });
  }

  getWhatsAppUrl(): string {
    if (!this.whatsappNumber) return '#';
    const num = this.whatsappNumber.replace(/\D/g, '');
    const code = num.startsWith('54') ? num : '54' + num;
    return `https://wa.me/${code}`;
  }

  get show(): boolean {
    return !!this.whatsappNumber;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css']
})
export class MantenimientoComponent implements OnInit {
  brandTitle = 'ÉL VIVE';

  constructor(private publicApi: PublicApiService) {}

  ngOnInit(): void {
    this.publicApi
      .getLayoutConfig()
      .pipe(take(1))
      .subscribe({
        next: (layout) => {
          const t = layout?.footerBrandTitle?.trim();
          if (t) this.brandTitle = t;
        },
        error: () => {}
      });
  }
}


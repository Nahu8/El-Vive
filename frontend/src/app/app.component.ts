import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { WhatsappFloatComponent } from './components/whatsapp-float/whatsapp-float.component';
import { ThemeService } from './services/theme.service';
import { SeoService } from './services/seo.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    WhatsappFloatComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showHeaderFooter = true;

  constructor(
    public router: Router,
    public themeService: ThemeService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.init();
    this.themeService.loadTheme();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const p = event.url.split('?')[0];
      this.showHeaderFooter = !p.startsWith('/admin') && !p.startsWith('/mantenimiento');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DEFAULT_SEO, ROUTE_SEO, SeoConfig } from '../seo/seo.config';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);

  private readonly defaultOgImage = '/assets/imagenes/elvive.png';

  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.applyRouteSeo());

    this.applyRouteSeo();
  }

  applyRouteSeo(): void {
    const path = this.router.url.split('?')[0].replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    if (segments[0] === 'ministerios' && segments[1]) return;

    const key = segments[0] || '';
    this.update(ROUTE_SEO[key] ?? DEFAULT_SEO, key ? `/${key}` : '/');
  }

  update(config: SeoConfig, path = '/'): void {
    const siteUrl = this.siteOrigin();
    const canonical = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const ogImage = `${siteUrl}${this.defaultOgImage}`;

    this.title.setTitle(config.title);
    this.setMeta('name', 'description', config.description);
    if (config.keywords) this.setMeta('name', 'keywords', config.keywords);
    this.setMeta('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow');

    this.setMeta('property', 'og:title', config.title);
    this.setMeta('property', 'og:description', config.description);
    this.setMeta('property', 'og:type', config.ogType ?? 'website');
    this.setMeta('property', 'og:url', canonical);
    this.setMeta('property', 'og:image', ogImage);
    this.setMeta('property', 'og:locale', 'es_AR');
    this.setMeta('property', 'og:site_name', 'Él Vive Iglesia');

    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', config.title);
    this.setMeta('name', 'twitter:description', config.description);
    this.setMeta('name', 'twitter:image', ogImage);

    this.setLink('canonical', canonical);
  }

  updateMinistryDetail(name: string, description: string, id: string): void {
    const desc = (description || `Ministerio ${name} en Él Vive Iglesia.`).slice(0, 160);
    this.update(
      {
        title: `${name} | Ministerios | Él Vive Iglesia`,
        description: desc,
        keywords: `${name}, ministerio, él vive iglesia`,
        ogType: 'article',
      },
      `/ministerios/${id}`
    );
  }

  private siteOrigin(): string {
    const fromEnv = (environment as { siteUrl?: string }).siteUrl?.trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    if (typeof location !== 'undefined') return location.origin;
    return '';
  }

  private setMeta(attr: 'name' | 'property', selector: string, content: string): void {
    if (!content) return;
    this.meta.updateTag({ [attr]: selector, content });
  }

  private setLink(rel: string, href: string): void {
    if (!href || typeof document === 'undefined') return;
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }
}

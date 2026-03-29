import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  activeTab: 'nav' | 'footer' | 'icons' = 'nav';
  layoutForm: FormGroup;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  headerIconPreview = '';
  headerIconLightPreview = '';
  headerIconDarkPreview = '';
  footerIconPreview = '';
  footerIconLightPreview = '';
  footerIconDarkPreview = '';
  apiBase = environment.apiBaseUrl;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.layoutForm = this.fb.group({
      navLinks: this.fb.array([]),
      footerBrandTitle: ['', Validators.required],
      footerBrandDescription: [''],
      footerFacebookUrl: [''],
      footerInstagramUrl: [''],
      footerYoutubeUrl: [''],
      footerAddress: [''],
      footerEmail: [''],
      footerPhone: [''],
      footerCopyright: [''],
      footerPrivacyUrl: [''],
      footerTermsUrl: [''],
      quickLinks: this.fb.array([]),
      whatsappNumber: [''],
      headerIconUrl: [null as string | null],
      footerIconUrl: [null as string | null]
    });
  }

  ngOnInit(): void {
    this.loadLayout();
  }

  get navLinksArray(): FormArray {
    return this.layoutForm.get('navLinks') as FormArray;
  }

  get quickLinksArray(): FormArray {
    return this.layoutForm.get('quickLinks') as FormArray;
  }

  createNavLinkItem(item?: { label: string; path: string }): FormGroup {
    return this.fb.group({
      label: [item?.label || '', Validators.required],
      path: [item?.path || '', Validators.required]
    });
  }

  createQuickLinkItem(item?: { label: string; path: string }): FormGroup {
    return this.fb.group({
      label: [item?.label || '', Validators.required],
      path: [item?.path || '', Validators.required]
    });
  }

  addNavLink(): void {
    this.navLinksArray.push(this.createNavLinkItem());
  }

  removeNavLink(i: number): void {
    this.navLinksArray.removeAt(i);
  }

  addQuickLink(): void {
    this.quickLinksArray.push(this.createQuickLinkItem());
  }

  removeQuickLink(i: number): void {
    this.quickLinksArray.removeAt(i);
  }

  loadLayout(): void {
    this.apiService.getLayout().subscribe({
      next: (data) => {
        const navArr = this.layoutForm.get('navLinks') as FormArray;
        navArr.clear();
        (data.navLinks || []).forEach((item: { label: string; path: string }) =>
          navArr.push(this.createNavLinkItem(item))
        );
        const quickArr = this.layoutForm.get('quickLinks') as FormArray;
        quickArr.clear();
        (data.quickLinks || []).forEach((item: { label: string; path: string }) =>
          quickArr.push(this.createQuickLinkItem(item))
        );
        this.layoutForm.patchValue({
          footerBrandTitle: data.footerBrandTitle || '',
          footerBrandDescription: data.footerBrandDescription || '',
          footerFacebookUrl: data.footerFacebookUrl || '',
          footerInstagramUrl: data.footerInstagramUrl || '',
          footerYoutubeUrl: data.footerYoutubeUrl || '',
          footerAddress: data.footerAddress || '',
          footerEmail: data.footerEmail || '',
          footerPhone: data.footerPhone || '',
          footerCopyright: data.footerCopyright || '',
          footerPrivacyUrl: data.footerPrivacyUrl || '',
          footerTermsUrl: data.footerTermsUrl || '',
          whatsappNumber: data.whatsappNumber || '',
          headerIconUrl: data.headerIconUrl || null,
          footerIconUrl: data.footerIconUrl || null
        });
        this.headerIconPreview = data.headerIconUrl ? this.apiBase + data.headerIconUrl + '?t=' + Date.now() : '';
        this.headerIconLightPreview = data.headerIconUrlLight ? this.apiBase + data.headerIconUrlLight + '?t=' + Date.now() : '';
        this.headerIconDarkPreview = data.headerIconUrlDark ? this.apiBase + data.headerIconUrlDark + '?t=' + Date.now() : '';
        this.footerIconPreview = data.footerIconUrl ? this.apiBase + data.footerIconUrl + '?t=' + Date.now() : '';
        this.footerIconLightPreview = data.footerIconUrlLight ? this.apiBase + data.footerIconUrlLight + '?t=' + Date.now() : '';
        this.footerIconDarkPreview = data.footerIconUrlDark ? this.apiBase + data.footerIconUrlDark + '?t=' + Date.now() : '';
      },
      error: () => this.showToastMsg('Error al cargar', 'error')
    });
  }

  saveLayout(): void {
    const value = this.layoutForm.value;
    const payload = {
      navLinks: value.navLinks,
      quickLinks: value.quickLinks,
      footerBrandTitle: value.footerBrandTitle,
      footerBrandDescription: value.footerBrandDescription,
      footerFacebookUrl: value.footerFacebookUrl,
      footerInstagramUrl: value.footerInstagramUrl,
      footerYoutubeUrl: value.footerYoutubeUrl,
      footerAddress: value.footerAddress,
      footerEmail: value.footerEmail,
      footerPhone: value.footerPhone,
      footerCopyright: value.footerCopyright,
      footerPrivacyUrl: value.footerPrivacyUrl,
      footerTermsUrl: value.footerTermsUrl,
      whatsappNumber: value.whatsappNumber
    };
    this.apiService.updateLayout(payload).subscribe({
      next: () => this.showToastMsg('Header y Footer guardados'),
      error: () => this.showToastMsg('Error al guardar', 'error')
    });
  }

  onHeaderIconSelected(event: Event, mode: 'light' | 'dark'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const sectionKey = mode === 'light' ? 'header-light' : 'header-dark';
    this.apiService.uploadSectionIcon('layout', sectionKey, file).subscribe({
      next: () => {
        if (mode === 'light') this.headerIconLightPreview = this.apiBase + '/api/section-icon/layout/header-light?t=' + Date.now();
        else this.headerIconDarkPreview = this.apiBase + '/api/section-icon/layout/header-dark?t=' + Date.now();
        this.showToastMsg('Ícono de header subido');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  onFooterIconSelected(event: Event, mode: 'light' | 'dark'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const sectionKey = mode === 'light' ? 'footer-light' : 'footer-dark';
    this.apiService.uploadSectionIcon('layout', sectionKey, file).subscribe({
      next: () => {
        if (mode === 'light') this.footerIconLightPreview = this.apiBase + '/api/section-icon/layout/footer-light?t=' + Date.now();
        else this.footerIconDarkPreview = this.apiBase + '/api/section-icon/layout/footer-dark?t=' + Date.now();
        this.showToastMsg('Ícono de footer subido');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  removeHeaderIcon(mode: 'light' | 'dark'): void {
    const sectionKey = mode === 'light' ? 'header-light' : 'header-dark';
    this.apiService.deleteSectionIcon('layout', sectionKey).subscribe({
      next: () => {
        if (mode === 'light') this.headerIconLightPreview = '';
        else this.headerIconDarkPreview = '';
        this.showToastMsg('Ícono de header eliminado');
      }
    });
  }

  removeFooterIcon(mode: 'light' | 'dark'): void {
    const sectionKey = mode === 'light' ? 'footer-light' : 'footer-dark';
    this.apiService.deleteSectionIcon('layout', sectionKey).subscribe({
      next: () => {
        if (mode === 'light') this.footerIconLightPreview = '';
        else this.footerIconDarkPreview = '';
        this.showToastMsg('Ícono de footer eliminado');
      }
    });
  }

  saveAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const value = this.layoutForm.value;
      const payload = {
        navLinks: value.navLinks, quickLinks: value.quickLinks,
        footerBrandTitle: value.footerBrandTitle, footerBrandDescription: value.footerBrandDescription,
        footerFacebookUrl: value.footerFacebookUrl, footerInstagramUrl: value.footerInstagramUrl,
        footerYoutubeUrl: value.footerYoutubeUrl, footerAddress: value.footerAddress,
        footerEmail: value.footerEmail, footerPhone: value.footerPhone,
        footerCopyright: value.footerCopyright, footerPrivacyUrl: value.footerPrivacyUrl,
        footerTermsUrl: value.footerTermsUrl, whatsappNumber: value.whatsappNumber
      };
      this.apiService.updateLayout(payload).subscribe({ next: () => resolve(), error: () => reject() });
    });
  }

  private showToastMsg(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}

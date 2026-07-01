import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MaintenanceService } from '../../services/maintenance.service';
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
    private apiService: ApiService,
    private maintenanceService: MaintenanceService
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
      showThemeToggle: [false],
      headerIconUrl: [null as string | null],
      footerIconUrl: [null as string | null],
      maintenanceMode: [false]
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
          showThemeToggle: !!data.showThemeToggle,
          headerIconUrl: data.headerIconUrl || null,
          footerIconUrl: data.footerIconUrl || null,
          maintenanceMode: !!data.maintenanceMode
        });
        this.headerIconPreview = data.headerIconUrl ? this.apiService.resolveAssetUrl(data.headerIconUrl) : '';
        this.headerIconLightPreview = data.headerIconUrlLight ? this.apiService.resolveAssetUrl(data.headerIconUrlLight) : '';
        this.headerIconDarkPreview = data.headerIconUrlDark ? this.apiService.resolveAssetUrl(data.headerIconUrlDark) : '';
        this.footerIconPreview = data.footerIconUrl ? this.apiService.resolveAssetUrl(data.footerIconUrl) : '';
        this.footerIconLightPreview = data.footerIconUrlLight ? this.apiService.resolveAssetUrl(data.footerIconUrlLight) : '';
        this.footerIconDarkPreview = data.footerIconUrlDark ? this.apiService.resolveAssetUrl(data.footerIconUrlDark) : '';
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
      whatsappNumber: value.whatsappNumber,
      maintenanceMode: value.maintenanceMode,
      showThemeToggle: value.showThemeToggle
    };
    this.apiService.updateLayout(payload).subscribe({
      next: () => {
        this.maintenanceService.invalidate();
        this.showToastMsg('Header y Footer guardados');
      },
      error: () => this.showToastMsg('Error al guardar', 'error')
    });
  }

  onHeaderIconSelected(event: Event, mode: 'light' | 'dark'): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const sectionKey = mode === 'light' ? 'header-light' : 'header-dark';
    this.apiService.uploadSectionIcon('layout', sectionKey, file).subscribe({
      next: () => {
        const url = this.apiService.getSectionIconUrl('layout', sectionKey) + '?t=' + Date.now();
        if (mode === 'light') this.headerIconLightPreview = url;
        else this.headerIconDarkPreview = url;
        this.showToastMsg('Ícono de header subido');
        input.value = '';
      },
      error: (err) => this.showToastMsg('Error al subir: ' + (err.error?.error || err.message), 'error')
    });
  }

  onFooterIconSelected(event: Event, mode: 'light' | 'dark'): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const sectionKey = mode === 'light' ? 'footer-light' : 'footer-dark';
    this.apiService.uploadSectionIcon('layout', sectionKey, file).subscribe({
      next: () => {
        const url = this.apiService.getSectionIconUrl('layout', sectionKey) + '?t=' + Date.now();
        if (mode === 'light') this.footerIconLightPreview = url;
        else this.footerIconDarkPreview = url;
        this.showToastMsg('Ícono de footer subido');
        input.value = '';
      },
      error: (err) => this.showToastMsg('Error al subir: ' + (err.error?.error || err.message), 'error')
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
        footerTermsUrl: value.footerTermsUrl, whatsappNumber: value.whatsappNumber,
        maintenanceMode: value.maintenanceMode
      };
      this.apiService.updateLayout(payload).subscribe({
        next: () => {
          this.maintenanceService.invalidate();
          resolve();
        },
        error: () => reject()
      });
    });
  }

  private showToastMsg(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}


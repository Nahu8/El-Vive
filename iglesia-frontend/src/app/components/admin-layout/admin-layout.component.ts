import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  activeTab: 'nav' | 'footer' = 'nav';
  layoutForm: FormGroup;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

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
      quickLinks: this.fb.array([])
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
          footerTermsUrl: data.footerTermsUrl || ''
        });
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
      footerTermsUrl: value.footerTermsUrl
    };
    this.apiService.updateLayout(payload).subscribe({
      next: () => this.showToastMsg('Header y Footer guardados'),
      error: () => this.showToastMsg('Error al guardar', 'error')
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
        footerTermsUrl: value.footerTermsUrl
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-footer.component.html',
  styleUrls: ['./admin-footer.component.css']
})
export class AdminFooterComponent implements OnInit {
  footerForm: FormGroup;

  showToast = false;
  toastMessage = '';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.footerForm = this.fb.group({
      brandTitle: ['', Validators.required],
      brandDescription: [''],
      social: this.fb.group({
        facebook: [''],
        instagram: [''],
        youtube: ['']
      }),
      quickLinksTitle: ['ENLACES RÁPIDOS'],
      quickLinks: this.fb.array([]),
      contactTitle: ['CONTACTO'],
      contact: this.fb.group({
        address: [''],
        email: ['', Validators.email],
        phone: ['']
      }),
      bottom: this.fb.group({
        copyrightText: [''],
        privacyLabel: ['Política de Privacidad'],
        privacyLink: ['#'],
        termsLabel: ['Términos de Servicio'],
        termsLink: ['#']
      })
    });
  }

  ngOnInit(): void {
    // Cargamos la configuración de Layout (footer público)
    this.apiService.getLayout().subscribe({
      next: (data) => {
        const footer = {
          brandTitle: data.footerBrandTitle,
          brandDescription: data.footerBrandDescription,
          social: {
            facebook: data.footerFacebookUrl,
            instagram: data.footerInstagramUrl,
            youtube: data.footerYoutubeUrl
          },
          quickLinks: data.quickLinks || [],
          contact: {
            address: data.footerAddress,
            email: data.footerEmail,
            phone: data.footerPhone
          },
          bottom: {
            copyrightText: data.footerCopyright,
            privacyLabel: 'Política de Privacidad',
            privacyLink: data.footerPrivacyUrl,
            termsLabel: 'Términos de Servicio',
            termsLink: data.footerTermsUrl
          },
          quickLinksTitle: 'ENLACES RÁPIDOS',
          contactTitle: 'CONTACTO'
        };

        this.footerForm.patchValue({
          brandTitle: footer.brandTitle || 'ÉL VIVE IGLESIA',
          brandDescription: footer.brandDescription || '',
          social: {
            facebook: footer.social?.facebook || '',
            instagram: footer.social?.instagram || '',
            youtube: footer.social?.youtube || ''
          },
          quickLinksTitle: footer.quickLinksTitle || 'ENLACES RÁPIDOS',
          contactTitle: footer.contactTitle || 'CONTACTO',
          contact: {
            address: footer.contact?.address || '',
            email: footer.contact?.email || '',
            phone: footer.contact?.phone || ''
          },
          bottom: {
            copyrightText: footer.bottom?.copyrightText || '',
            privacyLabel: footer.bottom?.privacyLabel || 'Política de Privacidad',
            privacyLink: footer.bottom?.privacyLink || '#',
            termsLabel: footer.bottom?.termsLabel || 'Términos de Servicio',
            termsLink: footer.bottom?.termsLink || '#'
          }
        });

        const links = Array.isArray(footer.quickLinks) ? footer.quickLinks : [];
        const arr = this.quickLinksArray;
        arr.clear();
        (links.length ? links : [
          { label: 'Días de Reunión', route: '/dias-reunion' },
          { label: 'Ministerios', route: '/ministerios' },
          { label: 'Contacto', route: '/contacto' }
        ]).forEach((l: any) => arr.push(this.createQuickLinkForm(l)));
      },
      error: () => {
        // keep defaults if API fails
      }
    });
  }

  get quickLinksArray(): FormArray {
    return this.footerForm.get('quickLinks') as FormArray;
  }

  createQuickLinkForm(link?: any): FormGroup {
    return this.fb.group({
      label: [link?.label || '', Validators.required],
      route: [link?.route || '', Validators.required]
    });
  }

  addQuickLink(): void {
    this.quickLinksArray.push(this.createQuickLinkForm());
  }

  removeQuickLink(i: number): void {
    this.quickLinksArray.removeAt(i);
  }

  saveFooter(): void {
    if (!this.footerForm.valid) {
      this.showToastMessage('Por favor complete los campos requeridos', 'error');
      return;
    }

    const value = this.footerForm.value;

    const payload = {
      footerBrandTitle: value.brandTitle,
      footerBrandDescription: value.brandDescription,
      footerFacebookUrl: value.social.facebook,
      footerInstagramUrl: value.social.instagram,
      footerYoutubeUrl: value.social.youtube,
      footerAddress: value.contact.address,
      footerEmail: value.contact.email,
      footerPhone: value.contact.phone,
      footerCopyright: value.bottom.copyrightText,
      footerPrivacyUrl: value.bottom.privacyLink,
      footerTermsUrl: value.bottom.termsLink,
      quickLinks: (value.quickLinks || []).map((l: any) => ({
        label: l.label,
        path: l.route
      }))
    };

    this.apiService.updateLayout(payload).subscribe({
      next: () => this.showToastMessage('Footer guardado exitosamente', 'success'),
      error: () => this.showToastMessage('Error al guardar el Footer', 'error')
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}


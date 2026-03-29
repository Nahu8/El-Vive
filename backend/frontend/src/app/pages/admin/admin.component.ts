import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';
import { AdminHomeComponent } from '../../components/admin-home/admin-home.component';
import { AdminMinisteriosComponent } from '../../components/admin-ministerios/admin-ministerios.component';
import { AdminDiasReunionComponent } from '../../components/admin-dias-reunion/admin-dias-reunion.component';
import { AdminContactoComponent } from '../../components/admin-contacto/admin-contacto.component';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { AdminGenericPageComponent } from '../../components/admin-generic-page/admin-generic-page.component';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    AdminHomeComponent,
    AdminMinisteriosComponent,
    AdminDiasReunionComponent,
    AdminContactoComponent,
    AdminLayoutComponent,
    AdminGenericPageComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  sidebarOpen = true;
  sidebarCollapsed = false;
  activeSection = 'home';
  isSaving = false;
  saveSuccess = false;
  saveError = false;
  private destroy$ = new Subject<void>();

  @ViewChild(AdminHomeComponent) adminHome!: AdminHomeComponent;
  @ViewChild(AdminMinisteriosComponent) adminMinisterios!: AdminMinisteriosComponent;
  @ViewChild(AdminDiasReunionComponent) adminDiasReunion!: AdminDiasReunionComponent;
  @ViewChild(AdminContactoComponent) adminContacto!: AdminContactoComponent;
  @ViewChild(AdminLayoutComponent) adminLayout!: AdminLayoutComponent;
  @ViewChild('adminDonaciones') adminDonaciones!: AdminGenericPageComponent;
  @ViewChild('adminNosotros') adminNosotros!: AdminGenericPageComponent;

  sidebarItems: SidebarItem[] = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'layout', label: 'Header y Footer', icon: 'layout' },
    { id: 'ministries', label: 'Ministerios', icon: 'users' },
    { id: 'events', label: 'Dias de Reunion', icon: 'calendar' },
    { id: 'donaciones', label: 'Donaciones', icon: 'donate' },
    { id: 'nosotros', label: 'Nosotros', icon: 'info' },
    { id: 'contact', label: 'Contacto', icon: 'mail' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const isAuth = this.authService.isAuthenticated();

    if (!this.currentUser || !isAuth) {
      setTimeout(() => {
        this.currentUser = this.authService.getCurrentUser();
        if (!this.currentUser || !this.authService.isAuthenticated()) {
          this.router.navigate(['/login']);
          return;
        }
        this.initializeComponent();
      }, 200);
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    if (typeof window !== 'undefined') {
      this.sidebarOpen = window.innerWidth >= 768;
    }

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (!user && !this.authService.getCurrentUser()) {
          const stored = sessionStorage.getItem('currentUser');
          if (!stored) this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  selectSection(section: string): void {
    this.activeSection = section;
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  async saveAllSections(): Promise<void> {
    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = false;

    const promises: Promise<void>[] = [];

    try {
      if (this.adminHome) promises.push(this.adminHome.saveAll());
      if (this.adminLayout) promises.push(this.adminLayout.saveAll());
      if (this.adminMinisterios) promises.push(this.adminMinisterios.saveAll());
      if (this.adminDonaciones) promises.push(this.adminDonaciones.saveAll());
      if (this.adminNosotros) promises.push(this.adminNosotros.saveAll());
      if (this.adminDiasReunion) promises.push(this.adminDiasReunion.saveAll());
      if (this.adminContacto) promises.push(this.adminContacto.saveAll());

      await Promise.all(promises);
      this.saveSuccess = true;
      setTimeout(() => this.saveSuccess = false, 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
      this.saveError = true;
      setTimeout(() => this.saveError = false, 4000);
    } finally {
      this.isSaving = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getActiveLabel(): string {
    return this.sidebarItems.find(i => i.id === this.activeSection)?.label || '';
  }
}

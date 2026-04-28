import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';
import { maintenanceGuard } from './guards/maintenance.guard';
import { DiasReunionComponent } from './pages/dias-reunion/dias-reunion.component';
import { MinisteriosComponent } from './pages/ministerios/ministerios.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MinisterioDetalleComponent } from './pages/ministerio-detalle/ministerio-detalle.component';
import { DonacionesComponent } from './pages/donaciones/donaciones.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';
import { MantenimientoComponent } from './pages/mantenimiento/mantenimiento.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mantenimiento', component: MantenimientoComponent, canActivate: [maintenanceGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [maintenanceGuard, authGuard] },
  {
    path: '',
    canActivate: [maintenanceGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'dias-reunion', component: DiasReunionComponent },
      { path: 'ministerios', component: MinisteriosComponent },
      { path: 'ministerios/:id', component: MinisterioDetalleComponent },
      { path: 'contacto', component: ContactComponent },
      { path: 'donaciones', component: DonacionesComponent },
      { path: 'nosotros', component: NosotrosComponent },
      { path: '**', redirectTo: '' }
    ]
  }
];


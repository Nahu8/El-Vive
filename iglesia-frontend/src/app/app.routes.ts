import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';
import { DiasReunionComponent } from './pages/dias-reunion/dias-reunion.component';
import { MinisteriosComponent } from './pages/ministerios/ministerios.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MinisterioDetalleComponent } from './pages/ministerio-detalle/ministerio-detalle.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'dias-reunion', component: DiasReunionComponent },
  { path: 'ministerios', component: MinisteriosComponent },
  { path: 'ministerios/:id', component: MinisterioDetalleComponent },
  { path: 'contacto', component: ContactComponent },
  { path: '**', redirectTo: '' }
];

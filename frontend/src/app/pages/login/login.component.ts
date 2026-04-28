import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor ingresa usuario y contraseña.';
      return;
    }

    this.isLoading = true;
    try {
      const loginSuccess = await this.authService.login(this.username, this.password);

      if (loginSuccess) {
        const isAuth = this.authService.isAuthenticated();
        const user = this.authService.getCurrentUser();

        if (isAuth && user) {
          await this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Error en la autenticación. Intenta nuevamente.';
        }
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}


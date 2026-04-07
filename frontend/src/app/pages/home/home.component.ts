import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { CelebrationsSectionComponent } from '../../components/celebrations-section/celebrations-section.component';
import { MinistriesComponent } from '../../components/ministries/ministries.component';
import { MeetingDaysComponent } from '../../components/meeting-days/meeting-days.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HeroComponent, CelebrationsSectionComponent, MinistriesComponent, MeetingDaysComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Los datos ahora se cargan desde la API en cada componente hijo
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockFormComponent } from './clock-form/clock-form';
import { ClockDisplayComponent } from './clock-display/clock-display';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ClockFormComponent,
    ClockDisplayComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class App {
  title = 'Analog Clock Manager';
  showForm = true;

  toggleForm() {
    this.showForm = !this.showForm;
  }
}

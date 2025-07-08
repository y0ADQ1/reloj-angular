import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClockService, ClockConfig } from '../clock';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-clock-display',
  templateUrl: './clock-display.html',
  styleUrls: ['./clock-display.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ClockDisplayComponent implements OnInit, OnDestroy {
  clocks: ClockConfig[] = [];
  private subscription?: Subscription;
  private clockSubscription?: Subscription;

  constructor(private clockService: ClockService) {}

  ngOnInit() {
    // Subscribe to clock changes
    this.clockSubscription = this.clockService.clocks$.subscribe(clocks => {
      this.clocks = clocks;
    });

    // Update time every second
    this.subscription = interval(1000).subscribe(() => {
      this.clocks.forEach(clock => {
        clock.startTime = new Date(clock.startTime.getTime() + 1000);
      });
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  getHourTransform(clock: ClockConfig): string {
    const hours = clock.startTime.getHours() % 12;
    const minutes = clock.startTime.getMinutes();
    const degrees = (hours * 30) + (minutes * 0.5);
    return `rotate(${degrees}deg)`;
  }

  getMinuteTransform(clock: ClockConfig): string {
    const minutes = clock.startTime.getMinutes();
    const seconds = clock.startTime.getSeconds();
    const degrees = (minutes * 6) + (seconds * 0.1);
    return `rotate(${degrees}deg)`;
  }

  getSecondTransform(clock: ClockConfig): string {
    const seconds = clock.startTime.getSeconds();
    const degrees = seconds * 6;
    return `rotate(${degrees}deg)`;
  }

  formatTime(clock: ClockConfig): string {
    return clock.startTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  editClock(clock: ClockConfig) {
    this.clockService.setEditingClock(clock);
  }

  deleteClock(clock: ClockConfig) {
    this.clockService.deleteClock(clock.id);
  }

  incrementSeconds(clock: ClockConfig) {
    const newTime = new Date(clock.startTime.getTime() + 1000);
    this.clockService.updateClock(clock.id, { startTime: newTime });
  }

  decrementSeconds(clock: ClockConfig) {
    const newTime = new Date(clock.startTime.getTime() - 1000);
    this.clockService.updateClock(clock.id, { startTime: newTime });
  }

  incrementMinutes(clock: ClockConfig) {
    const newTime = new Date(clock.startTime.getTime() + 60000);
    this.clockService.updateClock(clock.id, { startTime: newTime });
  }

  decrementMinutes(clock: ClockConfig) {
    const newTime = new Date(clock.startTime.getTime() - 60000);
    this.clockService.updateClock(clock.id, { startTime: newTime });
  }

  resetToCurrentTime(clock: ClockConfig) {
    const newTime = new Date();
    this.clockService.updateClock(clock.id, { startTime: newTime });
  }
}

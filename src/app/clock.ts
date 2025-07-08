import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ClockConfig {
  id: string;
  handColor: string;
  markerColor: string;
  borderColor: string;
  analogNumbersColor: string;
  digitalNumbersColor: string;
  startTime: Date;
  backgroundImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  private clocks: ClockConfig[] = [];
  private clocksSubject = new BehaviorSubject<ClockConfig[]>([]);
  private editingClockSubject = new BehaviorSubject<ClockConfig | null>(null);

  clocks$ = this.clocksSubject.asObservable();
  editingClock$ = this.editingClockSubject.asObservable();

  addClock(config: Omit<ClockConfig, 'id'>): void {
    const newClock: ClockConfig = {
      ...config,
      id: this.generateId()
    };
    this.clocks.push(newClock);
    this.clocksSubject.next([...this.clocks]);
  }

  updateClock(id: string, config: Partial<ClockConfig>): void {
    const index = this.clocks.findIndex(clock => clock.id === id);
    if (index !== -1) {
      this.clocks[index] = { ...this.clocks[index], ...config };
      this.clocksSubject.next([...this.clocks]);
    }
  }

  deleteClock(id: string): void {
    this.clocks = this.clocks.filter(clock => clock.id !== id);
    this.clocksSubject.next([...this.clocks]);
  }

  getClocks(): ClockConfig[] {
    return [...this.clocks];
  }

  setEditingClock(clock: ClockConfig | null): void {
    this.editingClockSubject.next(clock);
  }

  getEditingClock(): ClockConfig | null {
    return this.editingClockSubject.value;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

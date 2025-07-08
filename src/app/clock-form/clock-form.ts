import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ClockService, ClockConfig } from '../clock';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clock-form',
  templateUrl: './clock-form.html',
  styleUrls: ['./clock-form.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class ClockFormComponent implements OnInit, OnDestroy {
  clockForm: FormGroup;
  isEditing = false;
  editingClockId: string | null = null;
  private subscription?: Subscription;

  constructor(private fb: FormBuilder, private clockService: ClockService) {
    this.clockForm = this.fb.group({
      handColor: ['#000000', Validators.required],
      markerColor: ['#000000', Validators.required],
      borderColor: ['#333333', Validators.required],
      analogNumbersColor: ['#000000', Validators.required],
      digitalNumbersColor: ['#000000', Validators.required],
      startTime: ['12:00', Validators.required],
      backgroundImage: [''],
      predefined: ['']
    });
  }

  ngOnInit() {
    this.subscription = this.clockService.editingClock$.subscribe(clock => {
      if (clock) {
        this.isEditing = true;
        this.editingClockId = clock.id;
        this.populateForm(clock);
      } else {
        this.isEditing = false;
        this.editingClockId = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private populateForm(clock: ClockConfig) {
    const timeString = clock.startTime.toTimeString().substring(0, 5);
    this.clockForm.patchValue({
      handColor: clock.handColor,
      markerColor: clock.markerColor,
      borderColor: clock.borderColor,
      analogNumbersColor: clock.analogNumbersColor,
      digitalNumbersColor: clock.digitalNumbersColor,
      startTime: timeString,
      backgroundImage: clock.backgroundImage,
      predefined: ''
    });
  }

  applyPredefined(option: string) {
    const predefinedConfigs: { [key: string]: Partial<ClockConfig> } = {
      classic: {
        handColor: '#000000',
        markerColor: '#000000',
        borderColor: '#333333',
        analogNumbersColor: '#000000',
        digitalNumbersColor: '#000000',
        backgroundImage: ''
      },
      modern: {
        handColor: '#FFFFFF',
        markerColor: '#FFFFFF',
        borderColor: '#1E90FF',
        analogNumbersColor: '#FFFFFF',
        digitalNumbersColor: '#00FF00',
        backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop'
      },
      vintage: {
        handColor: '#8B4513',
        markerColor: '#8B4513',
        borderColor: '#FFD700',
        analogNumbersColor: '#8B4513',
        digitalNumbersColor: '#8B4513',
        backgroundImage: 'https://images.unsplash.com/photo-1580933073521-dc49ac0d4e6a?w=400&h=400&fit=crop'
      }
    };

    if (option && predefinedConfigs[option]) {
      this.clockForm.patchValue(predefinedConfigs[option]);
    }
  }

  onSubmit() {
    if (this.clockForm.valid) {
      const formValue = this.clockForm.value;
      const config: Omit<ClockConfig, 'id'> = {
        handColor: formValue.handColor,
        markerColor: formValue.markerColor,
        borderColor: formValue.borderColor,
        analogNumbersColor: formValue.analogNumbersColor,
        digitalNumbersColor: formValue.digitalNumbersColor,
        startTime: new Date(`1970-01-01T${formValue.startTime}:00`),
        backgroundImage: formValue.backgroundImage
      };

      if (this.isEditing && this.editingClockId) {
        this.clockService.updateClock(this.editingClockId, config);
        this.cancelEdit();
      } else {
        this.clockService.addClock(config);
        this.resetForm();
      }
    }
  }

  cancelEdit() {
    this.clockService.setEditingClock(null);
    this.resetForm();
  }

  private resetForm() {
    this.clockForm.reset({
      handColor: '#000000',
      markerColor: '#000000',
      borderColor: '#333333',
      analogNumbersColor: '#000000',
      digitalNumbersColor: '#000000',
      startTime: '12:00',
      backgroundImage: '',
      predefined: ''
    });
  }
}

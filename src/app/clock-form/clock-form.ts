import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    MatButtonModule,
    MatDialogModule
  ]
})
export class ClockFormComponent implements OnInit, OnDestroy {
  clockForm: FormGroup;
  isEditing = false;
  editingClockId: string | null = null;
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private clockService: ClockService,
    private dialog: MatDialog
  ) {
    this.clockForm = this.fb.group({
      handColor: ['#000000', Validators.required],
      markerColor: ['#000000', Validators.required],
      borderColor: ['#333333', Validators.required],
      analogNumbersColor: ['#000000', Validators.required],
      digitalNumbersColor: ['#000000', Validators.required],
      startTime: ['12:00', Validators.required],
      predefined: ['']
    });
  }

  ngOnInit() {
    this.subscription = this.clockService.editingClock$.subscribe(clock => {
      if (clock) {
        this.openEditModal(clock);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private openEditModal(clock: ClockConfig) {
    const dialogRef = this.dialog.open(ClockEditModalComponent, {
      width: '500px',
      data: { clock: clock }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clockService.updateClock(clock.id, result);
      }
      this.clockService.setEditingClock(null);
    });
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
        digitalNumbersColor: '#000000'
      },
      modern: {
        handColor: '#FFFFFF',
        markerColor: '#FFFFFF',
        borderColor: '#1E90FF',
        analogNumbersColor: '#FFFFFF',
        digitalNumbersColor: '#00FF00'
      },
      vintage: {
        handColor: '#8B4513',
        markerColor: '#8B4513',
        borderColor: '#FFD700',
        analogNumbersColor: '#8B4513',
        digitalNumbersColor: '#8B4513'
      }
    };

    if (option && predefinedConfigs[option]) {
      this.clockForm.patchValue(predefinedConfigs[option]);
    }
  }

  onSubmit() {
    if (this.clockForm.valid) {
      const formValue = this.clockForm.value;
      const config: {
        handColor: any;
        markerColor: any;
        borderColor: any;
        analogNumbersColor: any;
        digitalNumbersColor: any;
        startTime: Date
      } = {
        handColor: formValue.handColor,
        markerColor: formValue.markerColor,
        borderColor: formValue.borderColor,
        analogNumbersColor: formValue.analogNumbersColor,
        digitalNumbersColor: formValue.digitalNumbersColor,
        startTime: new Date(`1970-01-01T${formValue.startTime}:00`)
      };

      this.clockService.addClock(config);
      this.resetForm();
    }
  }

  private resetForm() {
    this.clockForm.reset({
      handColor: '#000000',
      markerColor: '#000000',
      borderColor: '#333333',
      analogNumbersColor: '#000000',
      digitalNumbersColor: '#000000',
      startTime: '12:00',
      predefined: ''
    });
  }
}

// Modal Component for editing clocks
@Component({
  selector: 'app-clock-edit-modal',
  template: `
    <div class="modal-header">
      <h2 mat-dialog-title>Edit Clock</h2>
    </div>
    <div mat-dialog-content>
      <form [formGroup]="clockForm">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Hand Color</mat-label>
            <input matInput type="color" formControlName="handColor">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Marker Color</mat-label>
            <input matInput type="color" formControlName="markerColor">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Border Color</mat-label>
            <input matInput type="color" formControlName="borderColor">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Analog Numbers Color</mat-label>
            <input matInput type="color" formControlName="analogNumbersColor">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Digital Numbers Color</mat-label>
            <input matInput type="color" formControlName="digitalNumbersColor">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Start Time</mat-label>
            <input matInput type="time" formControlName="startTime">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Predefined Clock Style</mat-label>
          <mat-select formControlName="predefined" (selectionChange)="applyPredefined($event.value)">
            <mat-option value="">None</mat-option>
            <mat-option value="classic">Classic</mat-option>
            <mat-option value="modern">Modern</mat-option>
            <mat-option value="vintage">Vintage</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="clockForm.invalid">
        Update Clock
      </button>
    </div>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .modal-header {
      margin-bottom: 16px;
    }
    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class ClockEditModalComponent implements OnInit {
  clockForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClockEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clock: ClockConfig }
  ) {
    this.clockForm = this.fb.group({
      handColor: [data.clock.handColor, Validators.required],
      markerColor: [data.clock.markerColor, Validators.required],
      borderColor: [data.clock.borderColor, Validators.required],
      analogNumbersColor: [data.clock.analogNumbersColor, Validators.required],
      digitalNumbersColor: [data.clock.digitalNumbersColor, Validators.required],
      startTime: [data.clock.startTime.toTimeString().substring(0, 5), Validators.required],
      predefined: ['']
    });
  }

  ngOnInit() {}

  applyPredefined(option: string) {
    const predefinedConfigs: { [key: string]: Partial<ClockConfig> } = {
      classic: {
        handColor: '#000000',
        markerColor: '#000000',
        borderColor: '#333333',
        analogNumbersColor: '#000000',
        digitalNumbersColor: '#000000'
      },
      modern: {
        handColor: '#FFFFFF',
        markerColor: '#FFFFFF',
        borderColor: '#1E90FF',
        analogNumbersColor: '#FFFFFF',
        digitalNumbersColor: '#00FF00'
      },
      vintage: {
        handColor: '#8B4513',
        markerColor: '#8B4513',
        borderColor: '#FFD700',
        analogNumbersColor: '#8B4513',
        digitalNumbersColor: '#8B4513'
      }
    };

    if (option && predefinedConfigs[option]) {
      this.clockForm.patchValue(predefinedConfigs[option]);
    }
  }

  onSave() {
    if (this.clockForm.valid) {
      const formValue = this.clockForm.value;
      // Obtener los segundos actuales del reloj
      const currentSeconds = this.data.clock.startTime.getSeconds();
      // Separar hora y minuto del input
      const [hours, minutes] = formValue.startTime.split(':');
      // Crear nueva fecha con los segundos actuales
      const newStartTime = new Date(this.data.clock.startTime);
      newStartTime.setHours(Number(hours), Number(minutes), currentSeconds, 0);

      const config: Partial<ClockConfig> = {
        handColor: formValue.handColor,
        markerColor: formValue.markerColor,
        borderColor: formValue.borderColor,
        analogNumbersColor: formValue.analogNumbersColor,
        digitalNumbersColor: formValue.digitalNumbersColor,
        startTime: newStartTime
      };
      this.dialogRef.close(config);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}


import { Component, ChangeDetectionStrategy, output, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PersonalData } from '../../models/tax-data.model';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AiAssistantComponent],
  templateUrl: './personal-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent {
  initialData = input<PersonalData>();
  isReadOnly = input<boolean>(false);
  dataUpdate = output<{ step: string, data: PersonalData }>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    city: ['', Validators.required],
    maritalStatus: ['single', Validators.required],
    religion: ['none', Validators.required],
    taxId: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    iban: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[a-zA-Z0-9]{1,30}$/)]]
  });
  
  subTopics = [
    { key: 'Steuer-Identifikationsnummer', label: 'Was ist die Steuer-ID?' },
    { key: 'Kirchensteuer', label: 'Was ist die Kirchensteuer?' }
  ];

  constructor() {
    effect(() => {
      if (this.initialData() && Object.keys(this.initialData()!).length) {
        this.form.patchValue(this.initialData() as any, { emitEvent: false });
      }
    });

    effect(() => {
      if (this.isReadOnly()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dataUpdate.emit({ step: 'personalData', data: this.form.getRawValue() });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

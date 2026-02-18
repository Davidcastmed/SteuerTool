
import { Component, ChangeDetectionStrategy, output, input, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HouseholdServices, Insurances } from '../../models/tax-data.model';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-household-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AiAssistantComponent],
  templateUrl: './household-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdServicesComponent {
  initialData = input<HouseholdServices>();
  contextualTaxData = input<Insurances>();
  isReadOnly = input<boolean>(false);
  dataUpdate = output<{ step: string, data: HouseholdServices }>();
  goBack = output<void>();

  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    services: [0, [Validators.required, Validators.min(0)]],
    tradesmen: [0, [Validators.required, Validators.min(0)]],
  });

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

  onBack() {
    this.goBack.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dataUpdate.emit({ step: 'householdServices', data: this.form.getRawValue() });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

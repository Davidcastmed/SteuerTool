
import { Component, ChangeDetectionStrategy, output, input, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Expenses, Insurances } from '../../models/tax-data.model';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-insurances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AiAssistantComponent],
  templateUrl: './insurances.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsurancesComponent {
  initialData = input<Insurances>();
  contextualTaxData = input<Expenses>();
  isReadOnly = input<boolean>(false);
  dataUpdate = output<{ step: string, data: Insurances }>();
  goBack = output<void>();

  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    healthInsurance: [0, [Validators.required, Validators.min(0)]],
    liabilityInsurance: [0, [Validators.required, Validators.min(0)]],
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
      this.dataUpdate.emit({ step: 'insurances', data: this.form.getRawValue() });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

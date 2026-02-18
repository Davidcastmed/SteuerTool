
import { Component, ChangeDetectionStrategy, output, input, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Income } from '../../models/tax-data.model';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AiAssistantComponent],
  templateUrl: './income.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeComponent {
  initialData = input<Income>();
  isReadOnly = input<boolean>(false);
  dataUpdate = output<{ step: string, data: Income }>();
  goBack = output<void>();

  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    grossSalary: [null, [Validators.required, Validators.min(0)]],
    incomeTax: [null, [Validators.required, Validators.min(0)]],
    solidaritySurcharge: [null, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      if (this.initialData()) {
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
      this.dataUpdate.emit({ step: 'income', data: this.form.getRawValue() });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

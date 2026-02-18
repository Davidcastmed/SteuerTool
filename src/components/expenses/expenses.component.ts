import { Component, ChangeDetectionStrategy, output, input, effect, inject, computed, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Expenses, Income } from '../../models/tax-data.model';
import { AiAssistantComponent } from '../ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AiAssistantComponent],
  templateUrl: './expenses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent {
  initialData = input<Expenses>();
  contextualTaxData = input<Income>();
  isReadOnly = input<boolean>(false);
  taxYear = input.required<number>();
  dataUpdate = output<{ step: string, data: Expenses }>();
  goBack = output<void>();

  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    commuteDays: [null, [Validators.required, Validators.min(0), Validators.max(366)]],
    commuteDistance: [null, [Validators.required, Validators.min(0)]],
    homeOfficeDays: [0, [Validators.required, Validators.min(0)]],
    workEquipment: [0, [Validators.required, Validators.min(0)]],
    trainingCosts: [0, [Validators.required, Validators.min(0)]],
    applicationCosts: [0, [Validators.required, Validators.min(0)]],
    workRelatedTravel: [0, [Validators.required, Validators.min(0)]],
    accountFees: [0, [Validators.required, Validators.min(0)]]
  });

  commuteAllowance: Signal<number> = computed(() => {
    const days = this.form.value.commuteDays ?? 0;
    const distance = this.form.value.commuteDistance ?? 0;
    // Vereinfachte Pauschale von 0.30 €/km für die ersten 20km, 0.38 €/km danach
    let allowance = 0;
    if (distance > 0) {
        if (distance <= 20) {
            allowance = days * distance * 0.30;
        } else {
            allowance = days * (20 * 0.30 + (distance - 20) * 0.38);
        }
    }
    return Math.round(allowance * 100) / 100;
  });

  homeOfficeAllowance: Signal<number> = computed(() => {
    const days = this.form.value.homeOfficeDays ?? 0;
    // Pauschale für 2023/2024: 6€ pro Tag, maximal 1260€
    const allowance = days * 6;
    return Math.min(allowance, 1260);
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
      this.dataUpdate.emit({ step: 'expenses', data: this.form.getRawValue() });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
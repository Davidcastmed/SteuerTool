
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourContent } from '../../services/tour.service';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideComponent {
  currentStep = input.required<number>();
  tourContent = input.required<TourContent>();
  proceed = output<void>();
  exit = output<void>();

  onProceed(): void {
    this.proceed.emit();
  }
  
  onExit(): void {
    this.exit.emit();
  }
}


import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroComponent {
  start = output<void>();

  onStart() {
    this.start.emit();
  }
}
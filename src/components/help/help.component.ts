
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpComponent {
  close = output<void>();

  onClose() {
    this.close.emit();
  }
}
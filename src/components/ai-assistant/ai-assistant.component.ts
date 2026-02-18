
import { Component, ChangeDetectionStrategy, input, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';

interface SubTopic {
  key: string;
  label: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-assistant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiAssistantComponent {
  mainTopic = input.required<string>();
  subTopics = input<SubTopic[]>([]);
  contextData = input<any | null>(null);

  private geminiService = inject(GeminiService);

  explanation = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  activeTopic = signal<string>('');

  suggestions = signal<string | null>(null);
  isLoadingSuggestions = signal<boolean>(false);
  
  constructor() {
    effect(() => {
      // When the main topic input changes, fetch its explanation
      this.getExplanation(this.mainTopic());
    }, { allowSignalWrites: true });

    effect(() => {
        const data = this.contextData();
        if(data && Object.keys(data).length > 0) {
            // Note: We don't have the tax year here. For simplicity, we'll use a recent year.
            // A more complex app would thread the year through to this component.
            this.getSuggestions(data, new Date().getFullYear() - 1);
        }
    }, { allowSignalWrites: true });
  }

  async getExplanation(topic: string): Promise<void> {
    this.activeTopic.set(topic);
    this.isLoading.set(true);
    this.explanation.set(null);
    try {
      const result = await this.geminiService.getExplanation(topic);
      this.explanation.set(result);
    } catch (error) {
      this.explanation.set('Fehler beim Laden der Erklärung.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async getSuggestions(data: any, year: number): Promise<void> {
    this.isLoadingSuggestions.set(true);
    this.suggestions.set(null);
    try {
      const result = await this.geminiService.getTaxSavingSuggestions(data, year);
      this.suggestions.set(result);
    } catch (error) {
      this.suggestions.set('Fehler beim Abrufen von Vorschlägen.');
    } finally {
      this.isLoadingSuggestions.set(false);
    }
  }
}

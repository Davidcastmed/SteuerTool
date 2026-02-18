
import { Component, ChangeDetectionStrategy, signal, WritableSignal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import { IncomeComponent } from './components/income/income.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { SummaryComponent } from './components/summary/summary.component';
import { TaxData } from './models/tax-data.model';
import { HouseholdServicesComponent } from './components/household-services/household-services.component';
import { InsurancesComponent } from './components/insurances/insurances.component';
import { GeminiService } from './services/gemini.service';
import { PersistenceService } from './services/persistence.service';
import { TourService } from './services/tour.service';
import { GuideComponent } from './components/guide/guide.component';
import { HelpComponent } from './components/help/help.component';
import { IntroComponent } from './components/intro/intro.component';

const EMPTY_TAX_DATA: TaxData = {
  personalData: {},
  income: {},
  expenses: {},
  insurances: {},
  householdServices: {}
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    PersonalDataComponent,
    IncomeComponent,
    ExpensesComponent,
    InsurancesComponent,
    HouseholdServicesComponent,
    SummaryComponent,
    GuideComponent,
    HelpComponent,
    IntroComponent
  ],
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  private persistenceService = inject(PersistenceService);
  private tourService = inject(TourService);

  currentStep = signal<number>(1);
  taxYear = signal<number>(2024);
  availableTaxYears = [2024, 2023, 2022];
  isLoadingExample = signal<boolean>(false);
  taxData!: WritableSignal<TaxData>;
  showHelp = signal<boolean>(false);
  showIntro = signal<boolean>(false);

  // Tour state
  isTourActive = signal(false);
  tourStep = signal(0);
  tourContent = this.tourService.getTourContent();

  steps = [
    { number: 1, title: 'Persönliche Daten' },
    { number: 2, title: 'Einnahmen' },
    { number: 3, title: 'Ausgaben' },
    { number: 4, title: 'Vorsorge' },
    { number: 5, title: 'Haushalt' },
    { number: 6, title: 'Zusammenfassung' }
  ];

  constructor() {
    this.loadDataForCurrentYear();

    // Auto-save any changes to local storage for the current year
    effect(() => {
      this.persistenceService.saveTaxData(this.taxData(), this.taxYear());
    });
  }

  private loadDataForCurrentYear(): void {
    const savedData = this.persistenceService.loadTaxData(this.taxYear());
    this.taxData = signal<TaxData>(savedData || EMPTY_TAX_DATA);
    this.determineCurrentStep();
    this.showIntro.set(Object.keys(this.taxData().personalData).length === 0);
  }
  
  private determineCurrentStep(): void {
    const loadedData = this.taxData();
    if(Object.keys(loadedData.personalData).length === 0) {
      this.currentStep.set(1);
      return;
    }
    if(Object.keys(loadedData.income).length === 0) {
      this.currentStep.set(2);
      return;
    }
    if(Object.keys(loadedData.expenses).length === 0) {
      this.currentStep.set(3);
      return;
    }
    if(Object.keys(loadedData.insurances).length === 0) {
      this.currentStep.set(4);
      return;
    }
    if(Object.keys(loadedData.householdServices).length === 0) {
      this.currentStep.set(5);
      return;
    }
    this.currentStep.set(6);
  }

  onYearChange(event: Event): void {
    const newYear = parseInt((event.target as HTMLSelectElement).value, 10);
    this.taxYear.set(newYear);
    this.loadDataForCurrentYear();
  }

  async fillWithExampleData(): Promise<void> {
    this.isLoadingExample.set(true);
    this.showIntro.set(false);
    try {
      const exampleData = await this.geminiService.getExampleTaxData(this.taxYear());
      this.taxData.set(exampleData);
       // Reset to first step to allow user to review from the beginning
      this.currentStep.set(1);
    } catch (error) {
      console.error('Failed to load example data:', error);
      alert('Fehler beim Laden der Beispieldaten. Bitte versuchen Sie es erneut.');
    } finally {
      this.isLoadingExample.set(false);
    }
  }

  handleStart(): void {
    this.showIntro.set(false);
  }

  handleDataUpdate(event: { step: string, data: any }): void {
    this.taxData.update(currentData => {
      return { ...currentData, [event.step]: event.data };
    });
    this.nextStep();
  }

  nextStep(): void {
    if (this.currentStep() < this.steps.length) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }
  
  goToStep(step: number): void {
    if (this.isTourActive()) return; // Disable navigation during tour

    // Do not allow navigation away from intro
    if(this.showIntro() && this.currentStep() === 1) return;

    const isStepCompleted = (stepToCheck: number) => {
        const data = this.taxData();
        switch(stepToCheck) {
            case 1: return Object.keys(data.personalData).length > 0;
            case 2: return Object.keys(data.income).length > 0;
            case 3: return Object.keys(data.expenses).length > 0;
            case 4: return Object.keys(data.insurances).length > 0;
            case 5: return Object.keys(data.householdServices).length > 0;
            default: return false;
        }
    };

    if(step <= this.currentStep() || isStepCompleted(step - 1)) {
       this.currentStep.set(step);
       this.showHelp.set(false);
    }
  }

  restart(): void {
    this.persistenceService.clearTaxData(this.taxYear());
    this.taxData.set(EMPTY_TAX_DATA);
    this.currentStep.set(1);
    this.showIntro.set(true);
  }

  // --- Tour Methods ---
  startTour(): void {
    this.restart();
    this.isTourActive.set(true);
    this.tourStep.set(1);
    this.currentStep.set(1);
    this.showIntro.set(false);
  }

  advanceTour(): void {
    const currentTourStepIndex = this.tourStep() - 1;
    const tourStepData = this.tourContent[currentTourStepIndex];

    if (tourStepData.data) {
       this.taxData.update(currentData => ({...currentData, ...tourStepData.data}));
    }

    if (this.tourStep() < this.steps.length) {
      this.tourStep.update(s => s + 1);
      this.currentStep.update(s => s + 1);
    } else {
      this.exitTour();
    }
  }

  exitTour(): void {
    this.isTourActive.set(false);
    this.tourStep.set(0);
  }
}
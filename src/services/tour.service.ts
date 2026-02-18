
import { Injectable } from '@angular/core';
import { TaxData } from '../models/tax-data.model';

export interface TourContent {
  title: string;
  explanation: string;
  buttonText: string;
  data?: Partial<TaxData>;
}

const TOUR_CONTENT: TourContent[] = [
  {
    title: 'Persönliche Daten',
    explanation: 'Beginnen wir mit den grundlegenden persönlichen Informationen. Diese sind für die Identifizierung durch das Finanzamt unerlässlich. Wir füllen die Daten für unseren Beispielbürger, Max Mustermann, aus.',
    buttonText: 'Daten ausfüllen & Weiter',
    data: {
      personalData: {
        firstName: 'Max',
        lastName: 'Mustermann',
        dateOfBirth: '1985-05-20',
        street: 'Beispielstraße',
        houseNumber: '123',
        postalCode: '10115',
        city: 'Berlin',
        maritalStatus: 'single',
        religion: 'none',
        taxId: '12345678901',
        iban: 'DE89370400440532013000'
      }
    }
  },
  {
    title: 'Einnahmen',
    explanation: 'Jetzt tragen wir die Einnahmen ein. Diese Werte finden Sie normalerweise auf Ihrer Lohnsteuerbescheinigung. Für Max nehmen wir ein typisches Jahresgehalt an.',
    buttonText: 'Einnahmen eintragen & Weiter',
    data: {
      income: {
        grossSalary: 62000,
        incomeTax: 12500,
        solidaritySurcharge: 0
      }
    }
  },
  {
    title: 'Ausgaben (Werbungskosten)',
    explanation: 'Hier können berufsbedingte Kosten abgesetzt werden. Wir geben für Max eine Pendlerstrecke und einige Tage im Homeoffice an, um die Pauschalen zu nutzen.',
    buttonText: 'Ausgaben eintragen & Weiter',
    data: {
      expenses: {
        commuteDays: 220,
        commuteDistance: 18,
        homeOfficeDays: 50,
        workEquipment: 150,
        trainingCosts: 0,
        applicationCosts: 0,
        workRelatedTravel: 0,
        accountFees: 16
      }
    }
  },
  {
    title: 'Vorsorgeaufwendungen',
    explanation: 'Versicherungsbeiträge können Ihre Steuerlast mindern. Wir tragen die Beiträge zur Kranken- und einer privaten Haftpflichtversicherung für Max ein.',
    buttonText: 'Vorsorge eintragen & Weiter',
    data: {
      insurances: {
        healthInsurance: 5500,
        liabilityInsurance: 85
      }
    }
  },
  {
    title: 'Haushaltsnahe Ausgaben',
    explanation: 'Hatte Max Hilfe im Haushalt? Wir fügen eine typische Rechnung für eine Fensterreinigung hinzu, um diese Absetzung zu demonstrieren.',
    buttonText: 'Haushalt eintragen & Weiter',
    data: {
      householdServices: {
        services: 250,
        tradesmen: 0
      }
    }
  },
  {
    title: 'Zusammenfassung',
    explanation: 'Perfekt! Alle Daten sind erfasst. Auf dieser Seite sehen Sie eine komplette Übersicht der Steuererklärung von Max Mustermann. Erkunden Sie die Zusammenfassung.',
    buttonText: 'Tour beenden',
  }
];


@Injectable({
  providedIn: 'root',
})
export class TourService {
  getTourContent(): TourContent[] {
    return TOUR_CONTENT;
  }
}

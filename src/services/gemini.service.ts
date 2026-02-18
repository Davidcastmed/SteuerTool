import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { TaxData } from '../models/tax-data.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: This relies on `process.env.API_KEY` being available in the execution environment.
    // Do not ask the user for this key.
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      // In a real app, you might want to disable the feature or handle this more gracefully.
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async getExplanation(topic: string): Promise<string> {
    if (!process.env.API_KEY) {
      return Promise.resolve("Der KI-Assistent ist derzeit nicht verfügbar, da die API-Konfiguration fehlt.");
    }
    
    const prompt = `Erkläre kurz und einfach in maximal 3 Sätzen für einen Laien in Deutschland, was "${topic}" im Kontext der deutschen Steuererklärung bedeutet. Antworte auf Deutsch.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.';
    }
  }

  async getTaxSavingSuggestions(sectionData: any, year: number): Promise<string> {
    if (!process.env.API_KEY || !sectionData || Object.keys(sectionData).length === 0) {
      return '';
    }

    const prompt = `
      **Rolle:** Du bist ein erfahrener deutscher Steuerberater.
      **Aufgabe:** Analysiere die folgenden JSON-Daten aus einem Abschnitt einer deutschen Steuererklärung für das Jahr ${year}. Gib basierend **ausschließlich** auf diesen Daten 1-2 konkrete, umsetzbare und freundliche Vorschläge, welche potenziellen Abzüge oder Pauschalen der Benutzer möglicherweise übersehen hat. Antworte prägnant in Stichpunkten. Wenn die Daten vollständig aussehen und keine offensichtlichen Lücken haben, gib eine positive Bestätigung zurück.
      **WICHTIGE REGELN:**
      1.  Basiere deine Vorschläge NUR auf den bereitgestellten Daten. Erfinde keine Szenarien.
      2.  Beziehe dich auf das deutsche Steuerrecht für ${year}.
      3.  Formuliere als kurze, leicht verständliche Stichpunkte.
      4.  Gib keine allgemeine Finanzberatung.
      **Beispiel-Antwort:**
      *   "Bei Ihren angegebenen Homeoffice-Tagen könnten Sie eventuell auch Kosten für Arbeitsmittel wie einen Schreibtisch oder Bürostuhl geltend machen."
      *   "Haben Sie an die Kontoführungspauschale von 16 € gedacht?"
      
      **Analysiere jetzt diese Daten:**
      ${JSON.stringify(sectionData)}
    `;

    try {
       const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
       console.error('Error calling Gemini API for suggestions:', error);
       return 'Fehler beim Abrufen der Vorschläge.';
    }
  }

  async getExampleTaxData(year: number): Promise<TaxData> {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }

    const prompt = `Erstelle ein vollständiges, realistisches Beispiel für eine deutsche Steuererklärung (Jahr ${year}) für einen einzelnen Angestellten (ledig, Steuerklasse 1) in Deutschland. Gib die Daten ausschließlich als JSON-Objekt zurück, das dem bereitgestellten Schema entspricht. Verwende fiktive, aber glaubwürdige deutsche Namen, Adressen und Finanzdaten.`;

    const taxDataSchema = {
      type: Type.OBJECT,
      properties: {
        personalData: {
          type: Type.OBJECT,
          properties: {
            firstName: { type: Type.STRING, description: "Ein typischer deutscher Vorname." },
            lastName: { type: Type.STRING, description: "Ein typischer deutscher Nachname." },
            dateOfBirth: { type: Type.STRING, description: "Geburtsdatum im Format YYYY-MM-DD." },
            street: { type: Type.STRING, description: "Ein fiktiver deutscher Straßenname." },
            houseNumber: { type: Type.STRING, description: "Eine fiktive Hausnummer." },
            postalCode: { type: Type.STRING, description: "Eine gültige 5-stellige deutsche Postleitzahl." },
            city: { type: Type.STRING, description: "Eine deutsche Stadt." },
            taxId: { type: Type.STRING, description: "Eine 11-stellige fiktive Steuer-ID." },
            iban: { type: Type.STRING, description: "Eine gültige fiktive deutsche IBAN." },
            maritalStatus: { type: Type.STRING, enum: ['single'], description: "Muss 'single' sein." },
            religion: { type: Type.STRING, enum: ['none', 'catholic', 'protestant'], description: "Religionszugehörigkeit." },
          }
        },
        income: {
          type: Type.OBJECT,
          properties: {
            grossSalary: { type: Type.NUMBER, description: "Ein realistisches Bruttojahresgehalt (z.B. zwischen 45000 und 75000)." },
            incomeTax: { type: Type.NUMBER, description: "Eine realistische, zum Gehalt passende Lohnsteuer." },
            solidaritySurcharge: { type: Type.NUMBER, description: `Ein realistischer Solidaritätszuschlag, oft 0 für diese Gehaltsklasse in ${year}.` },
          }
        },
        expenses: {
          type: Type.OBJECT,
          properties: {
            commuteDays: { type: Type.NUMBER, description: "Anzahl der Arbeitstage (z.B. 220)." },
            commuteDistance: { type: Type.NUMBER, description: "Einfache Entfernung zur Arbeit in km (z.B. zwischen 10 und 40)." },
            homeOfficeDays: { type: Type.NUMBER, description: "Anzahl der Homeoffice-Tage (z.B. 80)." },
            workEquipment: { type: Type.NUMBER, description: "Ausgaben für Arbeitsmittel (z.B. 150)." },
            trainingCosts: { type: Type.NUMBER, description: "Ausgaben für Fortbildungen (z.B. 500)." },
            applicationCosts: { type: Type.NUMBER, description: "Ausgaben für Bewerbungen (z.B. 50)." },
            workRelatedTravel: { type: Type.NUMBER, description: "Andere berufsbedingte Reisekosten (z.B. 120)." },
            accountFees: { type: Type.NUMBER, description: "Kontoführungspauschale, typischerweise 16." },
          }
        },
        insurances: {
          type: Type.OBJECT,
          properties: {
            healthInsurance: { type: Type.NUMBER, description: "Realistische selbst gezahlte Beiträge zur Kranken- und Pflegeversicherung." },
            liabilityInsurance: { type: Type.NUMBER, description: "Realistische Beiträge für Haftpflichtversicherungen." },
          }
        },
        householdServices: {
          type: Type.OBJECT,
          properties: {
            services: { type: Type.NUMBER, description: "Ausgaben für haushaltsnahe Dienstleistungen (z.B. 300)." },
            tradesmen: { type: Type.NUMBER, description: "Arbeitskosten für Handwerkerleistungen (z.B. 250)." },
          }
        }
      }
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: taxDataSchema,
        }
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as TaxData;
    } catch (error) {
      console.error('Error calling Gemini API for example data:', error);
      throw new Error('Failed to generate example tax data.');
    }
  }
}
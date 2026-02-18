
import { Component, ChangeDetectionStrategy, input, output, computed, Signal, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { TaxData } from '../../models/tax-data.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent {
  taxData = input.required<TaxData>();
  taxYear = input.required<number>();
  goBack = output<void>();
  restart = output<void>();

  isDownloading = signal(false);

  commuteAllowance: Signal<number> = computed(() => {
    const days = this.taxData().expenses.commuteDays ?? 0;
    const distance = this.taxData().expenses.commuteDistance ?? 0;
    if (days === 0 || distance === 0) return 0;
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
    const days = this.taxData().expenses.homeOfficeDays ?? 0;
    const allowance = days * 6;
    return Math.min(allowance, 1260);
  });

  totalExpenses: Signal<number> = computed(() => {
      const commute = this.commuteAllowance();
      const homeOffice = this.homeOfficeAllowance();
      const expenses = this.taxData().expenses;
      const other = (expenses.workEquipment ?? 0) 
                  + (expenses.trainingCosts ?? 0) 
                  + (expenses.applicationCosts ?? 0)
                  + (expenses.workRelatedTravel ?? 0)
                  + (expenses.accountFees ?? 0);
      return commute + homeOffice + other;
  });
  
  onBack() {
    this.goBack.emit();
  }
  
  onRestart() {
    this.restart.emit();
  }

  async onDownloadPdf() {
    if (this.isDownloading()) return;
    this.isDownloading.set(true);

    try {
      const formElement = document.getElementById('tax-form-summary');
      const actionButtonsElement = document.getElementById('summary-action-buttons');
      
      if (formElement) {
        // Hide buttons during capture so they don't appear in the PDF
        if (actionButtonsElement) actionButtonsElement.style.visibility = 'hidden';

        const canvas = await html2canvas(formElement, { scale: 2 }); // Increase scale for better resolution
        
        // Show buttons again after capture
        if (actionButtonsElement) actionButtonsElement.style.visibility = 'visible';
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const pdfHeight = pdfWidth / ratio;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const lastName = this.taxData().personalData.lastName || 'Unbekannt';
        pdf.save(`Steuererklaerung_${this.taxYear()}_${lastName}.pdf`);
      }
    } catch(e) {
      console.error("Error generating PDF", e);
      alert("Entschuldigung, beim Erstellen des PDFs ist ein Fehler aufgetreten.");
    } finally {
      this.isDownloading.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const fileCount = input.files.length;
      // Placeholder for actual upload logic
      console.log(`${fileCount} file(s) selected:`, input.files);
      alert(`${fileCount} Datei(en) ausgewählt. In einer echten Anwendung würden diese jetzt hochgeladen.`);
    }
  }

  onSubmit() {
    // In a real application, this would send the data to a backend.
    alert('Ihre Daten wurden erfolgreich übermittelt! (Dies ist eine Simulation)');
    this.onRestart();
  }
}
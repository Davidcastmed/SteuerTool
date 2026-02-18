
export interface TaxData {
  personalData: PersonalData;
  income: Income;
  expenses: Expenses;
  insurances: Insurances;
  householdServices: HouseholdServices;
}

export interface PersonalData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  taxId?: string;
  iban?: string;
  maritalStatus?: 'single' | 'married';
  religion?: 'none' | 'catholic' | 'protestant';
}

export interface Income {
  grossSalary?: number;
  incomeTax?: number;
  solidaritySurcharge?: number;
}

export interface Expenses {
  commuteDays?: number;
  commuteDistance?: number;
  homeOfficeDays?: number;
  workEquipment?: number;
  trainingCosts?: number;
  applicationCosts?: number;
  workRelatedTravel?: number;
  accountFees?: number;
}

export interface Insurances {
  healthInsurance?: number;
  liabilityInsurance?: number;
}

export interface HouseholdServices {
  services?: number;
  tradesmen?: number;
}

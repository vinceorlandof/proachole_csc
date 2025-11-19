export enum Role {
  Admin = 'admin',
  Doctor = 'doctor',
  Nurse = 'nurse',
  Manager = 'manager'
}

export interface User {
  id: string;
  name: string;
  susNumber: string;
  role: Role;
  username: string;
  password?: string; // Hashed
}

export interface Patient {
  id: string;
  name: string;
  susNumber: string;
  birthDate: string;
}

export interface Diagnosis {
  cid: string;
  description: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: Diagnosis;
  notes: string;
  prescription: Prescription;
}

export type ViewState = 'dashboard' | 'patients' | 'staff' | 'consultation' | 'prescriptions' | 'protocols' | 'settings';
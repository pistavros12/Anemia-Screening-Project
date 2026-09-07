export type Language = 'en' | 'am' | 'om';
export type Theme = 'light' | 'dark';

export interface HealthWorker {
  id: string;
  username: string;
  fullName: string;
  facilityName: string;
}

export type SeverityLevel = 'Normal' | 'Mild' | 'Moderate' | 'Severe';

export interface ScreeningRecord {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  healthWorker: string;
  locationName: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  rawHb: number;
  adjustedHb: number;
  classificationProb: number;
  anemiaStatus: string;
  severity: SeverityLevel;
  confidenceGated: boolean;
  timestamp: string;
  photoThumbnail?: string;
}

export interface ModelConfig {
  backbone_name: string;
  img_size: number;
  final_threshold: number;
  hb_mean: number;
  hb_std: number;
  use_hybrid: boolean;
}

export type Translations = Record<string, string>;

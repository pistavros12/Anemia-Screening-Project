import { HealthWorker, ScreeningRecord } from '../types';

const STORAGE_USERS_KEY = 'et_anemia_users';
const STORAGE_CURRENT_USER_KEY = 'et_anemia_current_user';
const STORAGE_SCREENINGS_KEY = 'et_anemia_screenings';

// Default initial health worker
const DEFAULT_USERS: (HealthWorker & { passwordHash: string })[] = [
  {
    id: 'user_1',
    username: 'hw_nurse',
    fullName: 'Sr. Almaz Bekele',
    facilityName: 'Addis Ababa Central Health Center',
    passwordHash: 'health2025',
  },
  {
    id: 'user_2',
    username: 'dr_chala',
    fullName: 'Dr. Chala Gemeda',
    facilityName: 'Jimma Rural Health Post',
    passwordHash: 'health2025',
  },
];

// Initial realistic screening records
const INITIAL_SCREENINGS: ScreeningRecord[] = [
  {
    id: 'scr_1',
    patientName: 'Bethlehem Tadesse',
    patientAge: 26,
    patientGender: 'Female',
    healthWorker: 'Sr. Almaz Bekele',
    locationName: 'Addis Ababa, Ethiopia',
    latitude: 9.03,
    longitude: 38.74,
    elevationM: 2355,
    rawHb: 12.4,
    adjustedHb: 11.7,
    classificationProb: 0.68,
    anemiaStatus: 'ANEMIC',
    severity: 'Mild',
    confidenceGated: false,
    timestamp: '2026-09-04 10:15:00',
  },
  {
    id: 'scr_2',
    patientName: 'Dawit Mengistu',
    patientAge: 34,
    patientGender: 'Male',
    healthWorker: 'Sr. Almaz Bekele',
    locationName: 'Debre Berhan, Amhara, Ethiopia',
    latitude: 9.68,
    longitude: 39.53,
    elevationM: 2840,
    rawHb: 14.1,
    adjustedHb: 13.0,
    classificationProb: 0.22,
    anemiaStatus: 'NOT ANEMIC',
    severity: 'Normal',
    confidenceGated: false,
    timestamp: '2026-09-02 14:30:00',
  },
  {
    id: 'scr_3',
    patientName: 'Fatuma Hassen',
    patientAge: 22,
    patientGender: 'Female',
    healthWorker: 'Sr. Almaz Bekele',
    locationName: 'Hawassa, Sidama, Ethiopia',
    latitude: 7.05,
    longitude: 38.48,
    elevationM: 1708,
    rawHb: 8.4,
    adjustedHb: 8.1,
    classificationProb: 0.89,
    anemiaStatus: 'ANEMIC',
    severity: 'Moderate',
    confidenceGated: false,
    timestamp: '2026-08-28 09:40:00',
  },
];

export function getUsers(): (HealthWorker & { passwordHash: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function getCurrentUser(): HealthWorker | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function setCurrentUser(user: HealthWorker | null): void {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

export function registerUser(
  username: string,
  pass: string,
  fullName: string,
  facilityName: string
): { success: boolean; message: string; user?: HealthWorker } {
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username already registered.' };
  }
  const newUser = {
    id: `user_${Date.now()}`,
    username,
    fullName,
    facilityName: facilityName || 'Primary Health Center',
    passwordHash: pass,
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  return {
    success: true,
    message: 'Clinician registered successfully.',
    user: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      facilityName: newUser.facilityName,
    },
  };
}

export function authenticateUser(username: string, pass: string): HealthWorker | null {
  const users = getUsers();
  const found = users.find(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.passwordHash === pass
  );
  if (found) {
    const hw: HealthWorker = {
      id: found.id,
      username: found.username,
      fullName: found.fullName,
      facilityName: found.facilityName,
    };
    setCurrentUser(hw);
    return hw;
  }
  return null;
}

export function getScreenings(): ScreeningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_SCREENINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SCREENINGS_KEY, JSON.stringify(INITIAL_SCREENINGS));
      return INITIAL_SCREENINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCREENINGS;
  }
}

export function saveScreening(record: Omit<ScreeningRecord, 'id'>): ScreeningRecord {
  const screenings = getScreenings();
  const newRec: ScreeningRecord = {
    ...record,
    id: `scr_${Date.now()}`,
  };
  screenings.unshift(newRec);
  localStorage.setItem(STORAGE_SCREENINGS_KEY, JSON.stringify(screenings));
  return newRec;
}

export function getScreeningsSummary(healthWorkerName?: string) {
  const list = getScreenings();
  const filtered = healthWorkerName
    ? list.filter((s) => s.healthWorker === healthWorkerName)
    : list;
  return {
    totalScreenings: filtered.length,
    lastScreeningDate: filtered.length > 0 ? filtered[0].timestamp : 'None recorded',
  };
}

export function deleteScreening(id: string): void {
  try {
    const list = getScreenings();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_SCREENINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete screening record', err);
  }
}

export async function generatePdfReport(record: ScreeningRecord): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Ethiopian Header / Title
    doc.setFillColor(30, 58, 138); // Royal Blue
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('An AI-Based Anemia Screening Application', 14, 11);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Point-of-Care Conjunctival Screening & Elevation Compensated Report', 14, 18);

    // Decorative Ethiopian colored bar
    doc.setFillColor(7, 138, 59); // Green
    doc.rect(0, 24, 70, 3, 'F');
    doc.setFillColor(252, 209, 22); // Yellow
    doc.rect(70, 24, 70, 3, 'F');
    doc.setFillColor(218, 18, 26); // Red
    doc.rect(140, 24, 70, 3, 'F');

    // Section: Patient Information
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Patient & Examination Details', 14, 38);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Full Name: ${record.patientName}`, 14, 46);
    doc.text(`Age: ${record.patientAge} years   |   Gender: ${record.patientGender}`, 14, 53);
    doc.text(`Screening Clinician / Facility: ${record.healthWorker}`, 14, 60);
    doc.text(`Date & Time: ${record.timestamp}`, 14, 67);

    // Section: Altitude / Geolocation
    doc.setFont('helvetica', 'bold');
    doc.text('2. Geographic Altitude Compensation', 14, 78);

    doc.setFont('helvetica', 'normal');
    doc.text(`Location: ${record.locationName}`, 14, 86);
    doc.text(`GPS Coordinates: ${record.latitude.toFixed(4)} N, ${record.longitude.toFixed(4)} E`, 14, 93);
    doc.text(`Elevation: ${Math.round(record.elevationM)} meters a.s.l.`, 14, 100);

    // Section: Results
    doc.setFont('helvetica', 'bold');
    doc.text('3. Hemoglobin & Classification Findings', 14, 111);

    // Results Box
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 116, 182, 48, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(`Anemia Status: ${record.anemiaStatus}`, 20, 126);
    doc.text(`Severity Classification: ${record.severity}`, 20, 134);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Measured (Raw) Hb: ${record.rawHb.toFixed(1)} g/dL (Sea-level unadjusted)`, 20, 142);
    doc.setFont('helvetica', 'bold');
    doc.text(`Altitude-Adjusted Hb: ${record.adjustedHb.toFixed(1)} g/dL (WHO guideline offset)`, 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Model Confidence Score: ${(record.classificationProb * 100).toFixed(1)}%`, 20, 158);

    // Clinical guidance note
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Notice: Non-invasive screening tool. Diagnostic confirmation with complete blood count (CBC)',
      14,
      175
    );
    doc.text(
      'or automated photometer is strongly advised for clinical case management and prescription.',
      14,
      180
    );

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('AI Based non-invasive Anemia Assesment', 14, 285);

    doc.save(`anemia_report_${record.patientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  } catch (err) {
    console.error('PDF generation error', err);
    window.print();
  }
}


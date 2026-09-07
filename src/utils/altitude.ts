import { SeverityLevel } from '../types';

/**
 * Calculates altitude-adjusted hemoglobin:
 * e = elevation_m / 1000.0
 * correction = -0.032 * e + 0.022 * (e ** 2)
 * return measured_hb - correction
 */
export function altitudeAdjustedHb(measuredHb: number, elevationM: number): number {
  const e = elevationM / 1000.0;
  const correction = -0.032 * e + 0.022 * (e * e);
  return Number((measuredHb - correction).toFixed(2));
}

/**
 * Classifies WHO severity banding:
 * Severe: < 8.0 g/dL
 * Moderate: 8.0 - 10.9 g/dL
 * Mild: 11.0 - 11.9 g/dL (female/general) or 11.0 - 12.9 g/dL (male)
 * Normal: >= 12.0 g/dL (female/general) or >= 13.0 g/dL (male)
 */
export function classifySeverity(adjustedHb: number, gender: string = 'Female'): SeverityLevel {
  const isMale = gender.toLowerCase().includes('male') && !gender.toLowerCase().includes('female');
  const mildCutoff = isMale ? 13.0 : 12.0;

  if (adjustedHb < 8.0) {
    return 'Severe';
  } else if (adjustedHb < 11.0) {
    return 'Moderate';
  } else if (adjustedHb < mildCutoff) {
    return 'Mild';
  } else {
    return 'Normal';
  }
}

/**
 * Confidence Gating:
 * If the classification probability is within 10 percentage points of the threshold,
 * the result is genuinely ambiguous and must be gated.
 */
export function isConfidenceGated(classificationProb: number, threshold: number = 0.42): boolean {
  return Math.abs(classificationProb - threshold) <= 0.10;
}

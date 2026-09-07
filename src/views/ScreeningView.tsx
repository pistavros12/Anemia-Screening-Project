import React, { useState } from 'react';
import {
  User,
  FlaskConical,
  AlertTriangle,
  AlertOctagon,
  Download,
  Save,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { HealthWorker, Language, Theme, ScreeningRecord, SeverityLevel } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PhotoCapture } from '../components/PhotoCapture';
import { EthiopiaMap } from '../components/EthiopiaMap';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { TibebBorder } from '../components/TibebBorder';
import { saveScreening, generatePdfReport } from '../utils/storage';

interface Props {
  currentUser: HealthWorker;
  lang: Language;
  theme: Theme;
  onScreeningSaved?: () => void;
}

export const ScreeningView: React.FC<Props> = ({
  currentUser,
  lang,
  theme,
  onScreeningSaved,
}) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  // Step A: Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(28);
  const [patientGender, setPatientGender] = useState<'Female' | 'Male' | 'Other'>('Female');

  // Step B: Image Capture
  const [rawImageData, setRawImageData] = useState<string | null>(null);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);

  // Step C: Location & Elevation (defaults to Debre Berhan highland, 2840m)
  const [latitude, setLatitude] = useState(9.68);
  const [longitude, setLongitude] = useState(39.53);
  const [elevationM, setElevationM] = useState(2840);
  const [locationName, setLocationName] = useState('Debre Berhan, Amhara (Highland)');

  // Step D: Execution state & findings
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreeningRecord | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLocationChange = (lat: number, lon: number, elev: number, locName: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setElevationM(elev);
    setLocationName(locName);
  };

  /**
   * Run Analysis:
   * 1. Inspect image RGB chromatic distribution of the conjunctival mucosal ROI
   * 2. Estimate unadjusted Hemoglobin (Hb) based on erythema / mucosal pallor index
   * 3. Compute WHO highland elevation compensation:
   *    e = elevation / 1000
   *    deltaHb = -0.032 * e + 0.022 * (e ** 2)
   *    adjustedHb = rawHb - deltaHb
   * 4. Classify anemia status according to WHO sex-stratified diagnostic cutoffs
   */
  const handleRunAnalysis = () => {
    if (!patientName.trim()) {
      alert(t.alert_enter_name);
      return;
    }
    if (!rawImageData) {
      alert(t.alert_capture_photo);
      return;
    }

    setIsAnalyzing(true);
    setSavedSuccess(false);

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 64, 64);
        }
        const imgData = ctx?.getImageData(0, 0, 64, 64);
        let rSum = 0,
          gSum = 0,
          bSum = 0;
        const totalPixels = 64 * 64;

        if (imgData) {
          for (let i = 0; i < imgData.data.length; i += 4) {
            rSum += imgData.data[i];
            gSum += imgData.data[i + 1];
            bSum += imgData.data[i + 2];
          }
        }

        const avgR = rSum / totalPixels;
        const avgG = gSum / totalPixels;
        const avgB = bSum / totalPixels;

        // Erythema & Pallor ratio index: higher red over green-blue signals healthy perfusion
        const mucosalIndex = avgR / (avgG + avgB + 1);

        // Map to realistic biological raw Hb range: [6.5, 15.5] g/dL
        let estimatedRawHb = 6.5 + mucosalIndex * 5.8;
        const clampedRawHb = Math.min(16.5, Math.max(5.5, Number(estimatedRawHb.toFixed(1))));

        // WHO Elevation Adjustment Formulation
        const e = Math.max(0, elevationM) / 1000.0;
        const deltaHb = -0.032 * e + 0.022 * e * e;
        const adjustedHb = Number((clampedRawHb - deltaHb).toFixed(1));

        // WHO Diagnostic Thresholds
        const normalThreshold = patientGender === 'Male' ? 13.0 : 12.0;

        let status = adjustedHb < normalThreshold ? t.status_anemic : t.status_not_anemic;
        let severity: SeverityLevel = 'Normal';

        if (adjustedHb < normalThreshold) {
          if (adjustedHb >= 11.0) {
            severity = 'Mild';
          } else if (adjustedHb >= 8.0) {
            severity = 'Moderate';
          } else {
            severity = 'Severe';
          }
        }

        // Probability assessment
        let classificationProb = 0.5 + (normalThreshold - adjustedHb) * 0.08;
        classificationProb = Math.min(0.96, Math.max(0.04, classificationProb));

        // Ambiguous confidence gating: probability between 0.38 and 0.46
        const gated = classificationProb >= 0.38 && classificationProb <= 0.46;

        const screeningRec: ScreeningRecord = {
          id: `scr_${Date.now()}`,
          patientName: patientName.trim(),
          patientAge,
          patientGender,
          healthWorker: currentUser.fullName,
          locationName,
          latitude,
          longitude,
          elevationM,
          rawHb: clampedRawHb,
          adjustedHb,
          classificationProb: Number(classificationProb.toFixed(3)),
          anemiaStatus: status,
          severity,
          confidenceGated: gated,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          photoThumbnail: croppedImageData || rawImageData,
        };

        setResult(screeningRec);
        setIsAnalyzing(false);
      };
      img.src = croppedImageData || rawImageData;
    }, 900);
  };

  const handleSaveToRegistry = () => {
    if (!result) return;
    saveScreening(result);
    setSavedSuccess(true);
    if (onScreeningSaved) onScreeningSaved();
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    generatePdfReport(result);
  };

  const localizedStatus = result
    ? result.adjustedHb < (result.patientGender === 'Male' ? 13.0 : 12.0)
      ? t.status_anemic
      : t.status_not_anemic
    : '';

  const localizedSeverity =
    result?.severity === 'Normal'
      ? t.severity_normal
      : result?.severity === 'Mild'
      ? t.severity_mild
      : result?.severity === 'Moderate'
      ? t.severity_moderate
      : t.severity_severe;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title Card with Interactive Green Border */}
      <div
        className={`box-interactive-green rounded-2xl shadow-lg overflow-hidden mb-6 relative transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950 shadow-emerald-500/10'
        }`}
      >
        <TibebBorder theme={theme} height={12} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className={`font-serif-header text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-950'
              }`}>
                {t.nav_screening}
              </h1>
              <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {t.app_subtitle}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold self-start sm:self-auto ${
                isDark
                  ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
              }`}
            >
              {t.clinician_badge}: {currentUser.fullName}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step A: Patient Demographics with Interactive Light Green Border */}
        <section
          id="step-a-patient-info"
          className={`box-interactive-green rounded-2xl p-4 sm:p-6 shadow-sm transition-all ${
            isDark
              ? 'bg-[#1E293B] text-[#F8FAFC]'
              : 'bg-white text-slate-950'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <User className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <h2 className={`font-serif-header text-base sm:text-lg font-extrabold ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.step_a_title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="patient-name-input" className={`block text-xs font-extrabold mb-1.5 ${
                isDark ? 'text-slate-200' : 'text-slate-950'
              }`}>
                {t.patient_name} *
              </label>
              <input
                id="patient-name-input"
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Bethlehem Tadesse"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all ${
                  isDark
                    ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                    : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>

            <div>
              <label htmlFor="patient-age-input" className={`block text-xs font-extrabold mb-1.5 ${
                isDark ? 'text-slate-200' : 'text-slate-950'
              }`}>
                {t.patient_age}
              </label>
              <input
                id="patient-age-input"
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all ${
                  isDark
                    ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                    : 'bg-white border-emerald-300 text-slate-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>

            <div>
              <label htmlFor="patient-gender-select" className={`block text-xs font-extrabold mb-1.5 ${
                isDark ? 'text-slate-200' : 'text-slate-950'
              }`}>
                {t.patient_gender}
              </label>
              <select
                id="patient-gender-select"
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as 'Female' | 'Male' | 'Other')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                    : 'bg-white border-emerald-300 text-slate-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              >
                <option value="Female" className="text-slate-950 bg-white font-bold">{t.gender_female}</option>
                <option value="Male" className="text-slate-950 bg-white font-bold">{t.gender_male}</option>
                <option value="Other" className="text-slate-950 bg-white font-bold">{t.gender_other}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Step B: Photo Capture */}
        <PhotoCapture
          onImageSelected={(raw, cropped) => {
            setRawImageData(raw);
            setCroppedImageData(cropped);
          }}
          lang={lang}
          theme={theme}
        />

        {/* Middle Section Artistic Pattern Divider */}
        <div className="py-2">
          <TibebBorder theme={theme} height={12} className="rounded-md" />
        </div>

        {/* Step C: Location & Altitude with Active Searchable Map */}
        <EthiopiaMap
          latitude={latitude}
          longitude={longitude}
          elevationM={elevationM}
          locationName={locationName}
          onLocationChange={handleLocationChange}
          lang={lang}
          theme={theme}
        />

        {/* Action Trigger Button: Run Model */}
        <div className="text-center py-2">
          <button
            id="btn-run-model-analysis"
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !rawImageData || !patientName.trim()}
            className={`w-full sm:w-auto px-10 py-4 rounded-xl font-extrabold text-base shadow-md border-2 flex items-center justify-center gap-3 mx-auto transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
              isDark
                ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500'
                : 'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-800'
            } disabled:opacity-40 disabled:pointer-events-none`}
          >
            <FlaskConical className="w-5 h-5" />
            <span>{isAnalyzing ? t.analyzing : t.btn_run_model}</span>
          </button>
        </div>

        {/* Step D: Result Findings Card */}
        {result && (
          <section id="step-d-results-card" className="space-y-4 pt-2">
            {result.confidenceGated ? (
              /* Confidence Gating Warning Box with Interactive Golden Border */
              <div
                className={`box-interactive-gold p-6 rounded-2xl flex items-start gap-4 ${
                  isDark
                    ? 'bg-amber-950/40 text-amber-200'
                    : 'bg-amber-50/90 text-amber-950 shadow-sm'
                }`}
              >
                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className={`font-serif-header text-lg font-extrabold ${
                    isDark ? 'text-amber-300' : 'text-amber-950'
                  }`}>
                    {t.gating_notice_title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-bold ${
                    isDark ? 'text-amber-200' : 'text-amber-950'
                  }`}>{t.gating_warning}</p>
                  <p className={`text-xs font-mono font-extrabold ${
                    isDark ? 'text-amber-300' : 'text-amber-900'
                  }`}>
                    {t.gating_probability_label.replace('{prob}', (result.classificationProb * 100).toFixed(1))}
                  </p>
                </div>
              </div>
            ) : (
              /* Definitive Result Card with Interactive Golden Border */
              <div
                className={`box-interactive-gold rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden transition-all ${
                  result.severity === 'Normal'
                    ? isDark
                      ? 'bg-emerald-950/30 text-[#F8FAFC]'
                      : 'bg-emerald-50/80 text-slate-950'
                    : result.severity === 'Mild'
                    ? isDark
                      ? 'bg-amber-950/30 text-[#F8FAFC]'
                      : 'bg-amber-50/80 text-slate-950'
                    : result.severity === 'Moderate'
                    ? isDark
                      ? 'bg-orange-950/30 text-[#F8FAFC]'
                      : 'bg-orange-50/80 text-slate-950'
                    : isDark
                    ? 'bg-rose-950/30 text-[#F8FAFC]'
                    : 'bg-rose-50/80 text-slate-950'
                }`}
              >
                <TibebBorder theme={theme} height={12} />

                {/* Primary Status Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-6 border-b-2 border-emerald-200 dark:border-emerald-900/50">
                  <div>
                    <span className={`text-xs uppercase font-extrabold tracking-wider block mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {t.anemia_status}
                    </span>
                    <h2 className={`font-serif-header text-3xl sm:text-4xl font-black tracking-tight ${
                      isDark ? 'text-slate-100' : 'text-slate-950'
                    }`}>
                      {localizedStatus}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className={`text-xs uppercase font-extrabold tracking-wider block mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {t.severity_label}
                    </span>
                    <span
                      className={`inline-block px-4 py-1.5 rounded-xl font-black text-sm sm:text-base shadow-sm border-2 ${
                        result.severity === 'Normal'
                          ? 'bg-emerald-700 border-emerald-500 text-white'
                          : result.severity === 'Mild'
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : result.severity === 'Moderate'
                          ? 'bg-orange-600 border-orange-400 text-white'
                          : 'bg-rose-700 border-rose-500 text-white'
                      }`}
                    >
                      {localizedSeverity}
                    </span>
                  </div>
                </div>

                {/* Quantitative Metric Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b-2 border-emerald-200 dark:border-emerald-900/50">
                  <div>
                    <span className={`text-xs font-extrabold block mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {t.raw_hb}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl sm:text-3xl font-black font-serif-header ${
                        isDark ? 'text-slate-100' : 'text-slate-950'
                      }`}>
                        {result.rawHb.toFixed(1)}
                      </span>
                      <span className={`text-xs font-black ${
                        isDark ? 'text-slate-300' : 'text-slate-800'
                      }`}>g/dL</span>
                    </div>
                    <span className={`text-[11px] font-bold ${
                      isDark ? 'text-slate-400' : 'text-slate-700'
                    }`}>{t.sea_level_unadjusted}</span>
                  </div>

                  <div>
                    <span className={`text-xs font-extrabold block mb-1 ${
                      isDark ? 'text-emerald-300' : 'text-emerald-900'
                    }`}>
                      {t.adjusted_hb}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl sm:text-3xl font-black font-serif-header ${
                        isDark ? 'text-emerald-400' : 'text-emerald-800'
                      }`}>
                        {result.adjustedHb.toFixed(1)}
                      </span>
                      <span className={`text-xs font-black ${
                        isDark ? 'text-emerald-400' : 'text-emerald-800'
                      }`}>g/dL</span>
                    </div>
                    <span className={`text-[11px] font-extrabold ${
                      isDark ? 'text-emerald-400' : 'text-emerald-900'
                    }`}>
                      {t.altitude_offset}: {result.adjustedHb - result.rawHb >= 0 ? '+' : ''}
                      {(result.adjustedHb - result.rawHb).toFixed(2)} g/dL
                    </span>
                  </div>

                  <div>
                    <span className={`text-xs font-extrabold block mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {t.elevation_used}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl sm:text-3xl font-black font-serif-header ${
                        isDark ? 'text-slate-100' : 'text-slate-950'
                      }`}>
                        {Math.round(result.elevationM)}
                      </span>
                      <span className={`text-xs font-black ${
                        isDark ? 'text-slate-300' : 'text-slate-800'
                      }`}>m</span>
                    </div>
                    <span className={`text-[11px] font-bold truncate block max-w-[200px] ${
                      isDark ? 'text-slate-400' : 'text-slate-700'
                    }`}>
                      {result.locationName}
                    </span>
                  </div>
                </div>

                {/* Severe Anemia Prompt Medical Notice */}
                {result.severity === 'Severe' && (
                  <div className="mt-6 p-4 rounded-xl bg-rose-700 text-white flex items-start gap-3 shadow-md border-2 border-rose-500">
                    <AlertOctagon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold leading-relaxed">{t.severe_alert}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medical Disclaimer on Result Card */}
            <MedicalDisclaimer lang={lang} theme={theme} />

            {/* Step E: Save Record & Download Report PDF with Interactive Green Border */}
            <section
              id="step-e-report-actions"
              className={`box-interactive-green rounded-2xl p-6 shadow-sm transition-all ${
                isDark
                  ? 'bg-[#1E293B] text-[#F8FAFC]'
                  : 'bg-white text-slate-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Layers className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                <h3 className={`font-serif-header text-base sm:text-lg font-extrabold ${
                  isDark ? 'text-slate-100' : 'text-slate-950'
                }`}>
                  {t.step_e_title}
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="btn-save-to-registry"
                  onClick={handleSaveToRegistry}
                  disabled={savedSuccess}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-700 border-2 border-emerald-600 text-white cursor-default'
                      : isDark
                      ? 'bg-[#0F172A] border-2 border-emerald-700/60 text-[#F8FAFC] hover:border-emerald-400'
                      : 'bg-white border-2 border-emerald-400 text-slate-950 hover:bg-emerald-50'
                  }`}
                >
                  {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{savedSuccess ? t.save_success : t.btn_save_db}</span>
                </button>

                <button
                  id="btn-download-pdf-report"
                  onClick={handleDownloadPdf}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md border-2 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500'
                      : 'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-800'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>{t.btn_download_pdf}</span>
                </button>
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  );
};

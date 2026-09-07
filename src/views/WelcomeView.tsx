import React from 'react';
import { Stethoscope, Calendar, ArrowRight, ClipboardCheck, Activity } from 'lucide-react';
import { Language, Theme, HealthWorker } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { getScreeningsSummary } from '../utils/storage';
import { TibebBorder } from '../components/TibebBorder';

interface Props {
  currentUser: HealthWorker;
  onStartScreening: () => void;
  lang: Language;
  theme: Theme;
}

export const WelcomeView: React.FC<Props> = ({
  currentUser,
  onStartScreening,
  lang,
  theme,
}) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const stats = getScreeningsSummary(currentUser.fullName);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Welcome Banner Card with Interactive Light Green Border */}
      <div
        className={`box-interactive-green rounded-2xl shadow-lg overflow-hidden mb-8 relative transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950 shadow-emerald-500/10'
        }`}
      >
        <TibebBorder theme={theme} height={8} />

        <div className="p-6 sm:p-10">
          <div className="max-w-2xl">
            <span
              className={`text-xs uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-full mb-4 inline-block border-2 ${
                isDark
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300'
              }`}
            >
              {t.clinical_station} | {currentUser.facilityName}
            </span>

            <h1 className={`font-serif-header text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.welcome_back.replace('{name}', currentUser.fullName)}
            </h1>

            <p
              className={`text-base sm:text-lg mb-8 leading-relaxed font-bold ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}
            >
              {t.welcome_desc}
            </p>

            {/* Primary Call to Action */}
            <button
              id="btn-start-new-screening"
              onClick={onStartScreening}
              className={`px-7 py-3.5 rounded-xl font-bold text-base shadow-md flex items-center gap-2.5 border-2 border-emerald-400 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                isDark
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:border-emerald-300'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800 hover:border-emerald-500'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>{t.start_screening}</span>
              <ArrowRight className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards: Interactive Green & Golden Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          className={`box-interactive-green rounded-2xl p-6 shadow-sm transition-all ${
            isDark
              ? 'bg-[#1E293B] text-[#F8FAFC]'
              : 'bg-white text-slate-950'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-extrabold uppercase tracking-wider ${
              isDark ? 'text-emerald-300' : 'text-emerald-900'
            }`}>
              {t.screenings_logged}
            </span>
            <div
              className={`p-2.5 rounded-xl border-2 ${
                isDark
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/50'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl sm:text-4xl font-serif-header font-extrabold tracking-tight ${
            isDark ? 'text-slate-100' : 'text-slate-950'
          }`}>
            {stats.totalScreenings}
          </p>
          <p className={`text-xs mt-1 font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {t.recorded_clinician_id}
          </p>
        </div>

        <div
          className={`box-interactive-gold rounded-2xl p-6 shadow-sm transition-all ${
            isDark
              ? 'bg-[#1E293B] text-[#F8FAFC]'
              : 'bg-white text-slate-950'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-extrabold uppercase tracking-wider ${
              isDark ? 'text-amber-300' : 'text-amber-900'
            }`}>
              {t.last_screening_date}
            </span>
            <div
              className={`p-2.5 rounded-xl border-2 ${
                isDark
                  ? 'bg-amber-950/60 text-amber-400 border-amber-600/50'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-serif-header font-extrabold truncate tracking-tight ${
            isDark ? 'text-slate-100' : 'text-slate-950'
          }`}>
            {stats.lastScreeningDate}
          </p>
          <p className={`text-xs mt-1 font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {t.timestamp_latest_encounter}
          </p>
        </div>
      </div>
    </div>
  );
};

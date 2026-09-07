import React from 'react';
import { Info, Mountain, BookOpen, Building2 } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { TibebBorder } from '../components/TibebBorder';

interface Props {
  lang: Language;
  theme: Theme;
}

export const AboutUsView: React.FC<Props> = ({ lang, theme }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title Card */}
      <div
        className={`box-interactive-green rounded-2xl overflow-hidden mb-8 relative transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950 shadow-sm'
        }`}
      >
        <TibebBorder theme={theme} height={12} />

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Info className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <h1 className={`font-serif-header text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.about_us_title}
            </h1>
          </div>
          <p className={`text-sm sm:text-base max-w-3xl font-bold leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            {t.about_us_desc}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Altitude Physiology Card */}
        <div
          className={`box-interactive-green rounded-2xl p-6 shadow-sm transition-all ${
            isDark
              ? 'bg-[#1E293B] text-[#F8FAFC]'
              : 'bg-white text-slate-950'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Mountain className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <h2 className={`font-serif-header text-lg sm:text-xl font-extrabold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.altitude_physiology_title}
            </h2>
          </div>

          <div className={`space-y-3 text-xs sm:text-sm leading-relaxed font-bold ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            <p>{t.altitude_physiology_text}</p>
            <p>{t.altitude_highland_regions}</p>

            <div
              className={`box-interactive-green p-4 rounded-xl font-mono text-xs ${
                isDark ? 'bg-[#0F172A] text-slate-100' : 'bg-emerald-50/70 text-slate-950'
              }`}
            >
              <span className={`font-black block mb-1 ${
                isDark ? 'text-emerald-400' : 'text-emerald-900'
              }`}>
                {t.altitude_formula_label}
              </span>
              e = elevation_in_meters / 1000.0
              <br />
              ΔHb = -0.032 · e + 0.022 · e²
              <br />
              Adjusted_Hb = Measured_Hb - ΔHb
            </div>
          </div>
        </div>

        {/* WHO Guideline Citation */}
        <div
          className={`box-interactive-gold rounded-2xl p-6 shadow-sm transition-all ${
            isDark
              ? 'bg-[#1E293B] text-[#F8FAFC]'
              : 'bg-white text-slate-950'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <BookOpen className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            <h2 className={`font-serif-header text-lg sm:text-xl font-extrabold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.who_report_title}
            </h2>
          </div>

          <div className={`space-y-2.5 text-xs sm:text-sm leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            <p className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
              {t.who_report_heading}
            </p>
            <p className={`italic font-bold ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>
              {t.who_report_citation}
            </p>
            <p className="font-bold">
              {t.who_guidance_note}
            </p>
          </div>
        </div>

        {/* Institutional Contact Card */}
        <div
          className={`box-interactive-green rounded-2xl p-6 shadow-sm transition-all ${
            isDark
              ? 'bg-[#1E293B] text-[#F8FAFC]'
              : 'bg-white text-slate-950'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Building2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <h2 className={`font-serif-header text-lg sm:text-xl font-extrabold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.deployment_collab_title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div
              className={`box-interactive-green p-4 rounded-xl ${
                isDark ? 'bg-[#0F172A]' : 'bg-emerald-50/50'
              }`}
            >
              <p className={`font-extrabold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                {t.deployment_support_title}
              </p>
              <p className={`font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {t.deployment_collab_desc}
              </p>
            </div>

            <div
              className={`box-interactive-gold p-4 rounded-xl ${
                isDark ? 'bg-[#0F172A]' : 'bg-amber-50/50'
              }`}
            >
              <p className={`font-extrabold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                {t.tech_inquiries}
              </p>
              <p className={`font-bold leading-relaxed font-mono ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>
                {t.tech_contact_address}
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <MedicalDisclaimer lang={lang} theme={theme} />
      </div>
    </div>
  );
};

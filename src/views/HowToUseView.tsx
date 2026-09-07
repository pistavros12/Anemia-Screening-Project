import React from 'react';
import {
  HelpCircle,
  Camera,
  Eye,
  CheckCircle,
  XCircle,
  Stethoscope,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { TibebBorder } from '../components/TibebBorder';

interface Props {
  lang: Language;
  theme: Theme;
}

export const HowToUseView: React.FC<Props> = ({ lang, theme }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const steps = [
    {
      num: 1,
      title: t.how_step_1_title,
      icon: Eye,
      desc: t.how_step_1_desc,
    },
    {
      num: 2,
      title: t.how_step_2_title,
      icon: Stethoscope,
      desc: t.how_step_2_desc,
    },
    {
      num: 3,
      title: t.how_step_3_title,
      icon: Camera,
      desc: t.how_step_3_desc,
    },
    {
      num: 4,
      title: t.how_step_4_title,
      icon: MapPin,
      desc: t.how_step_4_desc,
    },
    {
      num: 5,
      title: t.how_step_5_title,
      icon: FileCheck,
      desc: t.how_step_5_desc,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title Banner */}
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
            <HelpCircle className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <h1 className={`font-serif-header text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.how_to_use_title}
            </h1>
          </div>
          <p className={`text-sm sm:text-base max-w-3xl font-bold leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            {t.how_to_use_subtitle}
          </p>
        </div>
      </div>

      {/* Step-by-Step Cards */}
      <div className="space-y-4 mb-10">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className={`box-interactive-green rounded-2xl p-5 sm:p-6 shadow-sm flex items-start gap-4 transition-all ${
                isDark
                  ? 'bg-[#1E293B] text-[#F8FAFC]'
                  : 'bg-white text-slate-950'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 shadow-xs ${
                  isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-2 border-emerald-600'
                    : 'bg-emerald-700 text-white border-2 border-emerald-500'
                }`}
              >
                {s.num}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                  <h3 className={`font-serif-header font-extrabold text-base sm:text-lg ${
                    isDark ? 'text-slate-100' : 'text-slate-950'
                  }`}>
                    {s.title}
                  </h3>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed font-bold ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}>
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Quality Comparison: Acceptable vs Unusable */}
      <div className="mb-10">
        <h2 className={`font-serif-header text-xl sm:text-2xl font-extrabold mb-4 tracking-tight ${
          isDark ? 'text-slate-100' : 'text-slate-950'
        }`}>
          {t.criteria_title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Acceptable */}
          <div
            className={`box-interactive-green rounded-2xl p-6 shadow-sm ${
              isDark
                ? 'bg-emerald-950/30 text-[#F8FAFC]'
                : 'bg-emerald-50/80 text-slate-950'
            }`}
          >
            <div className="flex items-center gap-2 mb-3.5 text-emerald-800 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-serif-header font-extrabold text-base sm:text-lg text-emerald-950 dark:text-emerald-200">
                {t.acceptable_criteria_title}
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-0.5">•</span>
                <span>{t.acc_crit_1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-0.5">•</span>
                <span>{t.acc_crit_2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-0.5">•</span>
                <span>{t.acc_crit_3}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-0.5">•</span>
                <span>{t.acc_crit_4}</span>
              </li>
            </ul>
          </div>

          {/* Unusable */}
          <div
            className={`rounded-2xl p-6 border-2 border-rose-400 hover:border-rose-600 shadow-sm transition-all ${
              isDark
                ? 'bg-rose-950/30 text-[#F8FAFC]'
                : 'bg-rose-50/90 text-slate-950'
            }`}
          >
            <div className="flex items-center gap-2 mb-3.5 text-rose-800 dark:text-rose-400">
              <XCircle className="w-5 h-5 text-rose-700 dark:text-rose-400" />
              <h3 className="font-serif-header font-extrabold text-base sm:text-lg text-rose-950 dark:text-rose-200">
                {t.unusable_criteria_title}
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100">
              <li className="flex items-start gap-2">
                <span className="text-rose-700 dark:text-rose-400 font-extrabold mt-0.5">•</span>
                <span>{t.rej_crit_1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-700 dark:text-rose-400 font-extrabold mt-0.5">•</span>
                <span>{t.rej_crit_2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-700 dark:text-rose-400 font-extrabold mt-0.5">•</span>
                <span>{t.rej_crit_3}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-700 dark:text-rose-400 font-extrabold mt-0.5">•</span>
                <span>{t.rej_crit_4}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* WHO Reference Tiers Card */}
      <div
        className={`box-interactive-gold rounded-2xl p-6 sm:p-8 shadow-sm transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950'
        }`}
      >
        <h2 className={`font-serif-header text-lg sm:text-xl font-extrabold mb-3 tracking-tight ${
          isDark ? 'text-slate-100' : 'text-slate-950'
        }`}>
          {t.who_guidance_title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            className={`box-interactive-green p-4 rounded-xl ${
              isDark ? 'bg-[#0F172A]' : 'bg-emerald-50/50'
            }`}
          >
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block mb-1">
              WHO Reference Target: Non-Pregnant Females
            </span>
            <p className={`text-base font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{t.who_female_ref}</p>
          </div>

          <div
            className={`box-interactive-green p-4 rounded-xl ${
              isDark ? 'bg-[#0F172A]' : 'bg-emerald-50/50'
            }`}
          >
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block mb-1">
              WHO Reference Target: Adult Males
            </span>
            <p className={`text-base font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{t.who_male_ref}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="box-interactive-green p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20">
            <span className="font-black text-emerald-900 dark:text-emerald-400 block mb-1">{t.severity_normal}</span>
            <p className="font-bold text-slate-950 dark:text-slate-200 leading-relaxed">{t.who_normal_desc}</p>
          </div>

          <div className="box-interactive-gold p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20">
            <span className="font-black text-amber-900 dark:text-amber-400 block mb-1">{t.severity_mild}</span>
            <p className="font-bold text-slate-950 dark:text-slate-200 leading-relaxed">{t.who_mild_desc}</p>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-orange-400 hover:border-orange-600 transition-all bg-orange-50/80 dark:bg-orange-950/20">
            <span className="font-black text-orange-950 dark:text-orange-400 block mb-1">{t.severity_moderate}</span>
            <p className="font-bold text-slate-950 dark:text-slate-200 leading-relaxed">{t.who_mod_desc}</p>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-rose-400 hover:border-rose-600 transition-all bg-rose-50/80 dark:bg-rose-950/20">
            <span className="font-black text-rose-950 dark:text-rose-400 block mb-1">{t.severity_severe}</span>
            <p className="font-bold text-slate-950 dark:text-slate-200 leading-relaxed">{t.who_sev_desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

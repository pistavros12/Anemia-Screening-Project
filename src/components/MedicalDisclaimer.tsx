import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface Props {
  lang: Language;
  theme: Theme;
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<Props> = ({ lang, theme, compact = false }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  return (
    <aside
      id="medical-disclaimer-box"
      aria-labelledby="disclaimer-title"
      className={`box-interactive-gold rounded-xl transition-all ${
        isDark
          ? 'bg-amber-950/20 text-amber-200'
          : 'bg-amber-50/90 text-amber-950 shadow-sm'
      } ${compact ? 'p-3 text-xs' : 'p-4 sm:p-5 text-sm my-4'}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`flex-shrink-0 mt-0.5 ${
            isDark ? 'text-amber-400' : 'text-amber-800'
          } ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
        />
        <div className="space-y-1">
          <h2
            id="disclaimer-title"
            className={`font-extrabold tracking-wider uppercase ${
              compact ? 'text-[11px]' : 'text-xs sm:text-xs'
            } ${isDark ? 'text-amber-300' : 'text-amber-950'}`}
          >
            {t.medical_disclaimer_title}
          </h2>
          <p className={`leading-relaxed font-bold ${isDark ? 'text-amber-200' : 'text-amber-950'}`}>
            {t.medical_disclaimer}
          </p>
        </div>
      </div>
    </aside>
  );
};

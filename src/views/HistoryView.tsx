import React, { useState, useEffect } from 'react';
import { History, Search, Download, Trash2, FileText } from 'lucide-react';
import { ScreeningRecord, Language, Theme, HealthWorker } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { getScreenings, deleteScreening, generatePdfReport } from '../utils/storage';
import { TibebBorder } from '../components/TibebBorder';

interface Props {
  records?: ScreeningRecord[];
  onRefresh?: () => void;
  currentUser?: HealthWorker | null;
  lang: Language;
  theme: Theme;
}

export const HistoryView: React.FC<Props> = ({ records, onRefresh, lang, theme }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [internalRecords, setInternalRecords] = useState<ScreeningRecord[]>(() => records || getScreenings());

  useEffect(() => {
    if (records) {
      setInternalRecords(records);
    } else {
      setInternalRecords(getScreenings());
    }
  }, [records]);

  const activeRecords = records || internalRecords;

  const filtered = activeRecords.filter(
    (r) =>
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm(t.delete_confirm)) {
      deleteScreening(id);
      if (onRefresh) {
        onRefresh();
      } else {
        setInternalRecords(getScreenings());
      }
    }
  };

  const handleDownloadSinglePdf = (record: ScreeningRecord) => {
    generatePdfReport(record);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Title Card */}
      <div
        className={`box-interactive-green rounded-2xl overflow-hidden mb-6 relative transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950 shadow-sm'
        }`}
      >
        <TibebBorder theme={theme} height={12} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <History className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                <h1 className={`font-serif-header text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-950'
                }`}>
                  {t.history_title}
                </h1>
              </div>
              <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {t.history_subtitle}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="search-patient-input"
                type="text"
                placeholder={t.history_search_placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border-2 outline-none font-bold transition-all ${
                  isDark
                    ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] placeholder-slate-400 focus:border-emerald-400'
                    : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Screenings Table / List */}
      <div
        className={`box-interactive-green rounded-2xl overflow-hidden shadow-sm transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950'
        }`}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-10 h-10 mx-auto opacity-50 mb-3 text-emerald-600" />
            <p className={`font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{t.history_empty_title}</p>
            <p className={`text-xs sm:text-sm mt-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              {t.history_empty_sub}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`text-xs font-black border-b-2 ${
                    isDark ? 'border-emerald-800/50 bg-[#0F172A]/90 text-slate-100' : 'border-emerald-300 bg-emerald-50 text-slate-950'
                  }`}
                >
                  <th className="py-3.5 px-4">{t.table_patient_name}</th>
                  <th className="py-3.5 px-4">{t.table_age_sex}</th>
                  <th className="py-3.5 px-4">{t.table_location}</th>
                  <th className="py-3.5 px-4">{t.table_elevation}</th>
                  <th className="py-3.5 px-4">{t.table_raw_hb}</th>
                  <th className="py-3.5 px-4">{t.table_adjusted_hb}</th>
                  <th className="py-3.5 px-4">{t.table_severity}</th>
                  <th className="py-3.5 px-4">{t.table_date}</th>
                  <th className="py-3.5 px-4 text-right">{t.table_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors font-medium ${
                      isDark ? 'hover:bg-[#0F172A]/60' : 'hover:bg-emerald-50/40'
                    }`}
                  >
                    <td className={`py-3.5 px-4 font-extrabold whitespace-nowrap ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                      {item.patientName}
                    </td>
                    <td className={`py-3.5 px-4 text-xs font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      {item.patientAge}{t.years_short} / {
                        item.patientGender === 'Female'
                          ? t.gender_female
                          : item.patientGender === 'Male'
                          ? t.gender_male
                          : t.gender_other
                      }
                    </td>
                    <td className={`py-3.5 px-4 text-xs font-bold truncate max-w-[150px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`} title={item.locationName}>
                      {item.locationName}
                    </td>
                    <td className={`py-3.5 px-4 text-xs font-extrabold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      {Math.round(item.elevationM)} m
                    </td>
                    <td className={`py-3.5 px-4 whitespace-nowrap font-mono text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      {item.rawHb.toFixed(1)} g/dL
                    </td>
                    <td className={`py-3.5 px-4 whitespace-nowrap font-mono text-xs font-black ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                      {item.adjustedHb.toFixed(1)} g/dL
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border-2 ${
                          item.severity === 'Normal'
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                            : item.severity === 'Mild'
                            ? 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                            : item.severity === 'Moderate'
                            ? 'bg-orange-100 text-orange-950 border-orange-400 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-700'
                            : 'bg-rose-100 text-rose-950 border-rose-400 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700'
                        }`}
                      >
                        {item.severity === 'Normal'
                          ? t.severity_normal
                          : item.severity === 'Mild'
                          ? t.severity_mild
                          : item.severity === 'Moderate'
                          ? t.severity_moderate
                          : t.severity_severe}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-xs font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      {item.timestamp.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadSinglePdf(item)}
                          title={t.download_pdf_btn}
                          className={`box-interactive-green p-2 rounded-lg transition-all cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 text-emerald-300'
                              : 'bg-white text-emerald-900 shadow-xs'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title={t.delete_record_btn}
                          className={`p-2 rounded-lg border-2 border-rose-300 hover:border-rose-500 transition-all cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 text-rose-400'
                              : 'bg-white text-rose-800 shadow-xs'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

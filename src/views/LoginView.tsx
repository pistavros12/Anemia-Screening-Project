import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Stethoscope, AlertCircle } from 'lucide-react';
import { Language, Theme, HealthWorker } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { authenticateUser, registerUser } from '../utils/storage';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { TibebBorder } from '../components/TibebBorder';

interface Props {
  onLoginSuccess: (user: HealthWorker) => void;
  lang: Language;
  theme: Theme;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess, lang, theme }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('hw_nurse');
  const [password, setPassword] = useState('health2025');
  const [fullName, setFullName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      const user = authenticateUser(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('Invalid clinician credentials. Demo account: hw_nurse / health2025');
      }
    } else {
      if (!fullName.trim() || !username.trim() || !password.trim()) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      const res = registerUser(username, password, fullName, facilityName);
      if (res.success && res.user) {
        setSuccessMsg(res.message);
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4">
      <div
        className={`box-interactive-green rounded-2xl shadow-lg overflow-hidden relative transition-all ${
          isDark
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'bg-white text-slate-950 shadow-emerald-500/10'
        }`}
      >
        <TibebBorder theme={theme} height={8} />

        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xs border-2 ${
                isDark
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/50'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <Stethoscope className="w-7 h-7" />
            </div>
            <h2 className={`font-serif-header text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {t.login_title}
            </h2>
            <p
              className={`text-sm mt-1.5 max-w-sm mx-auto font-bold ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}
            >
              {t.login_subtitle}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl mb-6 border-2 ${
              isDark ? 'bg-[#0F172A] border-emerald-800/40' : 'bg-emerald-50/60 border-emerald-300'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? isDark
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-700 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-800 hover:text-emerald-950'
              }`}
            >
              {t.btn_login}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? isDark
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-700 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-800 hover:text-emerald-950'
              }`}
            >
              {t.btn_register}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className={`block text-xs font-extrabold mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-950'
                  }`}>
                    {t.full_name} *
                  </label>
                  <input
                    id="input-reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sr. Almaz Bekele"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all ${
                      isDark
                        ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                        : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-extrabold mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-950'
                  }`}>
                    {t.facility_name}
                  </label>
                  <input
                    id="input-reg-facility"
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="e.g. Debre Berhan Primary Clinic"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all ${
                      isDark
                        ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                        : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                    }`}
                  />
                </div>
              </>
            )}

            <div>
              <label className={`block text-xs font-extrabold mb-1.5 ${
                isDark ? 'text-slate-200' : 'text-slate-950'
              }`}>
                {t.username} *
              </label>
              <input
                id="input-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Staff ID"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all ${
                  isDark
                    ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                    : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-extrabold mb-1.5 ${
                isDark ? 'text-slate-200' : 'text-slate-950'
              }`}>
                {t.password} *
              </label>
              <input
                id="input-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border-2 font-bold outline-none transition-all ${
                  isDark
                    ? 'bg-[#0F172A] border-emerald-700/60 text-[#F8FAFC] focus:border-emerald-400'
                    : 'bg-white border-emerald-300 text-slate-950 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1 font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pt-1 font-bold">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </p>
            )}

            <button
              id="btn-submit-auth"
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-xs transition-all mt-2 cursor-pointer ${
                isDark
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              {mode === 'login' ? t.btn_login : t.btn_register}
            </button>
          </form>

          {/* Clinician Note */}
          <div className="mt-6 pt-4 border-t-2 border-emerald-200 dark:border-emerald-900/60 text-center">
            <div className={`box-interactive-gold p-3 rounded-xl text-xs font-bold ${
              isDark ? 'text-amber-200 bg-amber-950/20' : 'text-amber-950 bg-amber-50/70'
            }`}>
              {mode === 'login' ? (
                <>
                  Demo Credentials: <span className="font-mono font-extrabold text-amber-950 dark:text-amber-300 underline">hw_nurse</span> /{' '}
                  <span className="font-mono font-extrabold text-amber-950 dark:text-amber-300 underline">health2025</span>
                </>
              ) : (
                'Accounts are securely stored in the facility registry database.'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer at Login */}
      <MedicalDisclaimer lang={lang} theme={theme} />
    </div>
  );
};

import React from 'react';
import {
  Globe,
  Sun,
  Moon,
  LogOut,
  Stethoscope,
  History,
  HelpCircle,
  Info,
  Menu,
  X,
} from 'lucide-react';
import { Language, Theme, HealthWorker } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { TibebBorder } from './TibebBorder';

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
  currentUser: HealthWorker | null;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({
  currentView,
  onNavigate,
  lang,
  onLanguageChange,
  theme,
  onToggleTheme,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'welcome', label: t.nav_welcome, icon: Stethoscope },
    { id: 'screening', label: t.nav_screening, icon: Stethoscope },
    { id: 'history', label: t.nav_history, icon: History },
    { id: 'how_to_use', label: t.nav_how_to_use, icon: HelpCircle },
    { id: 'about_us', label: t.nav_about_us, icon: Info },
  ];

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-40 w-full transition-colors border-b shadow-xs ${
        isDark
          ? 'bg-[#0F172A]/95 border-blue-900/50 text-[#F8FAFC]'
          : 'bg-white/95 border-blue-200 text-slate-900'
      } backdrop-blur-md`}
    >
      {/* Top Artistic Ethiopian Border Strip */}
      <TibebBorder theme={theme} height={12} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Section with Empty Logo Section as requested */}
          <div
            id="brand-logo-button"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(currentUser ? 'welcome' : 'login')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onNavigate(currentUser ? 'welcome' : 'login');
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            {/* Logo section kept empty as explicitly requested: "only change the logo section to empty" */}
            <div id="header-empty-logo-slot" className="hidden" aria-hidden="true" />

            <div>
              <h1 className={`font-serif-header text-base sm:text-lg font-extrabold tracking-tight leading-tight ${
                isDark ? 'text-slate-100' : 'text-slate-950'
              }`}>
                {t.app_title}
              </h1>
              <p
                className={`text-[11px] sm:text-xs font-semibold ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                {t.app_subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? isDark
                          ? 'bg-emerald-700 text-white shadow-sm border-2 border-emerald-400'
                          : 'bg-emerald-700 text-white shadow-sm border-2 border-emerald-500'
                        : isDark
                        ? 'text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-emerald-500/40'
                        : 'text-slate-900 hover:text-emerald-950 hover:bg-emerald-50/80 border border-transparent hover:border-emerald-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Controls: Language, Theme, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative flex items-center">
              <label htmlFor="language-selector" className="sr-only">Select Language</label>
              <Globe
                className={`w-4 h-4 mr-1.5 hidden sm:inline ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              />
              <select
                id="language-selector"
                value={lang}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className={`text-xs sm:text-sm rounded-xl px-2.5 py-1.5 font-bold border-2 transition-all cursor-pointer outline-none ${
                  isDark
                    ? 'bg-[#1E293B] border-emerald-600/50 text-[#F8FAFC] hover:border-emerald-400 focus:border-emerald-400'
                    : 'bg-white border-emerald-400 text-slate-950 hover:border-emerald-600 shadow-xs focus:border-emerald-600'
                }`}
              >
                <option value="en" className="text-slate-950 bg-white font-semibold">English</option>
                <option value="am" className="text-slate-950 bg-white font-semibold">አማርኛ (Amharic)</option>
                <option value="om" className="text-slate-950 bg-white font-semibold">Afaan Oromoo</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-button"
              onClick={onToggleTheme}
              aria-label="Toggle light/dark theme"
              className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1E293B] border-amber-500/50 text-amber-400 hover:border-amber-400 hover:bg-slate-800'
                  : 'bg-white border-amber-400 text-amber-900 hover:border-amber-500 hover:bg-amber-50/60 shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Info / Logout */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2.5 pl-2.5 border-l-2 border-emerald-300 dark:border-emerald-800">
                <div className="text-right">
                  <p className={`text-xs font-extrabold leading-tight ${
                    isDark ? 'text-slate-100' : 'text-slate-950'
                  }`}>{currentUser.fullName}</p>
                  <p
                    className={`text-[11px] leading-tight truncate max-w-[130px] font-bold ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}
                  >
                    {currentUser.facilityName}
                  </p>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title={t.nav_logout}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? 'border-rose-900/60 hover:bg-slate-800 text-rose-400 hover:border-rose-500'
                      : 'border-rose-200 hover:bg-rose-50 text-rose-700 hover:border-rose-400'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            {currentUser && (
              <button
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-blue-200 dark:border-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {currentUser && mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className={`lg:hidden px-4 pt-2 pb-4 border-t ${
            isDark ? 'bg-[#0F172A] border-slate-800 text-[#F8FAFC]' : 'bg-white border-blue-200 text-slate-900'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-emerald-700 text-white border-2 border-emerald-400'
                        : 'bg-emerald-700 text-white border-2 border-emerald-500'
                      : isDark
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-slate-950 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t-2 border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
              <div>
                <p className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{currentUser.fullName}</p>
                <p className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{currentUser.facilityName}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-400 font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.nav_logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

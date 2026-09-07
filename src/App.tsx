import React, { useState, useEffect } from 'react';
import { Language, Theme, HealthWorker } from './types';
import { getCurrentUser, setCurrentUser } from './utils/storage';
import { Header } from './components/Header';
import { TRANSLATIONS } from './data/translations';
import { LoginView } from './views/LoginView';
import { WelcomeView } from './views/WelcomeView';
import { ScreeningView } from './views/ScreeningView';
import { HistoryView } from './views/HistoryView';
import { HowToUseView } from './views/HowToUseView';
import { AboutUsView } from './views/AboutUsView';

export function App() {
  const [currentUser, setUserState] = useState<HealthWorker | null>(() => getCurrentUser());
  const [currentView, setCurrentView] = useState<string>(() => (getCurrentUser() ? 'welcome' : 'login'));
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoginSuccess = (user: HealthWorker) => {
    setUserState(user);
    setCurrentUser(user);
    setCurrentView('welcome');
  };

  const handleLogout = () => {
    setUserState(null);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#0B0F19] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* Top Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        lang={lang}
        onLanguageChange={(newLang) => setLang(newLang)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Body */}
      <main className="flex-1 w-full">
        {!currentUser || currentView === 'login' ? (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            lang={lang}
            theme={theme}
          />
        ) : currentView === 'welcome' ? (
          <WelcomeView
            currentUser={currentUser}
            onStartScreening={() => setCurrentView('screening')}
            lang={lang}
            theme={theme}
          />
        ) : currentView === 'screening' ? (
          <ScreeningView
            currentUser={currentUser}
            lang={lang}
            theme={theme}
            onScreeningSaved={() => {
              // optional callback
            }}
          />
        ) : currentView === 'history' ? (
          <HistoryView
            currentUser={currentUser}
            lang={lang}
            theme={theme}
          />
        ) : currentView === 'how_to_use' ? (
          <HowToUseView
            lang={lang}
            theme={theme}
          />
        ) : currentView === 'about_us' ? (
          <AboutUsView
            lang={lang}
            theme={theme}
          />
        ) : (
          <WelcomeView
            currentUser={currentUser}
            onStartScreening={() => setCurrentView('screening')}
            lang={lang}
            theme={theme}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        id="main-app-footer"
        className={`w-full py-5 px-4 border-t-2 text-center text-xs font-bold tracking-wide transition-colors ${
          theme === 'dark'
            ? 'bg-[#0F172A] border-emerald-900/60 text-slate-300'
            : 'bg-white border-emerald-300 text-slate-950'
        }`}
      >
        <p>{TRANSLATIONS[lang].footer_text}</p>
      </footer>
    </div>
  );
}

export default App;


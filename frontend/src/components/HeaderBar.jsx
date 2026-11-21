import React from 'react';
import { Scissors, Crown, Sun, Moon } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

export default function HeaderBar({ 
  lang, 
  setLang, 
  t, 
  userRole, 
  onOpenSuperAdmin, 
  onOpenSuperAdminSecret,
  isDarkMode, 
  onToggleTheme 
}) {
  const [logoClicks, setLogoClicks] = React.useState(0);

  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        hapticFeedback.notification('success');
        if (onOpenSuperAdminSecret) onOpenSuperAdminSecret();
        return 0;
      }
      setTimeout(() => setLogoClicks(0), 3000);
      return next;
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand logo / name with secret click handler for PC development */}
      <div 
        className="flex items-center space-x-2 cursor-pointer select-none"
        onClick={handleLogoClick}
        title="BarberHub"
      >
        <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white shadow">
          <Scissors className="w-4 h-4 text-brand-orange" />
        </div>
        <div>
          <span className="font-bold text-brand-blue text-base tracking-tight">
            Barber<span className="text-brand-orange">Hub</span>
          </span>
          <span className="text-[10px] text-gray-500 block -mt-1 font-semibold">
            {userRole === 'barber' ? t.header_barber_cabinet : t.header_client_salon}
          </span>
        </div>
      </div>

      {/* Language Selector & Dark Theme & Super Admin Button */}
      <div className="flex items-center space-x-1.5">
        {onToggleTheme && (
          <button
            type="button"
            onClick={() => {
              hapticFeedback.selection();
              onToggleTheme();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-amber-500 hover:bg-gray-100 transition-colors"
            title={isDarkMode ? "Kunduzgi rejim" : "Tungi rejim"}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}

        {/* 👑 Faqat Super Admin / Platforma egasiga ko'rinadigan maxsus tugma */}
        {onOpenSuperAdmin && (
          <button
            onClick={() => {
              hapticFeedback.impact('medium');
              onOpenSuperAdmin();
            }}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/25 to-yellow-400/35 hover:from-amber-400/35 hover:to-yellow-400/45 text-amber-950 border border-amber-300 transition-all shadow-xs flex items-center space-x-1 animate-in fade-in active:scale-95"
            title="👑 Super Admin Boshqaruv Markaziga qaytish"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-wider">Super Admin</span>
          </button>
        )}

        <div className="relative flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
          <button
            onClick={() => {
              hapticFeedback.selection();
              setLang('uz');
            }}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
              lang === 'uz' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            UZ
          </button>
          <button
            onClick={() => {
              hapticFeedback.selection();
              setLang('ru');
            }}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
              lang === 'ru' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => {
              hapticFeedback.selection();
              setLang('en');
            }}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
              lang === 'en' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}

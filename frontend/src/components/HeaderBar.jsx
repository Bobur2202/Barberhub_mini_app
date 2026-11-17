import React from 'react';
import { Scissors } from 'lucide-react';

export default function HeaderBar({ lang, setLang, t, userRole }) {
  return (
    <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand logo / name */}
      <div className="flex items-center space-x-2">
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

      {/* Language Selector (Faqat til tanlash turadi, hech qanday ortiqcha rejim switcheri yo'q) */}
      <div className="flex items-center space-x-1.5">
        <div className="relative flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
          <button
            onClick={() => setLang('uz')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
              lang === 'uz' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            UZ
          </button>
          <button
            onClick={() => setLang('ru')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
              lang === 'ru' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLang('en')}
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

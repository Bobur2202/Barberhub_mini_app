import React from 'react';
import { Scissors } from 'lucide-react';

export default function SplashScreen({ onSelectLanguage }) {
  return (
    <div className="min-h-screen bg-[#E6EDF9] flex flex-col justify-between px-6 py-12 max-w-md mx-auto">
      {/* Top spacing */}
      <div className="pt-8"></div>

      {/* Center Barber Logo & Branding */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Barber Pole Icon Frame */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-white shadow-xl shadow-blue-900/10 flex items-center justify-center border border-blue-100">
            {/* Detailed Barber Pole SVG representation */}
            <div className="w-14 h-20 bg-brand-blue rounded-md p-1.5 flex flex-col items-center justify-between relative overflow-hidden shadow-inner">
              <div className="w-full h-2 bg-brand-orange rounded-t-sm"></div>
              <div className="w-full flex-1 my-1 relative overflow-hidden flex flex-col justify-around py-1">
                <div className="w-full h-1.5 bg-white transform -rotate-12 scale-125 opacity-90"></div>
                <div className="w-full h-1.5 bg-brand-orange transform -rotate-12 scale-125"></div>
                <div className="w-full h-1.5 bg-white transform -rotate-12 scale-125 opacity-90"></div>
              </div>
              <div className="w-full h-2 bg-brand-orange rounded-b-sm"></div>
            </div>
          </div>
          {/* Accent badge */}
          <div className="absolute -bottom-2 -right-2 bg-brand-orange text-brand-blue p-2 rounded-full shadow-lg">
            <Scissors className="w-4 h-4 transform -rotate-45" />
          </div>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-3xl font-extrabold text-brand-blue tracking-tight">
          Barber<span className="text-brand-orange">Hub</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">
          Erkaklar sartaroshxonalari tarmog'i
        </p>
      </div>

      {/* Bottom Language Selection Buttons */}
      <div className="w-full space-y-3 pb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Tilni tanlang / Select Language
        </p>

        {/* 1. O'zbek tili */}
        <button
          onClick={() => onSelectLanguage('uz')}
          className="w-full py-4 rounded-xl font-bold text-brand-blue bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 text-center text-base"
        >
          O'zbek tili
        </button>

        {/* 2. Русский язык */}
        <button
          onClick={() => onSelectLanguage('ru')}
          className="w-full py-3.5 rounded-xl font-bold text-brand-blue bg-transparent border-2 border-brand-blue hover:bg-blue-50 active:scale-[0.98] transition-all text-center text-base"
        >
          Русский язык
        </button>

        {/* 3. English (Yangi qo'shildi) */}
        <button
          onClick={() => onSelectLanguage('en')}
          className="w-full py-3.5 rounded-xl font-bold text-brand-blue bg-transparent border-2 border-brand-blue hover:bg-blue-50 active:scale-[0.98] transition-all text-center text-base"
        >
          English
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Scissors, Info, X, Sparkles, MapPin, Clock, ShieldCheck, BellRing } from 'lucide-react';

export default function SplashScreen({ onSelectLanguage }) {
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#E6EDF9] flex flex-col justify-between px-6 py-8 max-w-md mx-auto relative">
      {/* Top Bar with Info button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => setShowAboutModal(true)}
          className="text-xs font-bold text-brand-blue bg-white/80 hover:bg-white px-3 py-1.5 rounded-full shadow-2xs border border-blue-100 flex items-center space-x-1.5 transition-all active:scale-95"
        >
          <Info className="w-3.5 h-3.5 text-brand-orange" />
          <span>Bot haqida</span>
        </button>
      </div>

      {/* Center Barber Logo & Branding */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-4">
        {/* Barber Pole Icon Frame */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-blue-900/10 flex items-center justify-center border border-blue-100">
            {/* Detailed Barber Pole SVG representation */}
            <div className="w-12 h-16 bg-brand-blue rounded-md p-1.5 flex flex-col items-center justify-between relative overflow-hidden shadow-inner">
              <div className="w-full h-2 bg-brand-orange rounded-t-sm"></div>
              <div className="w-full flex-1 my-1 relative overflow-hidden flex flex-col justify-around py-1">
                <div className="w-full h-1 bg-white transform -rotate-12 scale-125 opacity-90"></div>
                <div className="w-full h-1 bg-brand-orange transform -rotate-12 scale-125"></div>
                <div className="w-full h-1 bg-white transform -rotate-12 scale-125 opacity-90"></div>
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
        <p className="text-gray-500 text-xs mt-1.5 font-medium max-w-xs leading-relaxed">
          O'zbekistondagi zamonaviy erkaklar sartaroshxonalari tarmog'i va onlayn navbat ekotizimi
        </p>

        {/* 3 Quick highlights pill row */}
        <div className="flex items-center space-x-2 mt-4 flex-wrap justify-center gap-y-1.5">
          <span className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-brand-orange" />
            <span>Yaqin sartaroshlar</span>
          </span>
          <span className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>Jonli navbat</span>
          </span>
          <span className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>AI Maslahatchi</span>
          </span>
        </div>
      </div>

      {/* Bottom Language Selection Buttons */}
      <div className="w-full space-y-2.5 pb-2">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Tilni tanlang / Select Language
        </p>

        {/* 1. O'zbek tili */}
        <button
          onClick={() => onSelectLanguage('uz')}
          className="w-full py-3.5 rounded-2xl font-bold text-brand-blue bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 text-center text-sm"
        >
          O'zbek tili
        </button>

        {/* 2. Русский язык */}
        <button
          onClick={() => onSelectLanguage('ru')}
          className="w-full py-3 rounded-2xl font-bold text-brand-blue bg-white/70 border border-blue-200 hover:bg-white active:scale-[0.98] transition-all text-center text-sm"
        >
          Русский язык
        </button>

        {/* 3. English */}
        <button
          onClick={() => onSelectLanguage('en')}
          className="w-full py-3 rounded-2xl font-bold text-brand-blue bg-white/70 border border-blue-200 hover:bg-white active:scale-[0.98] transition-all text-center text-sm"
        >
          English
        </button>

        {/* About Bot Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAboutModal(true)}
            className="text-xs font-bold text-brand-blue/80 hover:text-brand-blue inline-flex items-center space-x-1 transition-colors"
          >
            <span>ℹ️ BarberHub nima bera oladi? (Batafsil)</span>
          </button>
        </div>
      </div>

      {/* ℹ️ BOT HAQIDA MODAL OYNASI */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-brand-orange flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-brand-blue">
                    BarberHub haqida
                  </h3>
                  <span className="text-[10px] text-gray-400">Platformaning asosiy imkoniyatlari</span>
                </div>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs text-gray-700 leading-relaxed">
              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
                <p className="font-semibold text-brand-blue">
                  💈 <b>BarberHub</b> — sartaroshxonalarda navbat kutishni butunlay unutish va vaqtni tejash uchun yaratilgan onlayn platforma.
                </p>
              </div>

              {/* Mijozlar uchun */}
              <div>
                <h4 className="font-black text-brand-blue uppercase text-[11px] tracking-wider mb-2 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-orange inline-block" />
                  <span>Mijozlar uchun qulayliklar:</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><b>Yaqin ustalarni topish:</b> GPS orqali o'zingizga yaqin sartaroshlarni topasiz va piyoda vaqtni ko'rasiz.</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><b>Jonli navbat:</b> Istalgan vaqtga 1 bosishda navbat olasiz, salonda kutib o'tirmaysiz.</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <BellRing className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><b>Avto-eslatma:</b> Navbatingizga 30 daqiqa qolganda Telegram bot eslatma yuboradi.</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span><b>AI Sartarosh:</b> Yuz tuzilishingizga mos keluvchi eng yaxshi turmakni sun'iy intellekt tavsiya qiladi.</span>
                  </div>
                </div>
              </div>

              {/* Ustalar uchun */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-black text-brand-blue uppercase text-[11px] tracking-wider mb-2 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Ustalar uchun imkoniyatlar:</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <Scissors className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><b>Yangi mijozlar oqimi:</b> O'z xizmatlaringiz va narxlaringizni umumiy katalogda reklama qilasiz.</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                    <span><b>Avtomatlashtirish:</b> Buyurtmalarni boshqarish, kassa hisoboti va mijozlarga avtomatik SMS/Telegram xabarlar.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-98 mt-2"
            >
              Tushundim, davom etish ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

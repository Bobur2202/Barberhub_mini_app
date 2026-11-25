import React, { useState } from 'react';
import { User, Scissors, ArrowRight, ShieldCheck, Sparkles, Crown, Lock, Info, X, MapPin, Clock, BellRing } from 'lucide-react';

export default function RoleSelectionScreen({ onSelectRole, t, lang = 'uz', isSuperAdmin = false }) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === '7777' || pinInput === 'admin2026') {
      setShowPinModal(false);
      onSelectRole('super_admin');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-between px-5 py-8 max-w-md mx-auto text-slate-900 dark:text-white">
      {/* Top Header */}
      <div className="pt-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-blue dark:bg-slate-900 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-900/10 mb-3 border border-transparent dark:border-slate-800">
          <Scissors className="w-8 h-8 text-brand-orange" />
        </div>
        <h1 className="text-2xl font-black text-brand-blue dark:text-white tracking-tight">
          Barber<span className="text-brand-orange">Hub</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">
          {t?.role_prompt || (lang === 'ru' ? 'С какой целью вы хотите использовать платформу?' : lang === 'en' ? 'How do you want to use the platform?' : 'Platformadan qanday maqsadda foydalanmoqchisiz?')}
        </p>
      </div>

      {/* Role Cards Section */}
      <div className="space-y-4 my-auto py-6">
        {/* 1. Client Card */}
        <div
          onClick={() => onSelectRole('client')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border-2 border-transparent dark:border-slate-800 hover:border-brand-blue/30 dark:hover:border-amber-400/40 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-brand-blue dark:text-amber-400 group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <User className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-brand-blue dark:text-white">
                  {t?.role_client_title || (lang === 'ru' ? 'Я клиент' : lang === 'en' ? 'I am a client' : 'Men mijozman')}
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-brand-blue dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t?.role_client_desc || (lang === 'ru' ? 'Найти ближайших барберов, посмотреть цены и записаться в очередь.' : lang === 'en' ? 'Find nearby barbers, check prices, and book appointments.' : "O'zimga eng yaqin sartaroshlarni topish, narxlarni ko'rish va navbatga yozilish.")}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t?.role_client_badge || (lang === 'ru' ? 'Быстрая, бесплатная и удобная запись' : lang === 'en' ? 'Fast, free, and easy booking' : 'Tezkor, bepul va qulay band qilish')}</span>
          </div>
        </div>

        {/* 2. Barber Card */}
        <div
          onClick={() => onSelectRole('barber')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border-2 border-transparent dark:border-slate-800 hover:border-brand-orange/40 dark:hover:border-amber-400/40 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center text-brand-orange dark:text-amber-400 group-hover:bg-brand-orange group-hover:text-brand-blue transition-colors">
              <Scissors className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-brand-blue dark:text-white">
                  {t?.role_barber_title || (lang === 'ru' ? 'Я мастер / Барбершоп' : lang === 'en' ? 'I am a barber / Barbershop' : 'Men ustaman / Barbershop')}
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-brand-orange dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t?.role_barber_desc || (lang === 'ru' ? 'Добавить барбершоп в каталог, привлечь клиентов и управлять записями.' : lang === 'en' ? 'List barbershop in directory, attract new clients, and manage appointments.' : "Sartaroshxonamni umumiy katalogga qo'shish, yangi mijozlar oqimi va navbatlarni boshqarish.")}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center space-x-1.5 text-[11px] font-semibold text-brand-orange dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t?.role_barber_badge || (lang === 'ru' ? 'Панель управления SaaS + Уведомления в Telegram' : lang === 'en' ? 'SaaS dashboard + Telegram notifications' : 'SaaS boshqaruv paneli + Telegram bildirishnomalar')}</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Super Admin Button (Faqat Super Admin uchun ko'rinadi) */}
      <div className="text-center pb-2 space-y-2">
        {isSuperAdmin && (
          <button
            onClick={() => setShowPinModal(true)}
            className="text-xs font-bold text-gray-400 dark:text-slate-400 hover:text-brand-blue dark:hover:text-amber-400 transition-colors inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'ru' ? 'Владелец платформы (Super Admin)' : lang === 'en' ? 'Platform Owner (Super Admin)' : 'Platforma egasi (Super Admin)'}</span>
          </button>
        )}

        <div>
          <button
            onClick={() => setShowInfoModal(true)}
            className="text-[11px] font-bold text-brand-blue/80 dark:text-slate-300 hover:text-brand-blue dark:hover:text-amber-400 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{lang === 'ru' ? 'ℹ️ Что такое BarberHub? (О боте)' : lang === 'en' ? 'ℹ️ What is BarberHub? (About)' : "ℹ️ BarberHub nima? (Bot haqida ma'lumot)"}</span>
          </button>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-500">
          {lang === 'ru' ? 'Выбор можно изменить позже в настройках' : lang === 'en' ? 'You can change this anytime in settings' : "Tanlovni keyinchalik sozlamalar bo'limidan o'zgartirish mumkin"}
        </p>
      </div>

      {/* ℹ️ BOT HAQIDA MA'LUMOT MODALI */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col border border-transparent dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-brand-orange dark:text-amber-400 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-brand-blue dark:text-white">
                    {lang === 'ru' ? 'О сервисе BarberHub' : lang === 'en' ? 'About BarberHub' : 'BarberHub haqida'}
                  </h3>
                  <span className="text-[10px] text-gray-400 dark:text-slate-400">
                    {lang === 'ru' ? 'Основные возможности платформы' : lang === 'en' ? 'Key platform capabilities' : 'Platformaning asosiy imkoniyatlari'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-blue-50/80 dark:bg-slate-800/60 rounded-2xl border border-blue-100 dark:border-slate-700">
                <p className="font-semibold text-brand-blue dark:text-amber-400">
                  {lang === 'ru'
                    ? '💈 BarberHub — современная платформа, избавляющая от живых очередей и экономящая ваше время.'
                    : lang === 'en'
                    ? '💈 BarberHub — cutting-edge platform designed to eliminate waiting queues and save your time.'
                    : "💈 BarberHub — sartaroshxonalarda navbat kutishni butunlay unutish va vaqtni tejash uchun yaratilgan zamonaviy platforma."}
                </p>
              </div>

              {/* Mijozlar uchun */}
              <div>
                <h4 className="font-black text-brand-blue dark:text-white uppercase text-[11px] tracking-wider mb-2 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-orange inline-block" />
                  <span>{lang === 'ru' ? 'Для клиентов:' : lang === 'en' ? 'For clients:' : 'Mijozlar uchun:'}</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span>
                      <b className="text-slate-900 dark:text-white">{lang === 'ru' ? 'Мастера рядом:' : lang === 'en' ? 'Nearby barbers:' : 'Yaqin ustalar:'}</b>{' '}
                      {lang === 'ru' ? 'Поиск ближайших мастеров на карте и расстояние.' : lang === 'en' ? 'Find nearest barbers on the map and check distance.' : "Xaritadan eng yaqin sartaroshlarni topish va masofani ko'rish."}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <b className="text-slate-900 dark:text-white">{lang === 'ru' ? 'Живая очередь:' : lang === 'en' ? 'Live queue:' : 'Jonli navbat:'}</b>{' '}
                      {lang === 'ru' ? 'Быстрая запись на сегодня или любой день в пару кликов.' : lang === 'en' ? 'Instant slot booking for today or any date.' : "Istalgan kunga yoki bugunga bir necha soniyada navbat olish."}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <BellRing className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <b className="text-slate-900 dark:text-white">{lang === 'ru' ? 'Авто-напоминание:' : lang === 'en' ? 'Auto-reminder:' : 'Avto-eslatma:'}</b>{' '}
                      {lang === 'ru' ? 'Telegram бот напомнит за 30-60 минут до начала.' : lang === 'en' ? 'Telegram bot reminds you 30-60 mins before appointment.' : "Navbatingizga 30 daqiqa qolganda Telegram bot eslatma beradi."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ustalar uchun */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                <h4 className="font-black text-brand-blue dark:text-white uppercase text-[11px] tracking-wider mb-2 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{lang === 'ru' ? 'Для мастеров:' : lang === 'en' ? 'For barbers:' : 'Ustalar uchun:'}</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <Scissors className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <b className="text-slate-900 dark:text-white">{lang === 'ru' ? 'Поток клиентов:' : lang === 'en' ? 'Client flow:' : 'Yangi mijozlar oqimi:'}</b>{' '}
                      {lang === 'ru' ? 'Продвижение услуг и набор постоянных клиентов.' : lang === 'en' ? 'Showcase your services and build loyal clientele.' : "O'z xizmatlaringizni reklama qilish va doimiy mijozlar orttirish."}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-brand-blue dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <b className="text-slate-900 dark:text-white">{lang === 'ru' ? 'Касса и график:' : lang === 'en' ? 'Finance & schedule:' : 'Kassa va Grafik:'}</b>{' '}
                      {lang === 'ru' ? 'Настройка расписания, отслеживание выручки и заказов.' : lang === 'en' ? 'Custom work hours, revenue tracking and booking manager.' : "Ish vaqtini sozlash, kunlik daromadni kuzatish va buyurtmalarni boshqarish."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-brand-blue dark:bg-amber-400 hover:bg-brand-blue-dark dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              {lang === 'ru' ? 'Понятно, продолжить ✓' : lang === 'en' ? 'Got it, continue ✓' : 'Tushundim, davom etish ✓'}
            </button>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center border border-transparent dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-brand-orange dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-transparent dark:border-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-brand-blue dark:text-white">
              Super Admin Kirish
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
              Platforma egasi uchun xavfsizlik PIN kodini kiriting:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN kod (Standart: 7777)"
                className="w-full text-center text-lg font-black tracking-widest bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-blue dark:focus:border-amber-400"
              />

              {pinError && (
                <p className="text-xs font-bold text-red-500 animate-shake">
                  Noto'g'ri PIN kod! Qaytadan urinib ko'ring.
                </p>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-extrabold text-brand-blue dark:text-slate-950 bg-brand-orange dark:bg-amber-400 rounded-xl shadow-md cursor-pointer"
                >
                  Kirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { X, MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';
import { getTranslatedAddress } from '../data/serviceTranslations';
import { openExternalUrl } from '../utils/openExternalUrl';

export default function MapNavigationModal({
  isOpen = true,
  onClose,
  address,
  barberName,
  lat,
  lng,
  lang = 'uz',
  barber,
  mode = 'all' // 'all' | 'map' | 'taxi'
}) {
  const [activeTab, setActiveTab] = useState(mode === 'taxi' ? 'taxi' : 'map');

  if (isOpen === false) return null;

  const actualAddress = address || barber?.address || 'Toshkent shahri';
  const actualName = barberName || barber?.name || (lang === 'ru' ? 'Барбершоп' : lang === 'en' ? 'Barbershop' : 'Sartaroshxona');
  const pointLat = lat || barber?.lat || 41.311081;
  const pointLng = lng || barber?.lng || 69.240562;

  const translatedAddr = getTranslatedAddress(actualAddress, lang) || (lang === 'ru' ? 'г. Ташкент' : lang === 'en' ? 'Tashkent city' : 'Toshkent shahri');

  // Ilovalarni to'g'ridan-to'g'ri xavfsiz Telegram openLink va Universal Links orqali ochish
  // Hech qachon window.location.href yoki intent:// ishlatilmaydi (Chromium WebView net::ERR_UNKNOWN_URL_SCHEME xatosi chiqmasligi uchun)
  const openApp = (appType) => {
    let targetUrl = '';

    if (appType === 'yandex_taxi') {
      targetUrl = `https://taxi.yandex.uz/?point=${pointLat},${pointLng}`;
    } else if (appType === 'uklon') {
      targetUrl = `https://uklon.com.ua/`;
    } else if (appType === 'google_maps') {
      targetUrl = `https://www.google.com/maps/dir/?api=1&destination=${pointLat},${pointLng}`;
    } else if (appType === 'yandex_maps') {
      targetUrl = `https://yandex.uz/maps/?pt=${pointLng},${pointLat}&z=16&l=map`;
    } else {
      // Boshqa xarita yoki umumiy qidiruv fallback
      targetUrl = `https://www.google.com/maps/search/?api=1&query=${pointLat},${pointLng}`;
    }

    openExternalUrl(targetUrl);
  };

  const isMapOnly = mode === 'map';
  const isTaxiOnly = mode === 'taxi';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              {isTaxiOnly ? <span className="text-lg">🚕</span> : <Navigation className="w-5 h-5 text-brand-orange" />}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {isTaxiOnly
                  ? (lang === 'ru' ? 'Вызов такси' : lang === 'en' ? 'Order Taxi' : 'Taksi chaqirish')
                  : isMapOnly
                  ? (lang === 'ru' ? 'Открыть в картах' : lang === 'en' ? 'Open in Maps' : 'Xaritalarda ochish')
                  : (lang === 'ru' ? 'Маршрут и Такси' : lang === 'en' ? 'Maps & Taxi' : "Yo'nalish va Taksi")}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
                {actualName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Address Card */}
        <div className="my-3 p-3 bg-gray-50 dark:bg-slate-800/70 rounded-2xl border border-gray-100 dark:border-slate-700/60 flex items-start space-x-2.5">
          <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
          <span className="text-xs text-gray-700 dark:text-slate-200 font-semibold leading-relaxed">
            {translatedAddr}
          </span>
        </div>

        {/* Agar mode 'all' bo'lsa Tablar */}
        {!isMapOnly && !isTaxiOnly && (
          <div className="flex space-x-1.5 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-3">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
              }`}
            >
              <span>🗺️ {lang === 'ru' ? 'Карты' : lang === 'en' ? 'Maps' : 'Xaritalar'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('taxi')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'taxi'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
              }`}
            >
              <span>🚕 {lang === 'ru' ? 'Такси' : lang === 'en' ? 'Taxi' : 'Taksi'}</span>
            </button>
          </div>
        )}

        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400 block mb-2 px-1">
          {lang === 'ru' ? 'Выберите приложение:' : lang === 'en' ? 'Choose app:' : 'Telefoningizdagi ilovani tanlang:'}
        </span>

        {/* 1. XARITALAR BO'LIMI */}
        {(isMapOnly || (!isTaxiOnly && activeTab === 'map')) && (
          <div className="space-y-2 animate-in fade-in duration-150">
            {/* Google Maps Card */}
            <button
              onClick={() => openApp('google_maps')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center border border-slate-200/60 dark:border-slate-700 text-lg">
                  📍
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Google {lang === 'ru' ? 'Карты' : lang === 'en' ? 'Maps' : 'Xaritalar'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                    {lang === 'ru' ? 'Google Maps навигатор' : lang === 'en' ? 'Google Maps navigation' : 'Google Maps ilovasida ochish'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-800/40">
                {lang === 'ru' ? 'Открыть' : lang === 'en' ? 'Open' : 'Ochish'}
              </span>
            </button>

            {/* Yandex Maps Card */}
            <button
              onClick={() => openApp('yandex_maps')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center border border-slate-200/60 dark:border-slate-700 text-lg">
                  🗺️
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Yandex {lang === 'ru' ? 'Карты' : lang === 'en' ? 'Maps' : 'Xaritalar'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                    {lang === 'ru' ? 'Yandex Maps навигатор' : lang === 'en' ? 'Yandex Maps navigation' : 'Yandex Maps ilovasida ochish'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200/50 dark:border-red-800/40">
                {lang === 'ru' ? 'Открыть' : lang === 'en' ? 'Open' : 'Ochish'}
              </span>
            </button>

            {/* Android System Geo fallback */}
            <button
              onClick={() => openApp('system_geo')}
              className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center space-x-1.5 transition-colors border border-dashed border-slate-200 dark:border-slate-800 mt-1"
            >
              <Compass className="w-3.5 h-3.5 text-brand-orange" />
              <span>{lang === 'ru' ? 'Выбрать другое приложение (Android)' : lang === 'en' ? 'Open in other apps (Android)' : 'Boshqa xarita ilovasida ochish (Android)'}</span>
            </button>
          </div>
        )}

        {/* 2. TAKSI BO'LIMI */}
        {(isTaxiOnly || (!isMapOnly && activeTab === 'taxi')) && (
          <div className="space-y-2 animate-in fade-in duration-150">
            {/* Yandex Go Card */}
            <button
              onClick={() => openApp('yandex_taxi')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFCC00] text-black font-black text-sm flex items-center justify-center shadow-xs italic">
                  Go
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Yandex Go
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                    {lang === 'ru' ? 'Заказ такси Yandex Go' : lang === 'en' ? 'Order Yandex Go Taxi' : 'Yandex Go ilovasida ochish'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/50 dark:border-amber-800/40 shadow-xs">
                {lang === 'ru' ? 'Вызвать' : lang === 'en' ? 'Order' : 'Chaqirish'}
              </span>
            </button>

            {/* Uklon Card */}
            <button
              onClick={() => openApp('uklon')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-black text-[#FFDF00] flex items-center justify-center shadow-xs font-black text-xs">
                  ▲
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Uklon Taxi
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                    {lang === 'ru' ? 'Заказ такси Uklon' : lang === 'en' ? 'Order Uklon Taxi' : 'Uklon ilovasida ochish'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                {lang === 'ru' ? 'Вызвать' : lang === 'en' ? 'Order' : 'Chaqirish'}
              </span>
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {lang === 'ru' ? 'Закрыть' : lang === 'en' ? 'Close' : 'Yopish'}
        </button>
      </div>
    </div>
  );
}

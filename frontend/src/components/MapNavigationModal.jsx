import React from 'react';
import { X, MapPin, ExternalLink, Navigation } from 'lucide-react';

export default function MapNavigationModal({
  isOpen,
  onClose,
  address,
  barberName,
  lat,
  lng
}) {
  if (!isOpen) return null;

  const encodedAddr = encodeURIComponent(address || 'Toshkent');
  const latLngQuery = lat && lng ? `${lat},${lng}` : null;

  // Xarita va taksi havolalari
  const yandexGoUrl = `https://taxi.yandex.uz/`;
  const yandexMapsUrl = latLngQuery 
    ? `https://yandex.uz/maps/?pt=${lng},${lat}&z=16&l=map`
    : `https://yandex.uz/maps/?text=${encodedAddr}`;
  const googleMapsUrl = latLngQuery
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedAddr}`;
  const dgisUrl = `https://2gis.uz/search/${encodedAddr}`;

  const openLink = (url) => {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <Navigation className="w-4 h-4 text-brand-orange" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-brand-blue">
                Yo'nalish va Xaritalar
              </h3>
              <p className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                {barberName || "Sartaroshxona"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Address text */}
        <div className="my-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
          <span className="text-xs text-gray-700 font-semibold leading-relaxed">
            {address || "Toshkent shahri"}
          </span>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2 px-1">
          Ilovani tanlang:
        </span>

        {/* Navigation buttons */}
        <div className="space-y-2">
          {/* 1. Yandex Go */}
          <button
            onClick={() => openLink(yandexGoUrl)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs flex items-center justify-between transition-all shadow-xs active:scale-98"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-base">🚕</span>
              <span>Yandex Go (Taksi chaqirish)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* 2. Yandex Maps */}
          <button
            onClick={() => openLink(yandexMapsUrl)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-between transition-all border border-red-200/60 active:scale-98"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-base">🗺️</span>
              <span>Yandex Xaritalar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* 3. Google Maps */}
          <button
            onClick={() => openLink(googleMapsUrl)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-brand-blue font-bold text-xs flex items-center justify-between transition-all border border-blue-200/60 active:scale-98"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-base">📍</span>
              <span>Google Xaritalar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* 4. 2GIS */}
          <button
            onClick={() => openLink(dgisUrl)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-between transition-all border border-emerald-200/60 active:scale-98"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-base">🧭</span>
              <span>2GIS Xaritalar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}
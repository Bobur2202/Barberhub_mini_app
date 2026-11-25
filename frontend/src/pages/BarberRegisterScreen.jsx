import React, { useState } from 'react';
import {
  Scissors,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Store,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { UZBEKISTAN_REGIONS } from '../data/regionsData';
import { registerBarberBackend } from '../services/api';
import { openExternalUrl } from '../utils/openExternalUrl';

export default function BarberRegisterScreen({ onRegisterSuccess, onBack, t, lang = 'uz' }) {
  const [barberName, setBarberName] = useState('');
  const [shopName, setShopName] = useState('');
  
  // Viloyat va Tuman
  const [regionId, setRegionId] = useState('tashkent_city');
  const currentRegion = UZBEKISTAN_REGIONS.find(r => r.id === regionId) || UZBEKISTAN_REGIONS[0];
  const [districtId, setDistrictId] = useState(currentRegion.districts[0]?.id || '');
  
  // Aniq manzil va koordinatalar
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [isLocating, setIsLocating] = useState(false);
  
  // Aloqa
  const [phone, setPhone] = useState('+998 ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Viloyat o'zgarganda birinchi tumanni tanlash
  const handleRegionChange = (e) => {
    const newRegionId = e.target.value;
    setRegionId(newRegionId);
    const newReg = UZBEKISTAN_REGIONS.find(r => r.id === newRegionId);
    if (newReg && newReg.districts.length > 0) {
      setDistrictId(newReg.districts[0].id);
    }
  };

  // "Xaritadan tanlash" tugmasi bosilganda
  const handleOpenMap = () => {
    setIsLocating(true);

    const openMapUrl = (lat, lng) => {
      setCoords({ lat, lng });
      setIsLocating(false);
      // Agar manzil bo'sh bo'lsa, koordinatani avtomatik to'ldirish
      if (!address) {
        setAddress(`Geo: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
      // Telefonning Google / Yandex Maps xarita dasturini ochish
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      openExternalUrl(mapUrl);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          openMapUrl(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("GPS olinmadi, tuman markazi ochilmoqda:", err.message);
          const currentDistrict = currentRegion.districts.find(d => d.id === districtId);
          const lat = currentDistrict?.lat || currentRegion.center.lat;
          const lng = currentDistrict?.lng || currentRegion.center.lng;
          openMapUrl(lat, lng);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      const currentDistrict = currentRegion.districts.find(d => d.id === districtId);
      const lat = currentDistrict?.lat || currentRegion.center.lat;
      const lng = currentDistrict?.lng || currentRegion.center.lng;
      openMapUrl(lat, lng);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedDistrict = currentRegion.districts.find(d => d.id === districtId);
    const finalLat = coords?.lat || selectedDistrict?.lat || currentRegion.center.lat;
    const finalLng = coords?.lng || selectedDistrict?.lng || currentRegion.center.lng;

    // Yangi usta ob'ekti (soch kesish narxi maydoni olib tashlandi, standart 50000)
    const newBarber = {
      id: `barber-${Date.now()}`,
      name: barberName,
      role: shopName ? `${shopName} (Sartarosh)` : "Erkaklar sartaroshi",
      rating: 5.0,
      reviewsCount: 1,
      reviews_count: 1,
      startingPrice: 50000,
      starting_price: 50000,
      distance: "0.5 km",
      regionName: currentRegion.name,
      districtName: selectedDistrict?.name || '',
      address: address 
        ? `${currentRegion.name}, ${selectedDistrict?.name || ''}, ${address}` 
        : `${currentRegion.name}, ${selectedDistrict?.name || ''}`,
      districtId: districtId,
      lat: finalLat,
      lng: finalLng,
      phone: phone,
      telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Date.now(),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      bio: "Tajribali erkaklar sartaroshi. Zamonaviy soch turmaklari va soqol parvarishi.",
      workHours: { start: "09:00", end: "22:00" },
      work_hours: { start: "09:00", end: "22:00" },
      breakTime: { enabled: true, start: "13:00", end: "14:00" },
      break_time: { enabled: true, start: "13:00", end: "14:00" },
      isWorkingToday: true,
      is_working_today: true,
      daysOff: [],
      days_off: [],
      salonPhotos: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700"
      ],
      salon_photos: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700"
      ],
      services: [
        { id: `s-${Date.now()}-1`, name: "Klassik soch kesish", duration: "35 daq", price: 50000 },
        { id: `s-${Date.now()}-2`, name: "Soch va soqol kompleks", duration: "50 daq", price: 80000 },
        { id: `s-${Date.now()}-3`, name: "Talabalar uchun (Chegirma)", duration: "35 daq", price: 40000, oldPrice: 50000, isDiscount: true, note: "Talabalik guvohnomasi bilan" }
      ],
      reviews: [
        { id: `r-${Date.now()}`, author: "Yangi mijoz", rating: 5, date: "Hozirgina", comment: "A'lo darajada xizmat ko'rsatildi!" }
      ]
    };

    // Doimiy mahalliy xotiraga ham darhol yozib qo'yamiz (Katalog darhol ko'rishi uchun)
    try {
      const existing = JSON.parse(localStorage.getItem('barberhub_registered_barbers') || '[]');
      const updated = [newBarber, ...existing.filter(b => b.id !== newBarber.id)];
      localStorage.setItem('barberhub_registered_barbers', JSON.stringify(updated));
      localStorage.setItem('barberhub_barber_profile', JSON.stringify(newBarber));
    } catch (err) {
      console.warn("Lokal saqlashda xato:", err);
    }

    // Backendga doimiy saqlash
    await registerBarberBackend(newBarber);

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess(newBarber);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-12 max-w-md mx-auto text-slate-900 dark:text-white">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-brand-blue dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-brand-blue dark:text-white">
          Ustani ro'yxatdan o'tkazish
        </h1>
        <div className="w-9"></div>
      </div>

      <div className="px-4 mt-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-blue-50 dark:border-slate-800">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-brand-orange flex items-center justify-center mx-auto mb-2 border border-transparent dark:border-amber-500/30">
              <Scissors className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-brand-blue dark:text-white">
              Umumiy katalogga qo'shiling
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Ro'yxatdan o'tganingizdan so'ng barcha mijozlar sizni ko'radi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Usta Ismi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Ism va familiyangiz *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  placeholder="Masalan: Bobur Mirzayev"
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue dark:focus:border-amber-400"
                />
              </div>
            </div>

            {/* 2. Barbershop / Salon nomi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Salon yoki Barbershop nomi
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Masalan: Kings Barbershop (yoki yakka o'zingiz)"
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue dark:focus:border-amber-400"
                />
              </div>
            </div>

            {/* 3. Viloyat / Shahar tanlash */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Viloyat / Shahar *
              </label>
              <select
                value={regionId}
                onChange={handleRegionChange}
                className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue dark:focus:border-amber-400 font-semibold"
              >
                {UZBEKISTAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900 dark:text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Tuman / Shahar tanlash (Tanlangan viloyatga qarab chiqadi) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Tuman yoki Shahar *
              </label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue dark:focus:border-amber-400"
              >
                {currentRegion.districts.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-slate-900 dark:text-white">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Aniq manzil va "Xaritadan tanlash" tugmasi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Aniq mo'ljal / manzil *
                </label>
                {/* Xaritadan tanlash tugmasi */}
                <button
                  type="button"
                  onClick={handleOpenMap}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-brand-blue dark:text-slate-200 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-750 px-2 py-1 rounded-lg flex items-center space-x-1 transition-all border border-blue-200 dark:border-slate-700 cursor-pointer"
                >
                  {isLocating ? (
                    <Loader2 className="w-3 h-3 animate-spin text-brand-orange" />
                  ) : (
                    <Navigation className="w-3 h-3 text-brand-orange" />
                  )}
                  <span>{lang === 'ru' ? 'Открыть на карте' : lang === 'en' ? 'Open on map' : 'Xaritadan ochish'}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-gray-400 dark:text-slate-400" />
                </button>
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={lang === 'ru' ? 'Например: 14-й квартал, дом 23, 200м до метро' : lang === 'en' ? 'E.g. Block 14, Building 23, 200m to metro' : 'Masalan: 14-mavze, 23-uy, Metrogacha 200m'}
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue dark:focus:border-amber-400"
                />
              </div>

              {coords && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                  {lang === 'ru' ? '✓ GPS координаты определены по карте' : lang === 'en' ? '✓ GPS coordinates picked from map' : '✓ GPS koordinatalari xaritadan belgilandi'}
                </span>
              )}
            </div>

            {/* 6. Telefon raqam */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                {lang === 'ru' ? 'Ваш номер телефона *' : lang === 'en' ? 'Your phone number *' : 'Telefon raqamingiz *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue dark:focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            {/* Ro'yxatdan o'tish tugmasi */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 rounded-xl font-extrabold text-brand-blue dark:text-slate-950 bg-brand-orange hover:bg-brand-orange-hover dark:bg-amber-400 dark:hover:bg-amber-300 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all text-center text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{lang === 'ru' ? 'Добавление в каталог...' : lang === 'en' ? 'Adding to directory...' : "Katalogga qo'shilmoqda..."}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Зарегистрироваться и начать работу' : lang === 'en' ? 'Register and Start Working' : "Ro'yxatdan o'tish va Ishni boshlash"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  Search,
  Star,
  Loader2,
  Navigation,
  Crosshair,
  Check,
  Scissors,
  Calendar,
  Heart,
  Sparkles,
  ChevronRight as ChevronRightIcon,
  BellRing,
  Zap
} from 'lucide-react';
import { getBarbers } from '../services/api';
import { calculateDistanceKm, formatDistance } from '../data/mockBarbers';
import { UZBEKISTAN_REGIONS } from '../data/regionsData';
import { hapticFeedback } from '../utils/haptics';

export default function CatalogScreen({
  t,
  onSelectBarber,
  onGoToAppointments,
  activeAppointmentsCount = 0,
  onOpenAiAdvisor,
  upcomingTodayApt = null,
  lastAppointment = null,
  onQuickRebook
}) {
  const [selectedFilter, setSelectedFilter] = useState('nearest'); // 'nearest' | 'top_rated' | 'available_today' | 'favorites'
  const [searchQuery, setSearchQuery] = useState('');
  const [barbersList, setBarbersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('barberhub_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = (e, barberId) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(barberId)) {
      updated = favorites.filter(id => id !== barberId);
    } else {
      updated = [...favorites, barberId];
    }
    setFavorites(updated);
    localStorage.setItem('barberhub_favorites', JSON.stringify(updated));
  };

  // Geolokatsiya holatlari (Standart: Yunusobod markazi)
  const [userCoords, setUserCoords] = useState({ lat: 41.3644, lng: 69.2882 });
  const [locationName, setLocationName] = useState("Toshkent, Yunusobod");
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState('tashkent_city');
  const [selectedDistrictId, setSelectedDistrictId] = useState('yunusobod');

  const currentRegion = UZBEKISTAN_REGIONS.find(r => r.id === selectedRegionId) || UZBEKISTAN_REGIONS[0];

  // Ustalar ro'yxatini yuklash
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getBarbers(searchQuery).then((data) => {
      if (isMounted) {
        setBarbersList(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  // Haqiqiy GPS orqali lokatsiyani aniqlash funksiyasi
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Qurilmangizda geolokatsiya qo'llab-quvvatlanmaydi.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationName("📍 Sizning joylashuvingiz (GPS)");
        setSelectedDistrictId('gps');
        setIsLocating(false);
        setIsLocationModalOpen(false);
      },
      (error) => {
        console.warn("GPS ruxsat berilmadi yoki xato:", error.message);
        setIsLocating(false);
        alert(t.location_denied || "GPS ruxsat berilmadi, tumanni tanlang");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Tumanni qo'lda tanlash
  const handleSelectDistrict = (district) => {
    setSelectedDistrictId(district.id);
    setLocationName(`${currentRegion.name}, ${district.name}`);
    setUserCoords({ lat: district.lat, lng: district.lng });
    setIsLocationModalOpen(false);
  };

  // Har bir usta uchun masofani va piyoda vaqtni hisoblash
  const processedBarbers = barbersList.map((barber) => {
    let distanceKm = null;
    if (userCoords && barber.lat && barber.lng) {
      distanceKm = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        barber.lat,
        barber.lng
      );
    } else if (barber.distance) {
      const match = String(barber.distance).match(/([\d.]+)/);
      if (match) distanceKm = parseFloat(match[1]);
    }

    const distString = distanceKm !== null ? formatDistance(distanceKm) : (barber.distance || '1.2 km');
    const walkMins = distanceKm !== null ? Math.max(2, Math.round(distanceKm * 12.5)) : 10;
    const walkTimeText = walkMins < 60 ? `${walkMins} daq piyoda` : `${Math.round(walkMins / 60)} soat piyoda`;

    return {
      ...barber,
      calculatedDistance: distanceKm,
      displayDistance: distString,
      walkTimeText
    };
  });

  // Tezkor Filtrlar bo'yicha saralash va saralash
  const filteredBarbers = processedBarbers.filter((barber) => {
    if (selectedFilter === 'favorites') {
      return favorites.includes(barber.id);
    }
    if (selectedFilter === 'beard') {
      const srvNames = (barber.services || []).map(s => s.name.toLowerCase()).join(' ');
      const roleStr = (barber.role || '').toLowerCase();
      return srvNames.includes('soqol') || srvNames.includes('beard') || roleStr.includes('soqol');
    }
    if (selectedFilter === 'kids') {
      const srvNames = (barber.services || []).map(s => s.name.toLowerCase()).join(' ');
      const roleStr = (barber.role || '').toLowerCase();
      return srvNames.includes('bola') || srvNames.includes('yosh') || roleStr.includes('bola');
    }
    if (selectedFilter === 'available_today') {
      return barber.is_working_today !== false && barber.isWorkingToday !== false;
    }
    if (selectedFilter === 'top_rated') {
      return (barber.rating || 0) >= 4.8;
    }
    if (selectedFilter === 'budget') {
      const price = barber.starting_price || barber.startingPrice || 50000;
      return price <= 50000;
    }
    return true;
  });

  const displayedBarbers = [...filteredBarbers].sort((a, b) => {
    if (selectedFilter === 'nearest') {
      if (a.calculatedDistance === null) return 1;
      if (b.calculatedDistance === null) return -1;
      return a.calculatedDistance - b.calculatedDistance;
    }
    if (selectedFilter === 'top_rated') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (selectedFilter === 'budget') {
      return (a.startingPrice || 50000) - (b.startingPrice || 50000);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-24 max-w-md mx-auto">
      {/* Top Location Bar */}
      <div className="pt-4 px-4 pb-2">
        {/* Client Top Tab Navigation */}
        <div className="grid grid-cols-2 gap-2 bg-gray-200/60 p-1 rounded-2xl mb-3">
          <button
            className="py-2 rounded-xl text-xs font-bold bg-brand-blue text-white shadow-sm flex items-center justify-center space-x-1.5"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{t.catalog_tab || "Ustalar"}</span>
          </button>

          <button
            onClick={onGoToAppointments}
            className="py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 transition-all flex items-center justify-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.my_appointments_tab || "Navbatlarim"}</span>
            {activeAppointmentsCount > 0 && (
              <span className="text-[10px] bg-brand-orange text-brand-blue font-extrabold px-1.5 py-0.2 rounded-full">
                {activeAppointmentsCount}
              </span>
            )}
          </button>
        </div>

        {/* 🔔 BUGUNGI NAVBAT BILDIRISHNOMASI (Today's upcoming appointment pill) */}
        {upcomingTodayApt && (
          <div
            onClick={onGoToAppointments}
            className="mb-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-3 rounded-2xl shadow-md flex items-center justify-between cursor-pointer active:scale-98 transition-all border border-blue-400/30 animate-in fade-in"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-brand-orange animate-bounce" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-300">
                    Kutilayotgan navbat ({upcomingTodayApt.time_slot || upcomingTodayApt.time})
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 rounded-full ${
                    upcomingTodayApt.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-gray-900'
                  }`}>
                    {upcomingTodayApt.status === 'accepted' ? 'Qabul qilindi' : 'Kutilmoqda'}
                  </span>
                </div>
                <span className="text-xs font-black text-white block mt-0.5 truncate max-w-[220px]">
                  {upcomingTodayApt.barber_name || upcomingTodayApt.barberName} • {upcomingTodayApt.service_name || upcomingTodayApt.serviceName}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-extrabold text-amber-300 shrink-0">
              <span>Ko'rish</span>
              <span>&rarr;</span>
            </div>
          </div>
        )}

        <span className="text-[11px] text-gray-400 font-medium block">
          {t.location_label}
        </span>

        {/* Location selector toggle button */}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center space-x-1.5 group max-w-[240px] truncate"
          >
            <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0" />
            <span className="text-sm font-bold text-brand-blue truncate">
              {locationName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-brand-blue group-hover:translate-y-0.5 transition-transform flex-shrink-0" />
          </button>

          {/* Quick GPS button */}
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className={`flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border ${
              isLocating
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-white text-brand-blue border-blue-200 hover:bg-blue-50'
            }`}
            title={t.detect_my_location}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-orange" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-brand-orange" />
            )}
            <span>GPS</span>
          </button>
        </div>

        {/* 🤖 AI Sartarosh Maslahatchisi WOW Banner */}
        {onOpenAiAdvisor && (
          <div
            onClick={onOpenAiAdvisor}
            className="mt-3 bg-gradient-to-r from-[#003865] via-[#004B86] to-[#0A66C2] rounded-2xl p-3 text-white shadow-md relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all border border-blue-400/20"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-orange/25 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black tracking-tight text-white">
                      AI Sartarosh Maslahatchisi
                    </span>
                    <span className="text-[9px] bg-brand-orange text-brand-blue font-black px-1.5 py-0.5 rounded-full uppercase">
                      WOW AI
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium leading-tight mt-0.5">
                    Yuzingizga mos 3 xil zamonaviy turmakni AI orqali aniqlang
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:translate-x-0.5 transition-transform ml-2">
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ⚡ 1-BOSISHDA QAYTA YOZILISH (Quick Re-book) */}
        {lastAppointment && onQuickRebook && (
          <div className="mt-2.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 rounded-2xl p-2.5 border border-amber-300/70 shadow-2xs flex items-center justify-between transition-all">
            <div className="flex items-center space-x-2.5 truncate pr-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wide block">
                  1-Bosishda Qayta Yozilish ⚡
                </span>
                <span className="text-xs font-extrabold text-brand-blue block truncate">
                  {lastAppointment.barber_name} — {lastAppointment.service_name}
                </span>
              </div>
            </div>

            <button
              onClick={() => onQuickRebook(lastAppointment)}
              className="py-1.5 px-3 rounded-xl bg-brand-orange hover:bg-amber-400 active:scale-95 text-brand-blue font-extrabold text-xs shadow-xs transition-all shrink-0"
            >
              Yozilish
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm border border-blue-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* Quick Filter Chips (Tezkor Filtrlar) */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'nearest', label: '📍 Eng yaqin' },
            { id: 'beard', label: '✂️ Faqat soqol' },
            { id: 'kids', label: '👶 Bolalar ustasi' },
            { id: 'available_today', label: '⚡ Bugun ochiq' },
            { id: 'top_rated', label: '⭐ Top reyting (4.8+)' },
            { id: 'budget', label: '💰 Hamyonbop (<= 50K)' },
            { id: 'favorites', label: `❤️ Sevimlilar ${favorites.length ? `(${favorites.length})` : ''}` },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                hapticFeedback.selection();
                setSelectedFilter(chip.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedFilter === chip.id
                  ? 'bg-brand-blue text-white shadow-blue-900/20 scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-blue-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barbers Feed Header */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">
          {selectedFilter === 'favorites' ? (t.tab_favorites || "Sevimlilar") : t.nearby_barbers}
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {displayedBarbers.length} {t.barbers_count}
        </span>
      </div>

      {/* Barbers List */}
      <div className="px-4 mt-3 space-y-3.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-brand-blue space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            <span className="text-xs font-medium text-gray-500">Ustalar yuklanmoqda...</span>
          </div>
        ) : (
          displayedBarbers.map((barber) => (
            <div
              key={barber.id}
              onClick={() => {
                hapticFeedback.impact('light');
                onSelectBarber(barber);
              }}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-blue-50/60 active:scale-[0.99] relative"
            >
              {/* Top row: Avatar & Info */}
              <div className="flex items-start space-x-3">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-blue/10 shadow-inner flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-brand-blue text-base truncate">
                      {barber.name}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        hapticFeedback.impact('medium');
                        handleToggleFavorite(e, barber.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Sevimli usta"
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          favorites.includes(barber.id)
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-gray-300 hover:text-red-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5 mt-1 flex-wrap gap-y-1">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      <span>{barber.rating}</span>
                    </div>

                    {/* Dynamic GPS Distance & Walking Time Badge */}
                    <div className="flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      <span>{barber.displayDistance}</span>
                      <span className="text-emerald-600 font-medium ml-1">({barber.walkTimeText})</span>
                    </div>

                    {/* Working Status Badge */}
                    {barber.is_working_today === false || barber.isWorkingToday === false ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        🔴 {t.day_off_badge || "Dam olish"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        🟢 {t.open_status || "Ochiq"}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-1 truncate">
                    {barber.address || t.barber_role}
                  </span>
                </div>
              </div>

              {/* Direct Navigation Links (Yandex Go & Google Maps) & Pricing */}
              <div className="mt-2.5 pt-2 border-t border-gray-100/70 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${barber.lat || 41.311081},${barber.lng || 69.240562}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback.impact('light');
                    }}
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl transition-colors border border-blue-200/60"
                    title="Google Maps marshruti"
                  >
                    <Navigation className="w-3 h-3 text-brand-orange" />
                    <span>Xarita</span>
                  </a>

                  <a
                    href={`https://3.redirect.app.link/launch?end-lat=${barber.lat || 41.311081}&end-lon=${barber.lng || 69.240562}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback.impact('light');
                    }}
                    className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-colors border border-amber-300/70"
                    title="Yandex Go orqali taksi chaqirish"
                  >
                    <span>🚕 Yandex Go</span>
                  </a>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block leading-tight">
                    {t.from_price}:
                  </span>
                  <span className="font-black text-brand-blue text-xs">
                    {(barber.starting_price || barber.startingPrice || 50000).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              {/* Book button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  hapticFeedback.impact('medium');
                  onSelectBarber(barber);
                }}
                className="w-full mt-2.5 py-2 rounded-xl font-bold text-xs text-brand-blue bg-brand-orange hover:bg-brand-orange-hover shadow-xs transition-all active:scale-[0.98] flex items-center justify-center space-x-1"
              >
                <span>{t.book_now}</span>
                <span>&rarr;</span>
              </button>
            </div>
          ))
        )}

        {!isLoading && displayedBarbers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-blue-50 mt-4 p-5">
            {selectedFilter === 'favorites' ? (
              <>
                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                  {t.no_favorites || "Hozircha sevimli ustalar yo'q. Usta kartasidagi ❤️ tugmasini bosib saqlab qo'yishingiz mumkin."}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm font-medium">
                Hech qanday usta topilmadi.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Location Modal: Viloyat va Tuman tanlash */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-blue" />
                <h3 className="font-extrabold text-base text-brand-blue">
                  Hududni tanlang
                </h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* GPS Auto Detect Action Button */}
            <button
              onClick={handleDetectGPS}
              className="mt-3.5 p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between text-brand-blue hover:bg-blue-100 transition-all text-xs font-bold"
            >
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-brand-orange animate-spin-slow" />
                <span>{t.detect_my_location}</span>
              </div>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-brand-blue shadow-sm">
                Aniq
              </span>
            </button>

            {/* 1. Viloyat Tanlash */}
            <div className="mt-3">
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                Viloyat / Shahar:
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value);
                  const reg = UZBEKISTAN_REGIONS.find(r => r.id === e.target.value);
                  if (reg && reg.districts.length > 0) {
                    setSelectedDistrictId(reg.districts[0].id);
                  }
                }}
                className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-brand-blue border border-gray-200 focus:outline-none"
              >
                {UZBEKISTAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Tumanlar Ro'yxati */}
            <div className="mt-3 overflow-y-auto space-y-1.5 flex-1 pr-1 max-h-56">
              <span className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                {currentRegion.name} tumanlari:
              </span>
              {currentRegion.districts.map((district) => {
                const isSelected = selectedDistrictId === district.id;
                return (
                  <button
                    key={district.id}
                    onClick={() => handleSelectDistrict(district)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'bg-gray-50/70 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span>{district.name}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

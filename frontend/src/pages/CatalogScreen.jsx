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
import { getBarbers, getPlatformSettings } from '../services/api';
import { calculateDistanceKm, formatDistance } from '../data/mockBarbers';
import { UZBEKISTAN_REGIONS } from '../data/regionsData';
import { hapticFeedback } from '../utils/haptics';
import {
  getTranslatedServiceName,
  getTranslatedAddress,
  getTranslatedRole,
  formatWalkTime,
  getTranslatedDistrict
} from '../data/serviceTranslations';
import MapNavigationModal from '../components/MapNavigationModal';

export default function CatalogScreen({
  t,
  lang = 'uz',
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
  const [navModal, setNavModal] = useState({ isOpen: false, barber: null, mode: 'all' });

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
  const [platformSettings, setPlatformSettings] = useState(null);

  // Ustalar ro'yxatini va platforma sozlamalarini yuklash
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getBarbers(searchQuery).then((data) => {
      if (isMounted) {
        setBarbersList(data);
        setIsLoading(false);
      }
    });

    getPlatformSettings().then((settings) => {
      if (isMounted && settings) {
        setPlatformSettings(settings);
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
    const walkTimeText = formatWalkTime(walkMins, lang);

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
    // 🚀 VIP Boost olgan ustalar doimo eng birinchi (TOP-1) o'rinda chiqadi
    const aVip = a.is_vip ? 1 : 0;
    const bVip = b.is_vip ? 1 : 0;
    if (aVip !== bVip) {
      return bVip - aVip;
    }
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 max-w-md mx-auto text-slate-900 dark:text-white">
      {/* Top Location Bar */}
      <div className="pt-4 px-4 pb-2">
        {/* 📢 Super Admin Umumiy E'lon / Aksiya Banneri */}
        {platformSettings?.announcement_active && platformSettings?.announcement_text && (
          <div className={`mb-3 p-3 rounded-2xl shadow-xs border flex items-start space-x-2.5 transition-all ${
            platformSettings.announcement_type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
              : platformSettings.announcement_type === 'info'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-500/40 text-blue-950 dark:text-blue-200'
              : 'bg-gradient-to-r from-amber-400/20 via-orange-400/15 to-yellow-400/20 border-amber-300 dark:border-amber-500/30 text-gray-900 dark:text-amber-100'
          }`}>
            <span className="text-base flex-shrink-0 mt-0.5">
              {platformSettings.announcement_type === 'warning' ? '⚠️' : platformSettings.announcement_type === 'info' ? 'ℹ️' : '🎁'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">
                {platformSettings.announcement_text}
              </p>
            </div>
          </div>
        )}

        {/* Client Top Tab Navigation */}
        <div className="grid grid-cols-2 gap-2 bg-gray-200/60 dark:bg-slate-900 p-1 rounded-2xl mb-3 border border-transparent dark:border-slate-800">
          <button
            className="py-2 rounded-xl text-xs font-bold bg-brand-blue dark:bg-slate-800 text-white shadow-sm flex items-center justify-center space-x-1.5 border border-transparent dark:border-slate-700"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{t.catalog_tab || "Ustalar"}</span>
          </button>

          <button
            onClick={onGoToAppointments}
            className="py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center space-x-1.5"
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
            className="mb-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer active:scale-98 transition-all border border-slate-700/60 animate-in fade-in"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-brand-orange animate-bounce" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-300">
                    {t.upcoming_queue_title || "Kutilayotgan navbat"} ({upcomingTodayApt.time_slot || upcomingTodayApt.time})
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 rounded-full ${
                    upcomingTodayApt.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-gray-900'
                  }`}>
                    {upcomingTodayApt.status === 'accepted' ? (t.status_accepted || 'Qabul qilindi') : (t.status_pending || 'Kutilmoqda')}
                  </span>
                </div>
                <span className="text-xs font-black text-white block mt-0.5 truncate max-w-[220px]">
                  {upcomingTodayApt.barber_name || upcomingTodayApt.barberName} • {getTranslatedServiceName(upcomingTodayApt.service_name || upcomingTodayApt.serviceName, lang)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-extrabold text-amber-300 shrink-0">
              <span>{t.btn_view || "Ko'rish"}</span>
              <span>&rarr;</span>
            </div>
          </div>
        )}

        <span className="text-[11px] text-gray-400 dark:text-slate-400 font-medium block">
          {t.location_label}
        </span>

        {/* Location selector toggle button */}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center space-x-1.5 group max-w-[240px] truncate"
          >
            <MapPin className="w-4 h-4 text-brand-blue dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm font-bold text-brand-blue dark:text-white truncate">
              {getTranslatedDistrict(locationName, lang)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-brand-blue dark:text-slate-400 group-hover:translate-y-0.5 transition-transform flex-shrink-0" />
          </button>

          {/* Quick GPS button */}
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className={`flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border ${
              isLocating
                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                : 'bg-white dark:bg-slate-900 text-brand-blue dark:text-slate-200 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'
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

        {/* ⚡ 1-BOSISHDA QAYTA YOZILISH (Quick Re-book) */}
        {lastAppointment && onQuickRebook && (
          <div className="mt-2.5 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 dark:from-[#131D31] dark:via-[#18243E] dark:to-[#131D31] rounded-2xl p-3 border border-amber-300/80 dark:border-amber-500/40 shadow-sm dark:shadow-md dark:shadow-amber-500/5 flex items-center justify-between transition-all">
            <div className="flex items-center space-x-2.5 truncate pr-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider block">
                  {t.quick_rebook_title || "1-Bosishda Qayta Yozilish ⚡"}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {lastAppointment.barber_name} — {getTranslatedServiceName(lastAppointment.service_name || lastAppointment.serviceName, lang)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onQuickRebook(lastAppointment)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all shrink-0 cursor-pointer"
            >
              {t.quick_rebook_btn || "Yozilish"}
            </button>
          </div>
        )}

        {/* ✨ AI Turmak Story Highlight (Ixcham va zamonaviy qator) */}
        {onOpenAiAdvisor && (
          <div
            onClick={() => {
              hapticFeedback.impact('light');
              onOpenAiAdvisor();
            }}
            className="mt-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl px-3 py-2 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-sm border border-slate-700/60"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-sm shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-brand-orange animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-1.5 truncate">
                <span className="text-xs font-black tracking-tight text-white">
                  {lang === 'ru' ? 'AI Подбор прически' : lang === 'en' ? 'AI Hairstyle Match' : 'AI Turmak Tanlash'}
                </span>
                <span className="text-[9px] bg-brand-orange text-brand-blue font-black px-1.5 py-0.2 rounded-full uppercase shrink-0">
                  AI
                </span>
              </div>
            </div>
            <div className="text-[11px] font-bold text-amber-300 flex items-center space-x-1 shrink-0 ml-2">
              <span>{lang === 'ru' ? 'Тест' : lang === 'en' ? 'Try' : 'Sinash'}</span>
              <span>&rarr;</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full bg-white dark:bg-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 shadow-sm border border-blue-50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:ring-amber-400 transition-all"
          />
        </div>

        {/* Quick Filter Chips (Tezkor Filtrlar) */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: t.filter_all || 'Barchasi' },
            { id: 'nearest', label: t.filter_nearest_chip || '📍 Eng yaqin' },
            { id: 'beard', label: t.filter_beard_chip || '✂️ Faqat soqol' },
            { id: 'kids', label: t.filter_kids_chip || '👶 Bolalar ustasi' },
            { id: 'available_today', label: t.filter_today_chip || '⚡ Bugun ochiq' },
            { id: 'top_rated', label: t.filter_top_rated_chip || '⭐ Top reyting (4.8+)' },
            { id: 'budget', label: t.filter_budget_chip || '💰 Hamyonbop (<= 50K)' },
            { id: 'favorites', label: `${t.filter_favorites_chip || '❤️ Sevimlilar'} ${favorites.length ? `(${favorites.length})` : ''}` },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                hapticFeedback.selection();
                setSelectedFilter(chip.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedFilter === chip.id
                  ? 'bg-brand-blue dark:bg-amber-400 text-white dark:text-slate-950 shadow-blue-900/20 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 border border-blue-50 dark:border-slate-800'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barbers Feed Header */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800 dark:text-white">
          {selectedFilter === 'favorites' ? (t.tab_favorites || "Sevimlilar") : t.nearby_barbers}
        </h2>
        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
          {displayedBarbers.length} {t.barbers_count}
        </span>
      </div>

      {/* Barbers List */}
      <div className="px-4 mt-3 space-y-3.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-brand-blue space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            <span className="text-xs font-medium text-gray-500">{t.loading_barbers || "Ustalar yuklanmoqda..."}</span>
          </div>
        ) : (
          displayedBarbers.map((barber) => (
            <div
              key={barber.id}
              onClick={() => {
                hapticFeedback.impact('light');
                onSelectBarber(barber);
              }}
              className={`rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] relative ${
                barber.is_vip
                  ? 'bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-500/40 shadow-amber-100/50 dark:shadow-none'
                  : 'bg-white dark:bg-slate-900 border border-blue-50/60 dark:border-slate-800'
              }`}
            >
              {/* Top row: Avatar & Info */}
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className={`w-14 h-14 rounded-full object-cover shadow-inner ${
                      barber.is_vip
                        ? 'border-2 border-amber-400 ring-2 ring-amber-300 ring-offset-1'
                        : 'border-2 border-brand-blue/10 dark:border-slate-700'
                    }`}
                  />
                  {barber.is_vip && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[9px] font-black px-1 rounded-full shadow-xs border border-white">
                      👑
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <h3 className="font-bold text-brand-blue dark:text-white text-base truncate flex items-center space-x-1">
                        <span className="truncate">{barber.name}</span>
                        {barber.is_verified && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black shrink-0" title="Rasmiy tasdiqlangan usta">
                            ✓
                          </span>
                        )}
                      </h3>
                      {barber.is_vip && (
                        <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-400 px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                          ⭐ TOP VIP
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        hapticFeedback.impact('medium');
                        handleToggleFavorite(e, barber.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title={t.tab_favorites || "Sevimli usta"}
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
                    <div className="flex items-center text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      <span>{barber.displayDistance}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">({barber.walkTimeText})</span>
                    </div>

                    {/* Working Status Badge */}
                    {barber.is_working_today === false || barber.isWorkingToday === false ? (
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/40 border border-transparent dark:border-red-900/30 px-2 py-0.5 rounded-full">
                        🔴 {t.day_off_badge || "Dam olish"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 border border-transparent dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
                        🟢 {t.open_status || "Ochiq"}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-slate-400 block mt-1 truncate">
                    {getTranslatedAddress(barber.address, lang) || getTranslatedRole(barber.role, lang) || t.barber_role}
                  </span>
                </div>
              </div>

              {/* Direct Navigation Links (Xarita & Taxi) & Pricing */}
              <div className="mt-2.5 pt-2 border-t border-gray-100/70 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback.impact('light');
                      setNavModal({ isOpen: true, barber, mode: 'map' });
                    }}
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand-blue dark:text-slate-200 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-xl transition-colors border border-blue-200/60 dark:border-slate-700 active:scale-95"
                    title={lang === 'ru' ? 'Карта' : lang === 'en' ? 'Map' : 'Xarita'}
                  >
                    <Navigation className="w-3 h-3 text-brand-orange" />
                    <span>{t.map_btn || (lang === 'ru' ? 'Карта' : lang === 'en' ? 'Map' : 'Xarita')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback.impact('light');
                      setNavModal({ isOpen: true, barber, mode: 'taxi' });
                    }}
                    className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-amber-950 dark:text-amber-300 bg-amber-400/20 dark:bg-amber-500/20 hover:bg-amber-400/30 dark:hover:bg-amber-500/30 px-2.5 py-1 rounded-xl transition-colors border border-amber-300/70 dark:border-amber-500/30 active:scale-95"
                    title={t.taxi_btn || "Taxi"}
                  >
                    <span>🚕 {t.taxi_btn || "Taxi"}</span>
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 block leading-tight">
                    {t.from_price}:
                  </span>
                  <span className="font-black text-brand-blue dark:text-amber-400 text-xs">
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
                className="w-full mt-2.5 py-2 rounded-xl font-bold text-xs text-brand-blue dark:text-slate-950 bg-brand-orange hover:bg-brand-orange-hover dark:bg-amber-400 dark:hover:bg-amber-300 shadow-xs transition-all active:scale-[0.98] flex items-center justify-center space-x-1"
              >
                <span>{t.book_now}</span>
                <span>&rarr;</span>
              </button>
            </div>
          ))
        )}

        {!isLoading && displayedBarbers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-800 mt-4 p-5">
            {selectedFilter === 'favorites' ? (
              <>
                <Heart className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                  {t.no_favorites || "Hozircha sevimli ustalar yo'q. Usta kartasidagi ❤️ tugmasini bosib saqlab qo'yishingiz mumkin."}
                </p>
              </>
            ) : (
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                {t.no_barbers_found || "Hech qanday usta topilmadi."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Location Modal: Viloyat va Tuman tanlash */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] flex flex-col border border-transparent dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-blue dark:text-amber-400" />
                <h3 className="font-extrabold text-base text-brand-blue dark:text-white">
                  Hududni tanlang
                </h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* GPS Auto Detect Action Button */}
            <button
              onClick={handleDetectGPS}
              className="mt-3.5 p-3 bg-blue-50 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 flex items-center justify-between text-brand-blue dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-750 transition-all text-xs font-bold cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-brand-orange animate-spin-slow" />
                <span>{t.detect_my_location}</span>
              </div>
              <span className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full text-brand-blue dark:text-amber-400 shadow-sm border border-transparent dark:border-slate-700">
                Aniq
              </span>
            </button>

            {/* 1. Viloyat Tanlash */}
            <div className="mt-3">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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
                className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-brand-blue dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none"
              >
                {UZBEKISTAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900 dark:text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Tumanlar Ro'yxati */}
            <div className="mt-3 overflow-y-auto space-y-1.5 flex-1 pr-1 max-h-56">
              <span className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                {currentRegion.name} tumanlari:
              </span>
              {currentRegion.districts.map((district) => {
                const isSelected = selectedDistrictId === district.id;
                return (
                  <button
                    key={district.id}
                    onClick={() => handleSelectDistrict(district)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-brand-blue dark:bg-amber-400 text-white dark:text-slate-950 shadow-sm'
                        : 'bg-gray-50/70 dark:bg-slate-800/60 text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
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

      {/* 🗺️ / 🚕 Map & Taxi Navigation Sheet */}
      {navModal.isOpen && (
        <MapNavigationModal
          isOpen={navModal.isOpen}
          onClose={() => setNavModal({ isOpen: false, barber: null, mode: 'all' })}
          barber={navModal.barber}
          address={navModal.barber?.address}
          barberName={navModal.barber?.name}
          lat={navModal.barber?.lat}
          lng={navModal.barber?.lng}
          mode={navModal.mode}
          lang={lang}
        />
      )}
    </div>
  );
}

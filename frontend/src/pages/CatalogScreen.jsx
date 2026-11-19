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
  Heart
} from 'lucide-react';
import { getBarbers } from '../services/api';
import { calculateDistanceKm, formatDistance } from '../data/mockBarbers';
import { UZBEKISTAN_REGIONS } from '../data/regionsData';

export default function CatalogScreen({
  t,
  onSelectBarber,
  onGoToAppointments,
  activeAppointmentsCount = 0
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

  // Har bir usta uchun masofani hisoblash va filtrlash
  const processedBarbers = barbersList.map((barber) => {
    let distanceKm = null;
    if (userCoords && barber.lat && barber.lng) {
      distanceKm = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        barber.lat,
        barber.lng
      );
    }
    return {
      ...barber,
      calculatedDistance: distanceKm,
      displayDistance: distanceKm !== null ? formatDistance(distanceKm) : (barber.distance || '1.2 km')
    };
  });

  // Saralash (Eng yaqin, Top reyting, Bugun bo'sh)
  const sortedBarbers = [...processedBarbers].sort((a, b) => {
    if (selectedFilter === 'nearest') {
      if (a.calculatedDistance === null) return 1;
      if (b.calculatedDistance === null) return -1;
      return a.calculatedDistance - b.calculatedDistance;
    }
    if (selectedFilter === 'top_rated') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (selectedFilter === 'available_today') {
      return (a.startingPrice || 50000) - (b.startingPrice || 50000);
    }
    return 0;
  });

  // Sevimlilar yoki barcha ustalarni filtrlash
  const displayedBarbers = sortedBarbers.filter(barber => {
    if (selectedFilter === 'favorites') {
      return favorites.includes(barber.id);
    }
    return true;
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

        {/* Filter Chips */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedFilter('nearest')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center space-x-1 ${
              selectedFilter === 'nearest'
                ? 'bg-brand-blue text-white shadow-blue-900/20'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>{t.filter_nearest}</span>
          </button>
          <button
            onClick={() => setSelectedFilter('top_rated')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedFilter === 'top_rated'
                ? 'bg-brand-blue text-white shadow-blue-900/20'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.filter_top_rated}
          </button>
          <button
            onClick={() => setSelectedFilter('available_today')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedFilter === 'available_today'
                ? 'bg-brand-blue text-white shadow-blue-900/20'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.filter_available_today}
          </button>
          <button
            onClick={() => setSelectedFilter('favorites')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center space-x-1 ${
              selectedFilter === 'favorites'
                ? 'bg-red-500 text-white shadow-red-900/20'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>❤️</span>
            <span>{t.tab_favorites || "Sevimlilar"}</span>
            {favorites.length > 0 && (
              <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                selectedFilter === 'favorites' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
              }`}>
                {favorites.length}
              </span>
            )}
          </button>
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
              onClick={() => onSelectBarber(barber)}
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
                      onClick={(e) => handleToggleFavorite(e, barber.id)}
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

                  <div className="flex items-center space-x-2 mt-0.5">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      <span>{barber.rating}</span>
                    </div>

                    {/* Dynamic GPS Distance Badge */}
                    <div className="flex items-center text-xs font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                      <Navigation className="w-2.5 h-2.5 mr-1 text-brand-orange" />
                      <span>{barber.displayDistance}</span>
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
                  <span className="text-[11px] text-gray-400 block mt-0.5 truncate">
                    {barber.address || t.barber_role}
                  </span>
                </div>
              </div>

              {/* Bottom row: Pricing & Book button */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 block">
                    {t.from_price}:
                  </span>
                  <span className="font-bold text-brand-blue text-sm">
                    {(barber.starting_price || barber.startingPrice || 50000).toLocaleString()} UZS
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBarber(barber);
                  }}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  {t.book_now}
                </button>
              </div>
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

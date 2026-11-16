import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  Search,
  Star,
  Loader2,
  Navigation,
  Crosshair,
  Check
} from 'lucide-react';
import { getBarbers } from '../services/api';
import {
  TASHKENT_DISTRICTS,
  calculateDistanceKm,
  formatDistance
} from '../data/mockBarbers';

export default function CatalogScreen({ t, onSelectBarber }) {
  const [selectedFilter, setSelectedFilter] = useState('nearest'); // 'nearest' | 'top_rated' | 'available_today'
  const [searchQuery, setSearchQuery] = useState('');
  const [barbersList, setBarbersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Geolokatsiya holatlari
  // Boshlang'ich Toshkent markazi (Yunusobod hududi atrofida)
  const [userCoords, setUserCoords] = useState({ lat: 41.3400, lng: 69.2800 });
  const [locationName, setLocationName] = useState(t.default_location);
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('yunusobod');

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
        setSelectedDistrict('gps');
        setIsLocating(false);
        setIsLocationModalOpen(false);
      },
      (error) => {
        console.warn("GPS ruxsat berilmadi yoki xato:", error.message);
        setIsLocating(false);
        alert(t.location_denied);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Tumanni qo'lda tanlash
  const handleSelectDistrict = (district) => {
    if (district.id === 'all') {
      setSelectedDistrict('all');
      setLocationName("Toshkent shahri");
      setUserCoords(null);
    } else {
      setSelectedDistrict(district.id);
      setLocationName(district.name);
      setUserCoords(district.center);
    }
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

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-24 max-w-md mx-auto">
      {/* Top Location Bar */}
      <div className="pt-4 px-4 pb-2">
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
        </div>
      </div>

      {/* Barbers Feed Header */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">
          {t.nearby_barbers}
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {sortedBarbers.length} {t.barbers_count}
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
          sortedBarbers.map((barber) => (
            <div
              key={barber.id}
              onClick={() => onSelectBarber(barber)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-blue-50/60 active:scale-[0.99]"
            >
              {/* Top row: Avatar & Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-blue/10 shadow-inner"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-brand-blue text-base truncate">
                    {barber.name}
                  </h3>
                  <div className="flex items-center space-x-3 mt-0.5">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      <span>{barber.rating}</span>
                    </div>

                    {/* Dynamic GPS Distance Badge */}
                    <div className="flex items-center text-xs font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                      <Navigation className="w-2.5 h-2.5 mr-1 text-brand-orange" />
                      <span>{barber.displayDistance}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {t.barber_role}
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

        {!isLoading && sortedBarbers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-blue-50 mt-4">
            <p className="text-gray-500 text-sm font-medium">
              Hech qanday usta topilmadi.
            </p>
          </div>
        )}
      </div>

      {/* Location / District Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-blue" />
                <h3 className="font-extrabold text-base text-brand-blue">
                  {t.select_district}
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
              className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between text-brand-blue hover:bg-blue-100 transition-all text-xs font-bold"
            >
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-brand-orange animate-spin-slow" />
                <span>{t.detect_my_location}</span>
              </div>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-brand-blue shadow-sm">
                Aniq
              </span>
            </button>

            {/* Districts List */}
            <div className="mt-3 overflow-y-auto space-y-1.5 flex-1 pr-1">
              {TASHKENT_DISTRICTS.map((district) => {
                const isSelected = selectedDistrict === district.id;
                return (
                  <button
                    key={district.id}
                    onClick={() => handleSelectDistrict(district)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
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

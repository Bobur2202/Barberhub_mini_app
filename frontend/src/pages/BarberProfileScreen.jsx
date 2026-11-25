import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Check,
  MessageSquare,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Sparkles,
  Heart,
  Share2,
  Gift,
  Scissors,
  Award,
  Navigation
} from 'lucide-react';
import { 
  getTranslatedServiceName, 
  formatServiceDuration, 
  getTranslatedAddress, 
  getTranslatedRole, 
  getTranslatedBio,
  getTranslatedPromoBadge,
  formatAppointmentDate
} from '../data/serviceTranslations';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import MapNavigationModal from '../components/MapNavigationModal';

export default function BarberProfileScreen({ barber, t, lang = 'uz', onBack, onContinue }) {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'before_after' | 'gallery' | 'reviews'
  const [selectedService, setSelectedService] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalMode, setMapModalMode] = useState('all');

  // Sadoqat shtamplari (Loyalty Stamps) hisobi
  const clientCompletedVisits = useMemo(() => {
    try {
      const apts = JSON.parse(localStorage.getItem('barberhub_client_appointments') || '[]');
      const count = apts.filter((a) => (a.barber_id === barber.id || a.barberId === barber.id) && a.status === 'completed').length;
      return count > 0 ? count : 2; // mijoz darhol ko'rishi uchun 2 ta to'ldirilgan shtamp
    } catch {
      return 2;
    }
  }, [barber.id]);

  const currentStamps = clientCompletedVisits % 5;
  const isRewardUnlocked = currentStamps === 0 && clientCompletedVisits > 0;

  const beforeAfterList = (barber.beforeAfterGallery && barber.beforeAfterGallery.length > 0)
    ? barber.beforeAfterGallery
    : (barber.before_after_gallery && barber.before_after_gallery.length > 0)
    ? barber.before_after_gallery
    : [
        {
          id: 'ba-sample-1',
          title: "Klassikdan Textured Crop Fade ga o'tish",
          styleName: "Textured Crop Fade",
          beforeImg: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
          afterImg: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600",
          desc: "O'sib ketgan sochlarni tozalab, yuzga yosh va o'tkir qirrali yangi zamonaviy uslub berildi."
        },
        {
          id: 'ba-sample-2',
          title: "Soqol va High Fade Pompadour",
          styleName: "High Fade & Beard",
          beforeImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
          afterImg: "https://images.unsplash.com/photo-1520338661084-680395057c93?auto=format&fit=crop&q=80&w=600",
          desc: "Soqol chiziqlari aniq qirralanib, tepa sochiga baland hajm berildi."
        }
      ];

  // Favorites state
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('barberhub_favorites') || '[]');
      return favs.includes(barber.id);
    } catch {
      return false;
    }
  });

  const handleToggleFavorite = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('barberhub_favorites') || '[]');
      let updated;
      if (favs.includes(barber.id)) {
        updated = favs.filter(id => id !== barber.id);
        setIsFavorite(false);
      } else {
        updated = [...favs, barber.id];
        setIsFavorite(true);
      }
      localStorage.setItem('barberhub_favorites', JSON.stringify(updated));
    } catch (e) {
      console.warn('Favorite xatosi:', e);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText = `${t.share_text || "Ushbu mohir sartaroshni tavsiya qilaman!"}\n💈 ${barber.name}\n📍 ${barber.address || "Toshkent"}\n⭐ Reyting: ${barber.rating}/5`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      window.Telegram.WebApp.openTelegramLink(tgUrl);
    } else if (navigator.share) {
      navigator.share({
        title: barber.name,
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const salonPhotos = barber.salonPhotos || [];

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      setLightboxIndex(salonPhotos.length - 1);
    }
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (lightboxIndex < salonPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      setLightboxIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32 max-w-md mx-auto text-slate-900 dark:text-white">
      {/* Toast */}
      {showShareToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white py-2 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in border border-white/20">
          <span>📋</span>
          <span>{t.share_copied_toast || "Havola nusxalandi!"}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-brand-blue dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-brand-blue dark:text-white">
          {t.barber_profile}
        </h1>
        <div className="flex items-center space-x-1.5">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-brand-blue dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800 cursor-pointer"
            title={t.btn_share_profile || "Ulashish"}
          >
            <Share2 className="w-4 h-4 text-brand-blue dark:text-slate-200" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`w-9 h-9 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center transition-colors border border-transparent dark:border-slate-800 cursor-pointer ${
              isFavorite ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
            title="Sevimli usta sifatida saqlash"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barber Hero Card */}
      <div className="px-4 pt-2 text-center flex flex-col items-center">
        <div className="relative">
          <img
            src={barber.avatar}
            alt={barber.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg mx-auto"
          />
        </div>

        <h2 className="text-xl font-extrabold text-brand-blue dark:text-white mt-3">
          {barber.name}
        </h2>

        {/* Rating & Address */}
        <div className="flex items-center justify-center space-x-1.5 mt-1 text-amber-500 font-bold text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{barber.rating}/5</span>
          <span className="text-gray-400 dark:text-slate-400 text-xs font-normal">
            ({barber.reviewsCount || barber.reviews?.length || 100}+)
          </span>
        </div>

        {/* Working Hours & Status Badge */}
        <div className="mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 bg-white/90 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-2xs text-xs">
          <Clock className="w-3.5 h-3.5 text-brand-blue dark:text-amber-400" />
          <span className="text-gray-600 dark:text-slate-300 font-medium">
            {t.work_hours_badge || "Ish vaqti"}: <strong className="text-brand-blue dark:text-amber-400">{barber.workHours?.start || "09:00"} — {barber.workHours?.end || "22:00"}</strong>
          </span>
          {barber.is_working_today === false || barber.isWorkingToday === false ? (
            <span className="text-red-700 dark:text-red-300 font-bold text-[10px] bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-transparent dark:border-red-900/30">
              <span>🔴</span>
              <span>{t.day_off_badge || "Bugun dam olish"}</span>
            </span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-transparent dark:border-emerald-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.open_status || "Ochiq"}</span>
            </span>
          )}
        </div>

        {/* Weekly days off notice if configured */}
        {(barber.days_off?.length > 0 || barber.daysOff?.length > 0) && (
          <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400 flex items-center justify-center space-x-1">
            <span className="text-gray-400 dark:text-slate-500">{t.days_off_title || "Dam olish kunlari"}:</span>
            <span className="font-bold text-red-500">{(barber.days_off || barber.daysOff).join(', ')}</span>
          </div>
        )}

        {/* Break Time Badge if configured */}
        {(barber.breakTime?.enabled !== false && barber.break_time?.enabled !== false) && (barber.breakTime?.start || barber.break_time?.start) && (
          <div className="mt-1.5 inline-flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 px-3 py-0.5 rounded-full text-[11px] text-amber-800 dark:text-amber-300 font-bold">
            <span>☕</span>
            <span>{t.break_time_title || "Tushlik"}: {barber.breakTime?.start || barber.break_time?.start} — {barber.breakTime?.end || barber.break_time?.end}</span>
          </div>
        )}

        {/* Address & Navigation Link */}
        {barber.address && (
          <div className="mt-2.5 flex items-center justify-center space-x-2 flex-wrap gap-y-1.5">
            <button
              type="button"
              onClick={() => { setMapModalMode('map'); setShowMapModal(true); }}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50/80 hover:bg-blue-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-blue-200/70 dark:border-slate-700 text-brand-blue dark:text-slate-200 cursor-pointer transition-all active:scale-95 shadow-2xs text-[11px] font-bold"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
              <span className="truncate max-w-[170px]">{getTranslatedAddress(barber.address, lang)}</span>
              <span className="text-brand-orange text-[10px] font-black underline">
                {t.map_btn || "Xarita"} &rarr;
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setMapModalMode('taxi'); setShowMapModal(true); }}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-300/70 dark:border-amber-500/40 text-amber-950 dark:text-amber-300 font-extrabold text-[11px] transition-all active:scale-95 shadow-2xs"
            >
              <span>🚕 {t.taxi_btn || "Taxi"}</span>
            </button>
          </div>
        )}

        {/* Short Bio */}
        <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 max-w-xs leading-relaxed">
          {getTranslatedBio(barber.bio, lang)}
        </p>

        {/* Mini Salon Photos Teaser (if photos exist) */}
        {salonPhotos.length > 0 && activeTab !== 'gallery' && (
          <div
            onClick={() => setActiveTab('gallery')}
            className="w-full mt-3 bg-white/70 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl p-2.5 border border-blue-100/70 dark:border-slate-800 shadow-2xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2 overflow-hidden">
                {salonPhotos.slice(0, 3).map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt="Salon"
                    className="inline-block h-8 w-8 rounded-lg object-cover ring-2 ring-white dark:ring-slate-700 shadow-2xs"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200 group-hover:text-brand-blue dark:group-hover:text-amber-400 transition-colors">
                {t.tabs_salon_photos || "Sartaroshxona rasmlari"} ({salonPhotos.length})
              </span>
            </div>
            <span className="text-[11px] font-bold text-brand-orange group-hover:underline">
              {t.view_all || "Ko'rish"} &rarr;
            </span>
          </div>
        )}

        {/* 🏷️ VIRTUAL SADOQAT KARTASI (Digital Loyalty Stamp Card) */}
        <div className="w-full mt-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-3.5 text-white shadow-sm border border-slate-700/60 relative overflow-hidden text-left">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-brand-orange/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Award className="w-4 h-4 text-brand-orange animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight text-white flex items-center space-x-1">
                  <span>{t.loyalty_card_title || "Virtual Sadoqat Kartasi"}</span>
                  <span className="text-[9px] bg-brand-orange text-brand-blue font-black px-1.5 rounded-full">VIP</span>
                </h4>
                <p className="text-[10px] text-blue-100 font-medium">
                  {t.loyalty_card_reward || "Har 5-tashrifingizda 50% chegirma yoki bepul soqol!"}
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-300 bg-white/10 px-2 py-0.5 rounded-full">
              {currentStamps} / 5
            </span>
          </div>

          {/* 5 Digital Stamps Row */}
          <div className="grid grid-cols-5 gap-2 mt-3 relative z-10">
            {[1, 2, 3, 4, 5].map((slotNum) => {
              const isFilled = slotNum <= currentStamps;
              const isGiftSlot = slotNum === 5;

              return (
                <div
                  key={slotNum}
                  className={`py-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isFilled
                      ? 'bg-amber-400/90 text-brand-blue shadow-sm font-black ring-1 ring-white/40'
                      : isGiftSlot
                      ? 'bg-white/15 border border-dashed border-amber-300/60 text-amber-300'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {isFilled ? (
                    <Scissors className="w-4 h-4 text-brand-blue" />
                  ) : isGiftSlot ? (
                    <Gift className="w-4 h-4 animate-bounce text-amber-300" />
                  ) : (
                    <span className="text-[11px] font-bold">○</span>
                  )}
                  <span className="text-[9px] font-bold mt-0.5">
                    {isGiftSlot ? '50%' : `#${slotNum}`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-[10px] text-blue-100 text-center font-medium">
            {isRewardUnlocked
              ? (t.loyalty_reward_unlocked || "🎉 Tabriklaymiz! Sizda 50% chegirma vaucheri faol!")
              : (t.loyalty_reward_progress || "Yana {count} ta tashrifdan so'ng 50% chegirma sovg'a olinadi!").replace('{count}', 5 - currentStamps)}
          </div>
        </div>

        {/* 4 Tabs: Xizmatlar / Oldin & Keyin / Salon / Izohlar */}
        <div className="w-full grid grid-cols-4 gap-1 bg-gray-200/60 dark:bg-slate-900 p-1 rounded-2xl mt-4 border border-transparent dark:border-slate-800">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
              activeTab === 'services'
                ? 'bg-brand-blue dark:bg-slate-800 text-white shadow-sm border border-transparent dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.tabs_services}
          </button>
          <button
            onClick={() => setActiveTab('before_after')}
            className={`py-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center space-x-0.5 cursor-pointer ${
              activeTab === 'before_after'
                ? 'bg-brand-blue dark:bg-slate-800 text-white shadow-sm border border-transparent dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{t.tab_before_after || "Oldin/Keyin"}</span>
            <span className="text-[9px] bg-brand-orange text-brand-blue font-black px-1 rounded-full">✂️</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-brand-blue dark:bg-slate-800 text-white shadow-sm border border-transparent dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{t.tabs_salon_photos || "Salon"}</span>
            {salonPhotos.length > 0 && (
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                activeTab === 'gallery' ? 'bg-brand-orange text-brand-blue' : 'bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
              }`}>
                {salonPhotos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-brand-blue dark:bg-slate-800 text-white shadow-sm border border-transparent dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.tabs_reviews}
          </button>
        </div>
      </div>

      {/* Tab 1: Services */}
      {activeTab === 'services' && (
        <div className="px-4 mt-4 space-y-3">
          {barber.services.map((service) => {
            const isSelected = selectedService?.id === service.id;

            return (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`rounded-2xl p-4 transition-all cursor-pointer border relative ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-brand-orange dark:border-amber-400 ring-2 ring-brand-orange/30 dark:ring-amber-400/30 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-blue-50/70 dark:border-slate-800 shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {getTranslatedServiceName(service.name, lang)}
                    </h4>
                    <span className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 block">
                      {formatServiceDuration(service.duration, lang)}
                    </span>

                    {/* Discount or badge */}
                    {service.isDiscount && (
                      <span className="inline-block mt-2 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                        {getTranslatedPromoBadge(service.note, lang) || t.student_discount_badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {service.oldPrice && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 line-through block">
                        {service.oldPrice.toLocaleString()} UZS
                      </span>
                    )}
                    <span
                      className={`text-sm font-extrabold ${
                        service.isDiscount
                          ? 'text-brand-orange dark:text-amber-400'
                          : 'text-brand-blue dark:text-amber-400'
                      }`}
                    >
                      {service.price.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                {/* Selected check icon */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-orange dark:bg-amber-400 text-brand-blue dark:text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Oldin & Keyin Transformatsiya Sliders */}
      {activeTab === 'before_after' && (
        <div className="px-4 mt-4 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
            <span>{lang === 'ru' ? 'Результаты клиентов мастера' : lang === 'en' ? 'Real client transformation results' : "Ustaning real mijozlari natijalari"}</span>
            <span className="text-[10px] text-brand-orange bg-amber-50 px-2 py-0.5 rounded-full font-bold">
              {lang === 'ru' ? 'Интерактивный слайдер' : lang === 'en' ? 'Interactive slider' : "Interaktiv slayd"}
            </span>
          </div>

          {beforeAfterList.map((item) => (
            <BeforeAfterSlider
              key={item.id}
              beforeImage={item.beforeImg || item.before_img}
              afterImage={item.afterImg || item.after_img}
              title={item.title}
              styleName={item.styleName || item.style_name}
              description={item.desc}
              t={t}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Tab 3: Salon Photos (Barbershop Gallery) */}
      {activeTab === 'gallery' && (
        <div className="px-4 mt-4">
          {salonPhotos.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-gray-600 dark:text-slate-300 font-medium">
                <span>{salonPhotos.length} {t.photos_count || (lang === 'ru' ? 'фото' : lang === 'en' ? 'photos' : 'ta rasm')}</span>
                <span className="text-[11px] text-gray-400 dark:text-slate-500">
                  {lang === 'ru' ? 'Нажмите на фото для увеличения' : lang === 'en' ? 'Tap photo to enlarge' : 'Rasmni bosib kattalashtiring'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {salonPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-900 shadow-sm border border-blue-50 dark:border-slate-800 cursor-pointer group hover:shadow-md transition-all"
                  >
                    <img
                      src={photo}
                      alt={`Barbershop photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-blue-50 dark:border-slate-800">
              <ImageIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-slate-200">
                {t.no_salon_photos_yet || "Rasmlar hali yuklanmagan"}
              </h4>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Usta yaqin kunlarda sartaroshxona va o'z ishlarining rasmlarini joylaydi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="px-4 mt-4 space-y-3">
          {barber.reviews && barber.reviews.length > 0 ? (
            barber.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-sm border border-blue-50 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800 dark:text-white">
                    {review.author}
                  </span>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                    <span>{review.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {review.comment}
                </p>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 block mt-2">
                  {formatAppointmentDate(review.date, lang)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800">
              <MessageSquare className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {lang === 'ru' ? 'Отзывов пока нет' : lang === 'en' ? 'No reviews yet' : 'Izohlar hali mavjud emas'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-between p-4 backdrop-blur-md"
        >
          {/* Top Bar */}
          <div className="w-full max-w-md flex items-center justify-between text-white pt-2">
            <span className="text-xs font-bold text-gray-300">
              {lightboxIndex + 1} / {salonPhotos.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image & Navigation */}
          <div className="relative w-full max-w-md my-auto flex items-center justify-center">
            <img
              src={salonPhotos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-h-[70vh] w-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {salonPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Caption */}
          <div className="w-full max-w-md text-center pb-4">
            <p className="text-xs text-gray-300 font-medium">
              {barber.name} — {t.salon_photos_title || "Sartaroshxona rasmlari"}
            </p>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 p-4 shadow-lg z-40">
        <button
          disabled={!selectedService}
          onClick={() => onContinue(selectedService)}
          className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all cursor-pointer ${
            selectedService
              ? 'bg-brand-orange hover:bg-brand-orange-hover dark:bg-amber-400 dark:hover:bg-amber-300 text-brand-blue dark:text-slate-950 shadow-md shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-amber-200/60 dark:bg-slate-800 text-amber-800/40 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {t.continue_btn}
        </button>
        {!selectedService && (
          <p className="text-center text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">
            {t.select_service_hint}
          </p>
        )}
      </div>

      {/* Map & Taxi Navigation Modal */}
      <MapNavigationModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        address={barber.address}
        barberName={barber.name}
        lat={barber.lat}
        lng={barber.lng}
        lang={lang}
        mode={mapModalMode}
      />
    </div>
  );
}

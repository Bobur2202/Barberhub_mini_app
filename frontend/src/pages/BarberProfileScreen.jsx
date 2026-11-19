import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { getTranslatedServiceName, formatServiceDuration } from '../data/serviceTranslations';

export default function BarberProfileScreen({ barber, t, lang = 'uz', onBack, onContinue }) {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'gallery' | 'reviews'
  const [selectedService, setSelectedService] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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
    <div className="min-h-screen bg-[#E6EDF9] pb-32 max-w-md mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#E6EDF9]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-blue hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-brand-blue">
          {t.barber_profile}
        </h1>
        <div className="w-9"></div> {/* Balancer */}
      </div>

      {/* Barber Hero Card */}
      <div className="px-4 pt-2 text-center flex flex-col items-center">
        <div className="relative">
          <img
            src={barber.avatar}
            alt={barber.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
          />
        </div>

        <h2 className="text-xl font-extrabold text-brand-blue mt-3">
          {barber.name}
        </h2>

        {/* Rating & Address */}
        <div className="flex items-center justify-center space-x-1.5 mt-1 text-amber-500 font-bold text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{barber.rating}/5</span>
          <span className="text-gray-400 text-xs font-normal">
            ({barber.reviewsCount || barber.reviews?.length || 100}+)
          </span>
        </div>

        {/* Working Hours & Status Badge */}
        <div className="mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 bg-white/90 border border-blue-100 px-3 py-1.5 rounded-full shadow-2xs text-xs">
          <Clock className="w-3.5 h-3.5 text-brand-blue" />
          <span className="text-gray-600 font-medium">
            {t.work_hours_badge || "Ish vaqti"}: <strong className="text-brand-blue">{barber.workHours?.start || "09:00"} — {barber.workHours?.end || "22:00"}</strong>
          </span>
          {barber.is_working_today === false || barber.isWorkingToday === false ? (
            <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <span>🔴</span>
              <span>{t.day_off_badge || "Bugun dam olish"}</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.open_status || "Ochiq"}</span>
            </span>
          )}
        </div>

        {/* Weekly days off notice if configured */}
        {(barber.days_off?.length > 0 || barber.daysOff?.length > 0) && (
          <div className="mt-1 text-[11px] text-gray-500 flex items-center justify-center space-x-1">
            <span className="text-gray-400">{t.days_off_title || "Dam olish kunlari"}:</span>
            <span className="font-bold text-red-500">{(barber.days_off || barber.daysOff).join(', ')}</span>
          </div>
        )}

        {/* Address */}
        {barber.address && (
          <p className="text-[11px] text-gray-500 mt-2 flex items-center justify-center space-x-1 max-w-xs">
            <MapPin className="w-3 h-3 text-brand-orange flex-shrink-0" />
            <span className="truncate">{barber.address}</span>
          </p>
        )}

        {/* Short Bio */}
        <p className="text-xs text-gray-600 mt-2 max-w-xs leading-relaxed">
          {barber.bio}
        </p>

        {/* Mini Salon Photos Teaser (if photos exist) */}
        {salonPhotos.length > 0 && activeTab !== 'gallery' && (
          <div
            onClick={() => setActiveTab('gallery')}
            className="w-full mt-3 bg-white/70 hover:bg-white rounded-2xl p-2.5 border border-blue-100/70 shadow-2xs flex items-center justify-between cursor-pointer transition-all group"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2 overflow-hidden">
                {salonPhotos.slice(0, 3).map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt="Salon"
                    className="inline-block h-8 w-8 rounded-lg object-cover ring-2 ring-white shadow-2xs"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-brand-blue transition-colors">
                {t.tabs_salon_photos || "Sartaroshxona rasmlari"} ({salonPhotos.length})
              </span>
            </div>
            <span className="text-[11px] font-bold text-brand-orange group-hover:underline">
              {t.view_all || "Ko'rish"} &rarr;
            </span>
          </div>
        )}

        {/* 3 Tabs: Xizmatlar / Salon rasmlari / Izohlar */}
        <div className="w-full grid grid-cols-3 bg-gray-200/60 p-1 rounded-2xl mt-4">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tabs_services}
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'gallery'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{t.tabs_salon_photos || "Salon"}</span>
            {salonPhotos.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'gallery' ? 'bg-brand-orange text-brand-blue' : 'bg-gray-300 text-gray-700'
              }`}>
                {salonPhotos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
                    ? 'bg-white border-brand-orange ring-2 ring-brand-orange/30 shadow-md'
                    : 'bg-white border-blue-50/70 shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {getTranslatedServiceName(service.name, lang)}
                    </h4>
                    <span className="text-xs text-gray-400 mt-0.5 block">
                      {formatServiceDuration(service.duration, lang)}
                    </span>

                    {/* Discount or badge */}
                    {service.isDiscount && (
                      <span className="inline-block mt-2 text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                        {service.note || t.student_discount_badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {service.oldPrice && (
                      <span className="text-xs text-gray-400 line-through block">
                        {service.oldPrice.toLocaleString()} UZS
                      </span>
                    )}
                    <span
                      className={`text-sm font-extrabold ${
                        service.isDiscount
                          ? 'text-brand-orange'
                          : 'text-brand-blue'
                      }`}
                    >
                      {service.price.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                {/* Selected check icon */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-orange text-brand-blue flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Salon Photos (Barbershop Gallery) */}
      {activeTab === 'gallery' && (
        <div className="px-4 mt-4">
          {salonPhotos.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-gray-600 font-medium">
                <span>{salonPhotos.length} {t.photos_count || "ta rasm"}</span>
                <span className="text-[11px] text-gray-400">Rasmni bosib kattalashtiring</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {salonPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-blue-50 cursor-pointer group hover:shadow-md transition-all"
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
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-blue-50">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-700">
                {t.no_salon_photos_yet || "Rasmlar hali yuklanmagan"}
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
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
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800">
                    {review.author}
                  </span>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                    <span>{review.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  {review.comment}
                </p>
                <span className="text-[10px] text-gray-400 block mt-2">
                  {review.date}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Izohlar hali mavjud emas</p>
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
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
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
                  className="absolute left-2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md"
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
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-blue-100 p-4 shadow-lg z-40">
        <button
          disabled={!selectedService}
          onClick={() => onContinue(selectedService)}
          className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all ${
            selectedService
              ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-amber-200/60 text-amber-800/40 cursor-not-allowed'
          }`}
        >
          {t.continue_btn}
        </button>
        {!selectedService && (
          <p className="text-center text-[11px] text-gray-400 mt-1.5">
            {t.select_service_hint}
          </p>
        )}
      </div>
    </div>
  );
}

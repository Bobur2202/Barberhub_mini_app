import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, Check, MessageSquare } from 'lucide-react';

export default function BarberProfileScreen({ barber, t, onBack, onContinue }) {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'reviews'
  const [selectedService, setSelectedService] = useState(null);

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

        {/* Rating */}
        <div className="flex items-center justify-center space-x-1 mt-1 text-amber-500 font-bold text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{barber.rating}/5</span>
          <span className="text-gray-400 text-xs font-normal">
            ({barber.reviewsCount || 100}+)
          </span>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
          {barber.bio}
        </p>

        {/* Tabs: Xizmatlar / Izohlar */}
        <div className="w-full grid grid-cols-2 bg-gray-200/60 p-1 rounded-xl mt-5">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tabs_services}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tabs_reviews}
          </button>
        </div>
      </div>

      {/* Tab Content: Services */}
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
                      {service.name}
                    </h4>
                    <span className="text-xs text-gray-400 mt-0.5 block">
                      {service.duration}
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

      {/* Tab Content: Reviews */}
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

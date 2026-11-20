import React, { useState } from 'react';
import { ArrowLeft, User, Phone, CheckCircle, BellRing, Send, Loader2 } from 'lucide-react';
import { createAppointment } from '../services/api';
import { getTranslatedServiceName } from '../data/serviceTranslations';

export default function ConfirmScreen({
  barber,
  service,
  dateTime,
  t,
  lang = 'uz',
  onBack,
  onBookingSuccess,
}) {
  const [clientName, setClientName] = useState(() => {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Sardorbek';
  });
  const [phoneNumber, setPhoneNumber] = useState('+998 90 123 45 67');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  const isMulti = !!dateTime.isMultiPerson;
  const totalPrice = dateTime.totalPrice || (service.price + (dateTime.secondPrice || 0));

  const handleBooking = async () => {
    setIsSubmitting(true);

    const payload = {
      barber_id: barber.id,
      barber_name: barber.name,
      barber_avatar: barber.avatar,
      barber_phone: barber.phone || "+998 90 123 45 67",
      service_id: service.id,
      service_name: service.name,
      price: totalPrice,
      client_name: clientName,
      client_phone: phoneNumber,
      client_telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null,
      date_str: `${dateTime.day.dayName} ${dateTime.day.dateNum}-Noyabr`,
      time_slot: dateTime.time,
      is_multi_person: isMulti,
      multi_person_details: isMulti ? {
        companion_type: dateTime.companionType,
        companion_title: dateTime.companionTitle,
        companion_service: dateTime.companionService,
        second_slot: dateTime.secondSlot,
        second_price: dateTime.secondPrice
      } : null,
      queue_status: 'waiting'
    };

    try {
      const result = await createAppointment(payload);
      setConfirmedData(result || payload);
    } catch (err) {
      console.error('Booking xatosi:', err);
      setConfirmedData(payload);
    } finally {
      setIsSubmitting(false);
      setShowSuccessModal(true);
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
        <h1 className="text-base font-bold text-brand-blue">
          {t.confirmation_title}
        </h1>
        <div className="w-9"></div>
      </div>

      <div className="px-4 mt-2 space-y-4">
        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">
            {t.summary_card}
          </h3>

          <div className="space-y-3 divide-y divide-gray-100 text-sm">
            <div className="flex justify-between items-center pt-2 first:pt-0">
              <span className="text-gray-500 text-xs">{t.service_label}:</span>
              <span className="font-bold text-gray-800 text-right">
                {getTranslatedServiceName(service.name, lang)}
              </span>
            </div>

            {/* If Multi-person, show 2nd person row */}
            {isMulti && (
              <div className="flex justify-between items-center pt-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-xs font-black text-brand-blue block">
                    👨‍👦 2-Mijoz: {dateTime.companionTitle}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    {dateTime.companionService} ({dateTime.secondSlot})
                  </span>
                </div>
                <span className="font-extrabold text-xs text-brand-blue">
                  {dateTime.secondPrice?.toLocaleString()} UZS
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500 text-xs">{t.barber_label}:</span>
              <span className="font-bold text-brand-blue text-right">{barber.name}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500 text-xs">{t.datetime_label}:</span>
              <span className="font-bold text-gray-800 text-right">
                {dateTime.day.full}, {dateTime.time} {isMulti ? `va ${dateTime.secondSlot}` : ''}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-700 font-bold text-sm">
                {isMulti ? "Jami (2 kishi uchun):" : t.total_label}:
              </span>
              <span className="text-lg font-black text-brand-blue">
                {totalPrice.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Mijoz ma'lumotlari
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t.your_name}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t.your_name_placeholder}
                className="w-full bg-gray-50/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t.phone_label}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phone_placeholder}
                className="w-full bg-gray-50/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 border-2 border-brand-blue/70 focus:outline-none focus:border-brand-blue focus:bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Telegram Notice Banner */}
        <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start space-x-3">
          <div className="p-2 bg-brand-blue text-white rounded-xl">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="flex-1 text-[11px] text-gray-600 leading-relaxed">
            <span className="font-bold text-brand-blue block text-xs">
              Telegram tezkor xabarnoma (FastAPI API)
            </span>
            Siz band qilgan zahotingiz ma'lumotlar serverga tushadi va ustaning Telegramiga tasdiqlash xabari boradi.
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-blue-100 p-4 shadow-lg z-40">
        <button
          disabled={isSubmitting || !clientName || !phoneNumber}
          onClick={handleBooking}
          className="w-full py-4 rounded-xl font-extrabold text-brand-blue bg-brand-orange hover:bg-brand-orange-hover shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all text-center text-sm flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
              <span>Serverga yuborilmoqda...</span>
            </span>
          ) : (
            <>
              <span>{t.confirm_booking_btn}</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="text-lg font-extrabold text-gray-900">
              {t.booking_success_title}
            </h3>

            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {t.booking_success_desc}
            </p>

            {/* Simulated Telegram Message Preview */}
            <div className="mt-4 p-3.5 bg-gray-50 rounded-2xl text-left border border-gray-200 text-xs">
              <div className="flex items-center space-x-1.5 text-brand-blue font-bold mb-1">
                <BellRing className="w-3.5 h-3.5 text-brand-orange" />
                <span>Backend orqali ustaga ketgan bildirishnoma:</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                👤 <b>{clientName}</b> ({phoneNumber})<br />
                ✂️ {service.name}<br />
                📅 {dateTime.day.dayName} {dateTime.day.dateNum}-Noyabr, {dateTime.time}<br />
                💰 {service.price.toLocaleString()} UZS
              </p>
              <div className="flex space-x-2 mt-2 pt-2 border-t border-gray-200">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                  ✅ Qabul qilish
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                  ❌ Bekor qilish
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-5">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBookingSuccess(confirmedData || payload, 'appointments');
                }}
                className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>📋 {t.my_appointments_tab || "Navbatlarimni ko'rish"}</span>
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBookingSuccess(confirmedData || payload, 'catalog');
                }}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
              >
                {t.back_to_catalog}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

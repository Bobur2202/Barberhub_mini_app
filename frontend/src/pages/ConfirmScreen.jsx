import React, { useState } from 'react';
import { ArrowLeft, User, Phone, CheckCircle, BellRing, Send, Loader2, Calendar, AlertCircle, Check } from 'lucide-react';
import { createAppointment } from '../services/api';
import { getTranslatedServiceName } from '../data/serviceTranslations';
import { hapticFeedback } from '../utils/haptics';

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
    const tgFirst = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
    const tgLast = window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name;
    const tgFull = [tgFirst, tgLast].filter(Boolean).join(' ');
    if (tgFull) return tgFull;
    return localStorage.getItem('barberhub_client_name') || '';
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem('barberhub_client_phone') || '+998 ';
  });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  // Telefon raqamni O'zbekiston formati bo'yicha avtomatik formatlash: +998 90 123 45 67
  const handlePhoneChange = (e) => {
    setPhoneTouched(true);
    let val = e.target.value;
    
    // Bo'shatish yoki boshlang'ich prefix
    if (!val || val.trim() === '+' || val.trim() === '+9' || val.trim() === '+99') {
      setPhoneNumber('+998 ');
      return;
    }
    
    // Faqat raqamlarni ajratish
    let digits = val.replace(/\D/g, '');
    
    // Agar to'g'ridan-to'g'ri operator kodi bilan yozilsa (masalan 90...)
    if (!digits.startsWith('998')) {
      digits = '998' + digits;
    }
    
    // Maksimal 12 ta raqam
    digits = digits.slice(0, 12);
    
    // Chiroyli probellar bilan formatlash
    let formatted = '+998';
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 5);
    }
    if (digits.length > 5) {
      formatted += ' ' + digits.slice(5, 8);
    }
    if (digits.length > 8) {
      formatted += ' ' + digits.slice(8, 10);
    }
    if (digits.length > 10) {
      formatted += ' ' + digits.slice(10, 12);
    }
    setPhoneNumber(formatted);
  };

  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const isPhoneValid = digitsOnly.length === 12 && digitsOnly.startsWith('998');
  const isNameValid = clientName.trim().length >= 2;
  const canSubmit = isPhoneValid && isNameValid && !isSubmitting;

  const isMulti = !!dateTime.isMultiPerson;
  const totalPrice = dateTime.totalPrice || (service.price + (dateTime.secondPrice || 0));

  const handleBooking = async () => {
    if (!canSubmit) {
      setPhoneTouched(true);
      setNameTouched(true);
      return;
    }

    setIsSubmitting(true);

    // Telefon va ismni keyingi safar qayta yozmaslik uchun saqlab qo'yamiz
    try {
      localStorage.setItem('barberhub_client_phone', phoneNumber);
      localStorage.setItem('barberhub_client_name', clientName);
    } catch (e) {}

    const payload = {
      barber_id: barber.id,
      barber_name: barber.name,
      barber_avatar: barber.avatar,
      barber_phone: barber.phone || "+998 90 123 45 67",
      service_id: service.id,
      service_name: service.name,
      price: totalPrice,
      client_name: clientName.trim(),
      client_phone: phoneNumber,
      client_telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null,
      date_str: dateTime.day?.full || `${dateTime.day?.dateNum}-Noyabr`,
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
      hapticFeedback.notification('success');
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] pb-32 max-w-md mx-auto text-slate-900 dark:text-white">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#F8FAFC]/95 dark:bg-[#0B1120]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-brand-blue dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-brand-blue dark:text-white">
          {t.confirmation_title}
        </h1>
        <div className="w-9"></div>
      </div>

      <div className="px-4 mt-2 space-y-4">
        {/* Booking Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-blue-50 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-3.5">
            {t.summary_card}
          </h3>

          <div className="space-y-3 divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            <div className="flex justify-between items-center pt-2 first:pt-0">
              <span className="text-gray-500 dark:text-slate-400 text-xs">{t.service_label}:</span>
              <span className="font-bold text-gray-800 dark:text-slate-100 text-right">
                {getTranslatedServiceName(service.name, lang)}
              </span>
            </div>

            {/* If Multi-person, show 2nd person row */}
            {isMulti && (
              <div className="flex justify-between items-center pt-2 bg-blue-50/60 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div>
                  <span className="text-xs font-black text-brand-blue dark:text-amber-400 block">
                    {t.second_client_label || "👨‍👦 2-Mijoz:"} {dateTime.companionTitle}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 block">
                    {getTranslatedServiceName(dateTime.companionService, lang)} ({dateTime.secondSlot})
                  </span>
                </div>
                <span className="font-extrabold text-xs text-brand-blue dark:text-white">
                  {dateTime.secondPrice?.toLocaleString()} UZS
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500 dark:text-slate-400 text-xs">{t.barber_label}:</span>
              <span className="font-bold text-brand-blue dark:text-amber-400 text-right">{barber.name}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500 dark:text-slate-400 text-xs">{t.datetime_label}:</span>
              <span className="font-bold text-gray-800 dark:text-slate-100 text-right">
                {dateTime.day.full}, {dateTime.time} {isMulti ? `${lang === 'ru' ? 'и' : lang === 'en' ? 'and' : 'va'} ${dateTime.secondSlot}` : ''}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-700 dark:text-slate-300 font-bold text-sm">
                {isMulti ? (t.total_multi_label || "Jami (2 kishi uchun):") : t.total_label}:
              </span>
              <span className="text-lg font-black text-brand-blue dark:text-amber-400">
                {totalPrice.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-blue-50 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
              {t.client_details_title || "Mijoz ma'lumotlari"}
            </h3>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
              {t.required_fields_badge || "Majburiy maydonlar *"}
            </span>
          </div>

          {/* Ism kiritish */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t.your_name} <span className="text-red-500">*</span></span>
              {nameTouched && !isNameValid && (
                <span className="text-[10px] text-red-500 font-bold">{t.name_required_error || "Ismni kiriting"}</span>
              )}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientName}
                onFocus={() => setNameTouched(true)}
                onChange={(e) => {
                  setNameTouched(true);
                  setClientName(e.target.value);
                }}
                placeholder={t.your_name_placeholder || "Ismingizni kiriting"}
                className={`w-full bg-gray-50/50 dark:bg-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 dark:text-white border transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 ${
                  nameTouched && !isNameValid
                    ? 'border-red-400 bg-red-50/30'
                    : isNameValid
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-gray-200 dark:border-slate-700 focus:border-brand-blue dark:focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Telefon raqam kiritish */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t.phone_label} <span className="text-red-500">*</span></span>
              {isPhoneValid ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                  <Check className="w-3 h-3 inline" />
                  <span>{lang === 'ru' ? 'Номер корректен' : lang === 'en' ? 'Valid number' : "To'g'ri raqam"}</span>
                </span>
              ) : phoneTouched ? (
                <span className="text-[10px] text-red-500 font-bold">
                  {lang === 'ru' ? 'Введите все 9 цифр' : lang === 'en' ? 'Please enter all 9 digits' : "9 ta raqam to'liq kiritilishi kerak"}
                </span>
              ) : null}
            </label>
            <div className="relative">
              <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isPhoneValid ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400'
              }`} />
              <input
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onFocus={() => setPhoneTouched(true)}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                maxLength={17}
                className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm font-semibold tracking-wide transition-all focus:outline-none ${
                  phoneTouched && !isPhoneValid
                    ? 'border-2 border-red-400 bg-red-50/30 text-gray-900 dark:text-white focus:border-red-500'
                    : isPhoneValid
                    ? 'border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 text-gray-900 dark:text-white'
                    : 'border-2 border-brand-blue/50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 text-gray-800 dark:text-white focus:border-brand-blue dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800'
                }`}
              />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1.5 leading-tight">
              {isPhoneValid ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {lang === 'ru' ? 'Мастер сможет связаться по этому номеру.' : lang === 'en' ? 'The barber can reach you on this number.' : "Usta ushbu raqamga bog'lanishi mumkin."}
                </span>
              ) : (
                <span>
                  {lang === 'ru' ? (
                    <>Пример: <b>+998 90 123 45 67</b> (Код оператора и 7 цифр)</>
                  ) : lang === 'en' ? (
                    <>Example: <b>+998 90 123 45 67</b> (Operator code and 7 digits)</>
                  ) : (
                    <>Namuna: <b>+998 90 123 45 67</b> (Operator kodi va 7 ta raqam)</>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Telegram Notice Banner */}
        <div className="p-3.5 bg-blue-50/80 dark:bg-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700 flex items-start space-x-3">
          <div className="p-2 bg-brand-blue dark:bg-slate-700 text-white dark:text-amber-400 rounded-xl">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="flex-1 text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-brand-blue dark:text-white block text-xs">
              Telegram tezkor xabarnoma (FastAPI API)
            </span>
            Siz band qilgan zahotingiz ma'lumotlar serverga tushadi va ustaning Telegramiga tasdiqlash xabari boradi.
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 p-4 shadow-lg z-40">
        {!canSubmit && (
          <div className="mb-2 text-center text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {!isNameValid
                ? "Davom etish uchun ismingizni kiriting"
                : !isPhoneValid
                ? "Telefon raqamingizni to'liq kiriting (+998 XX XXX XX XX)"
                : ""}
            </span>
          </div>
        )}

        <button
          disabled={!canSubmit}
          onClick={handleBooking}
          className={`w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
            canSubmit
              ? 'text-brand-blue bg-brand-orange hover:bg-brand-orange-hover shadow-lg shadow-amber-500/25 active:scale-[0.98] cursor-pointer'
              : 'text-gray-400 dark:text-slate-600 bg-gray-200 dark:bg-slate-800 cursor-not-allowed opacity-80'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
              <span>{lang === 'ru' ? 'Отправка на сервер...' : lang === 'en' ? 'Submitting to server...' : 'Serverga yuborilmoqda...'}</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              {t.booking_success_title}
            </h3>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t.booking_success_desc}
            </p>

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
                className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs transition-all"
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

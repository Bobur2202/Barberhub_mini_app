import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  AlertCircle,
  Scissors,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Users,
  Navigation,
  Gift,
  Award,
  Radio,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { getTranslatedServiceName, formatAppointmentDate } from '../data/serviceTranslations';
import { downloadIcsFile } from '../utils/calendarHelper';
import { submitBarberReview, cancelClientAppointment, rescheduleAppointment } from '../services/api';
import { mockBarbers } from '../data/mockBarbers';
import MapNavigationModal from '../components/MapNavigationModal';

export default function ClientAppointmentsScreen({
  appointments = [],
  t,
  lang = 'uz',
  onBackToCatalog,
  onUpdateAppointments,
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [selectedAptForMap, setSelectedAptForMap] = useState(null);

  // Review Modal State
  const [selectedAptForReview, setSelectedAptForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('Mijoz');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(null);

  // Reschedule Modal State
  const [selectedAptForReschedule, setSelectedAptForReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('Ertaga');
  const [rescheduleTime, setRescheduleTime] = useState('15:30');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleToast, setRescheduleToast] = useState('');

  const handleOpenRescheduleModal = (apt) => {
    setSelectedAptForReschedule(apt);
    setRescheduleDate(apt.date_str || apt.date || 'Ertaga');
    setRescheduleTime(apt.time_slot || apt.time || '15:30');
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAptForReschedule || !rescheduleTime) return;
    setIsSubmittingReschedule(true);
    try {
      await rescheduleAppointment(selectedAptForReschedule.id, {
        date_str: rescheduleDate,
        time_slot: rescheduleTime
      });

      const updated = appointments.map(a =>
        a.id === selectedAptForReschedule.id
          ? { ...a, date_str: rescheduleDate, date: rescheduleDate, time_slot: rescheduleTime, time: rescheduleTime }
          : a
      );
      if (onUpdateAppointments) onUpdateAppointments(updated);
      setSelectedAptForReschedule(null);
      setRescheduleToast(t.reschedule_success_toast || "Navbat muvaffaqiyatli ko'chirildi! 🔄");
      setTimeout(() => setRescheduleToast(''), 4000);
    } catch (err) {
      console.warn("Reschedule xatosi:", err);
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Filter active and history appointments
  const activeAppointments = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'accepted'
  );
  const historyAppointments = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  // Navbatni bekor qilish
  const handleCancelAppointment = async (aptId) => {
    if (window.confirm(t.confirm_cancel_booking || "Rostdan ham ushbu navbatni bekor qilmoqchimisiz?")) {
      await cancelClientAppointment(aptId);
      const updated = appointments.map((a) =>
        a.id === aptId ? { ...a, status: 'cancelled' } : a
      );
      if (onUpdateAppointments) onUpdateAppointments(updated);
    }
  };

  // Izoh va Baho qoldirish modalini ochish
  const handleOpenReviewModal = (apt) => {
    setSelectedAptForReview(apt);
    setReviewRating(5);
    setReviewComment('');
    setReviewAuthor(apt.client_name || apt.clientName || 'Mijoz');
  };

  // Izohni yuborish va usta reytingini yangilash
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedAptForReview) return;

    setIsSubmittingReview(true);

    const barberId = selectedAptForReview.barber_id || selectedAptForReview.barberId;
    const appointmentId = selectedAptForReview.id;

    // 1. Backendga yuborish
    const res = await submitBarberReview({
      barberId: barberId,
      author: reviewAuthor || 'Mijoz',
      rating: reviewRating,
      comment: reviewComment || "Xizmat a'lo darajada!",
      appointmentId: appointmentId,
    });

    // 2. Lokal mockBarbers ro'yxatida ustaning reytingi va izohlarini yangilash
    const targetBarber = mockBarbers.find(b => b.id === barberId);
    if (targetBarber) {
      if (!targetBarber.reviews) targetBarber.reviews = [];
      const newRev = {
        id: `rev-${Date.now()}`,
        author: reviewAuthor || 'Mijoz',
        rating: reviewRating,
        date: 'Bugun',
        comment: reviewComment || "Xizmat a'lo darajada!"
      };
      targetBarber.reviews.unshift(newRev);

      // Reytingni qayta hisoblash
      const validRatings = targetBarber.reviews.map(r => r.rating).filter(r => r > 0);
      if (validRatings.length > 0) {
        targetBarber.rating = Number((validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1));
      }
      targetBarber.reviewsCount = targetBarber.reviews.length;
    }

    // 3. Ushbu navbatni "izoh qoldirilgan" deb belgilash
    const updatedAppointments = appointments.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          reviewed: true,
          client_rating: reviewRating,
          client_comment: reviewComment,
        };
      }
      return a;
    });

    if (onUpdateAppointments) onUpdateAppointments(updatedAppointments);

    setIsSubmittingReview(false);
    setSelectedAptForReview(null);
    setReviewSuccessMessage(t.review_success_toast || "Rahmat! Izohingiz qo'shildi va ustaning reytingi oshdi! ⭐");

    setTimeout(() => {
      setReviewSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto">
      {/* Reschedule Toast */}
      {rescheduleToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white py-2.5 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in max-w-xs text-center border border-white/20">
          <span>🔄</span>
          <span>{rescheduleToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onBackToCatalog && (
              <button
                onClick={onBackToCatalog}
                className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-blue hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-black text-brand-blue">
              {t.my_appointments_tab || "Mening navbatlarim"}
            </h1>
          </div>
          <span className="text-xs font-bold bg-white text-brand-blue px-3 py-1 rounded-full shadow-2xs border border-blue-50">
            {appointments.length} ta navbat
          </span>
        </div>

        {/* Tab switchers: Faol vs Tarix */}
        <div className="grid grid-cols-2 gap-2 bg-gray-200/60 dark:bg-slate-800/80 p-1 rounded-2xl mt-3 border border-transparent dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'active'
                ? 'bg-brand-blue dark:bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{t.active_appointments || "Faol navbatlar"}</span>
            {activeAppointments.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'active' ? 'bg-brand-orange text-brand-blue' : 'bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
              }`}>
                {activeAppointments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-brand-blue dark:bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{t.history_appointments || "Navbatlar tarixi"}</span>
            {historyAppointments.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'history' ? 'bg-brand-orange text-brand-blue' : 'bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
              }`}>
                {historyAppointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {reviewSuccessMessage && (
        <div className="px-4 mt-2">
          <div className="bg-emerald-600 text-white rounded-2xl p-3.5 shadow-md flex items-center space-x-2.5 text-xs font-bold animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>{reviewSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="px-4 mt-3 space-y-3">
        {/* Active Tab */}
        {activeTab === 'active' && (
          <>
            {/* 🏷️ Virtual Sadoqat Kartalari banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-4 text-white shadow-md border border-amber-500/30 mb-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center space-x-1.5">
                      <span>{t.loyalty_card_title || "Virtual Sadoqat Kartasi"}</span>
                      <span className="text-[9px] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">VIP</span>
                    </h4>
                    <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                      {t.loyalty_card_reward || "Har 5-tashrifingizda 50% chegirma yoki bepul soqol!"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`py-2 rounded-xl flex flex-col items-center justify-center text-[10px] font-black transition-all ${
                      slot <= 3
                        ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 shadow-xs border border-amber-300/40'
                        : slot === 5
                        ? 'bg-amber-500/10 border-2 border-dashed border-amber-400 text-amber-300'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-500'
                    }`}
                  >
                    {slot <= 3 ? <Scissors className="w-3.5 h-3.5" /> : slot === 5 ? <Gift className="w-3.5 h-3.5" /> : '○'}
                    <span className="text-[9px] mt-0.5 font-extrabold">{slot === 5 ? '50%' : `#${slot}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeAppointments.length > 0 ? (
              activeAppointments.map((apt) => {
                const barberName = apt.barber_name || apt.barberName;
                const barberAvatar = apt.barber_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250";
                const serviceName = apt.service_name || apt.serviceName;
                const dateStr = apt.date_str || apt.date;
                const timeSlot = apt.time_slot || apt.time;
                const isPending = apt.status === 'pending';

                return (
                  <div
                    key={apt.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-blue-50 dark:border-slate-800 relative overflow-hidden"
                  >
                    {/* Status Top Strip */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 ${
                            apt.queue_status === 'ready_call'
                              ? 'bg-emerald-500 text-white animate-pulse shadow-sm'
                              : isPending
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            apt.queue_status === 'ready_call'
                              ? 'bg-white'
                              : isPending
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`} />
                          <span>
                            {apt.queue_status === 'ready_call'
                              ? (lang === 'ru' ? "Ваша очередь готова! ✂️" : lang === 'en' ? "Your turn is ready! ✂️" : "Navbatingiz tayyor! ✂️")
                              : isPending
                              ? (t.status_pending || "Kutilmoqda")
                              : (t.status_accepted || "Qabul qilindi")}
                          </span>
                        </span>

                        {/* 👨‍👦 Multi-person badge */}
                        {(apt.is_multi_person || apt.multi_person_details) && (
                          <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-950/40 text-brand-blue dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Users className="w-3 h-3 text-brand-orange" />
                            <span>2 kishi</span>
                          </span>
                        )}
                      </div>

                      <div className="inline-flex items-center space-x-1 text-xs font-black text-brand-orange bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>{timeSlot}</span>
                      </div>
                    </div>

                    {/* Barber & Service Info */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={barberAvatar}
                        alt={barberName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-blue/10 dark:ring-slate-700 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-brand-blue dark:text-white truncate">
                          {barberName}
                        </h3>
                        <p className="text-xs text-gray-700 dark:text-slate-300 font-semibold truncate mt-0.5">
                          {getTranslatedServiceName(serviceName, lang)}
                        </p>
                        {apt.is_multi_person && apt.multi_person_details && (
                          <p className="text-[11px] text-brand-orange font-bold truncate">
                            + {apt.multi_person_details.companion_title}: {apt.multi_person_details.companion_service} ({apt.multi_person_details.second_slot})
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-brand-blue dark:text-amber-400" />
                          <span>{formatAppointmentDate(dateStr, lang)}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-brand-blue dark:text-amber-400">
                          {apt.price?.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>

                    {/* ⏳ JONLI NAVBAT RADARI (Live Queue Radar) */}
                    {apt.status === 'accepted' && (
                      <div className={`mt-3 p-3.5 rounded-2xl border transition-all ${
                        apt.queue_status === 'ready_call'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md border-emerald-400'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/90 border-blue-200/80 dark:border-slate-700 text-brand-blue dark:text-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              apt.queue_status === 'ready_call'
                                ? 'bg-white text-emerald-600'
                                : 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                            }`}>
                              <Radio className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-[11px] font-black uppercase tracking-wider block text-brand-blue dark:text-amber-400">
                                {apt.queue_status === 'ready_call'
                                  ? (t.radar_turn_arrived || "🎉 Sizning navbatingiz yetib keldi!")
                                  : (t.live_queue_radar_title || "Jonli Navbat Radari")}
                              </span>
                              <span className={`text-xs font-bold block ${
                                apt.queue_status === 'ready_call' ? 'text-white' : 'text-gray-700 dark:text-slate-200'
                              }`}>
                                {apt.queue_status === 'ready_call'
                                  ? (t.radar_ready_desc || "Usta sizni kutmoqda. Sartaroshxonaga kiring ✂️")
                                  : (t.radar_waiting_desc || "Usta hozir sizdan oldingi 1 ta mijozni qabul qilmoqda")}
                              </span>
                            </div>
                          </div>

                          {apt.queue_status !== 'ready_call' && (
                            <span className="text-[10px] font-black bg-white/90 dark:bg-slate-900 text-brand-blue dark:text-amber-400 px-2.5 py-1 rounded-xl shadow-xs border border-blue-100 dark:border-slate-700">
                              ~15-20 {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : 'daq'}
                            </span>
                          )}
                        </div>

                        {/* Quick Navigation & Calendar Sync (Google & Apple) */}
                        <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAptForMap(apt)}
                            className="flex-1 py-2 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center space-x-1 transition-all bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 shadow-2xs active:scale-95"
                          >
                            <span>{lang === 'ru' ? '🗺️ Маршрут' : lang === 'en' ? '🗺️ Route' : '🗺️ Marshrut'}</span>
                          </button>

                          <a
                            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`BarberHub: ${barberName}`)}&details=${encodeURIComponent(`Xizmat: ${serviceName}`)}&location=${encodeURIComponent(apt.barber_address || "Barbershop")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center space-x-0.5 transition-all bg-white text-blue-800 border border-blue-100 hover:bg-blue-50 shadow-2xs"
                            title="Google Calendar"
                          >
                            <span>📅 Google</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => downloadIcsFile({
                              title: `BarberHub: ${barberName} (${serviceName})`,
                              details: `BarberHub navbati. Narxi: ${(apt.price || 0).toLocaleString()} UZS`,
                              location: apt.barber_address || "Toshkent",
                              timeSlot: apt.time_slot || apt.time,
                              dateStr: apt.date_str || apt.date
                            })}
                            className="flex-1 py-2 px-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center space-x-0.5 transition-all bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 shadow-2xs active:scale-95"
                            title="Apple Calendar / .ics"
                          >
                            <span>🍎 Apple</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status hint notice if pending */}
                    {isPending && (
                      <div className="mt-3 p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed border border-transparent dark:border-slate-700/60">
                        {t.radar_pending_notice || "Usta navbatingizni tasdiqlashi kutilmoqda. Tasdiqlanganda Telegram orqali xabar olasiz."}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
                      {apt.barber_phone && (
                        <a
                          href={`tel:${apt.barber_phone}`}
                          className="py-2 px-2.5 text-xs font-bold text-brand-blue dark:text-slate-200 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center space-x-1 border border-transparent dark:border-slate-700 active:scale-95"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{t.call_barber_btn || "Qo'ng'iroq"}</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenRescheduleModal(apt)}
                        className="flex-1 py-2 text-xs font-bold text-brand-blue dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/70 dark:border-amber-500/30 rounded-xl transition-colors flex items-center justify-center space-x-1 active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3 text-brand-orange" />
                        <span>{t.btn_reschedule || "Ko'chirish"}</span>
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="py-2 px-2.5 text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors border border-red-100 dark:border-red-900/30 active:scale-95"
                      >
                        {t.cancel_booking_btn || "Bekor qilish"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl p-6 shadow-sm border border-blue-50">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-700">
                  {t.no_active_appointments || "Hozircha faol navbatingiz yo'q"}
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto mb-4">
                  O'zingizga ma'qul usta va vaqtni tanlab, navbatga yoziling.
                </p>
                {onBackToCatalog && (
                  <button
                    onClick={onBackToCatalog}
                    className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    {t.find_barber_btn || "Usta topish va navbat olish"}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {historyAppointments.length > 0 ? (
              historyAppointments.map((apt) => {
                const barberName = apt.barber_name || apt.barberName;
                const barberAvatar = apt.barber_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250";
                const serviceName = apt.service_name || apt.serviceName;
                const isCompleted = apt.status === 'completed';

                return (
                  <div
                    key={apt.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-blue-50 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 ${
                          isCompleted
                            ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40'
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800/40'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                        <span>{isCompleted ? (t.status_completed || (lang === 'ru' ? 'Завершено' : lang === 'en' ? 'Completed' : 'Yakunlandi')) : (t.status_cancelled || (lang === 'ru' ? 'Отменено' : lang === 'en' ? 'Cancelled' : 'Bekor qilindi'))}</span>
                      </span>

                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        {formatAppointmentDate(apt.date_str || apt.date, lang)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={barberAvatar}
                        alt={barberName}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-gray-100 dark:ring-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {barberName}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-slate-300 truncate">
                          {getTranslatedServiceName(serviceName, lang)}
                        </p>
                        <span className="text-xs font-black text-brand-blue dark:text-amber-400 mt-0.5 block">
                          {apt.price?.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>

                    {/* Izoh qoldirish qismi (Agar xizmat yakunlangan bo'lsa) */}
                    {isCompleted && (
                      <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                        {apt.reviewed ? (
                          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-xs flex items-center justify-between border border-emerald-100 dark:border-emerald-800/40">
                            <div className="flex items-center space-x-1.5">
                              <div className="flex items-center text-amber-500">
                                {[...Array(apt.client_rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                {t.review_submitted_badge || "Izoh qoldirilgan"}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-slate-400">
                              {apt.client_rating}/5
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenReviewModal(apt)}
                            className="w-full py-2.5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs active:scale-95"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{t.leave_review_btn || "⭐ Izoh va baho qoldirish"}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl p-6 shadow-sm border border-blue-50">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-700">
                  {t.no_history_appointments || "Navbatlar tarixi mavjud emas"}
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Tugallangan navbatlaringiz shu yerda saqlanadi.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: Ustaga Baho va Izoh Qoldirish */}
      {selectedAptForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-transparent dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-2 border-b border-gray-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-base font-extrabold text-brand-blue dark:text-white">
                  {t.review_modal_title || "Ustaga baho va izoh qoldiring"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAptForReview(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 leading-relaxed">
              {t.review_modal_desc || "Sizning xolis bahoingiz ustaning reytingini oshirishga va boshqa mijozlarga yordam beradi"}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              {/* Star Rating Picker (1 to 5) */}
              <div className="text-center p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60">
                <label className="block text-xs font-bold text-amber-900 mb-1.5">
                  {t.your_rating_label || "Sizning bahoingiz"}:
                </label>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-extrabold text-brand-orange mt-1 block">
                  {reviewRating === 5
                    ? "Zo'r! (5/5)"
                    : reviewRating === 4
                    ? "Yaxshi (4/5)"
                    : reviewRating === 3
                    ? "O'rtacha (3/5)"
                    : reviewRating === 2
                    ? "Qoniqarsiz (2/5)"
                    : "Yomon (1/5)"}
                </span>
              </div>

              {/* Ism */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ismingiz:
                </label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="Masalan: Jasur"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* Izoh matni */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.your_comment_label || "Fikr va izohingiz"}:
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t.comment_placeholder || "Soch turmagi, xizmat sifati va qulaylik haqida yozing..."}
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAptForReview(null)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md transition-all"
                >
                  {isSubmittingReview ? "Yuborilmoqda..." : t.submit_review_btn || "Izohni yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Navbat vaqtini ko'chirish (Reschedule) */}
      {selectedAptForReschedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-transparent dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-brand-orange" />
                <h3 className="text-base font-extrabold text-brand-blue dark:text-white">
                  {t.reschedule_modal_title || "Vaqtni ko'chirish"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAptForReschedule(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              {t.reschedule_desc || "O'zingizga qulay yangi sana va soatni tanlang:"}
            </p>

            <div className="space-y-3.5">
              {/* Kun tanlash */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kunni tanlang:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    "Bugun",
                    "Ertaga",
                    "Indinga"
                  ].map((dStr) => (
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => setRescheduleDate(dStr)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        rescheduleDate === dStr
                          ? 'bg-brand-blue text-white shadow-sm ring-2 ring-brand-blue/20'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dStr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soat tanlash */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Bo'sh soatni tanlang:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    "10:00",
                    "11:30",
                    "14:00",
                    "15:30",
                    "17:00",
                    "18:30",
                    "20:00"
                  ].map((tStr) => (
                    <button
                      key={tStr}
                      type="button"
                      onClick={() => setRescheduleTime(tStr)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                        rescheduleTime === tStr
                          ? 'bg-brand-orange text-brand-blue shadow-sm ring-2 ring-amber-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tStr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-brand-blue font-semibold">
                Tanlangan yangi vaqt: <strong className="text-brand-blue">{rescheduleDate}, {rescheduleTime}</strong>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAptForReschedule(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  {t.btn_cancel || "Bekor qilish"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReschedule}
                  onClick={handleConfirmReschedule}
                  className="flex-1 py-2.5 text-xs font-extrabold text-brand-blue bg-brand-orange hover:bg-brand-orange-hover rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmittingReschedule ? "Saqlanmoqda..." : (t.reschedule_confirm_btn || "Tasdiqlash")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🗺️ Salonga Yo'nalish Olish Modali */}
      {selectedAptForMap && (
        <MapNavigationModal
          barber={{
            name: selectedAptForMap.barber_name || selectedAptForMap.barberName,
            address: selectedAptForMap.barber_address || selectedAptForMap.barberAddress || "Toshkent shahri",
            lat: selectedAptForMap.lat || 41.311081,
            lng: selectedAptForMap.lng || 69.240562,
          }}
          lang={lang}
          mode="all"
          onClose={() => setSelectedAptForMap(null)}
        />
      )}
    </div>
  );
}

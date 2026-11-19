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
  ArrowLeft
} from 'lucide-react';
import { getTranslatedServiceName } from '../data/serviceTranslations';
import { submitBarberReview, cancelClientAppointment } from '../services/api';
import { mockBarbers } from '../data/mockBarbers';

export default function ClientAppointmentsScreen({
  appointments = [],
  t,
  lang = 'uz',
  onBackToCatalog,
  onUpdateAppointments,
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  // Review Modal State
  const [selectedAptForReview, setSelectedAptForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('Mijoz');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(null);

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
    <div className="min-h-screen bg-[#E6EDF9] pb-28 max-w-md mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#E6EDF9]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2">
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
        <div className="grid grid-cols-2 gap-2 bg-gray-200/60 p-1 rounded-2xl mt-3">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'active'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{t.active_appointments || "Faol navbatlar"}</span>
            {activeAppointments.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'active' ? 'bg-brand-orange text-brand-blue' : 'bg-gray-300 text-gray-700'
              }`}>
                {activeAppointments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{t.history_appointments || "Navbatlar tarixi"}</span>
            {historyAppointments.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'history' ? 'bg-brand-orange text-brand-blue' : 'bg-gray-300 text-gray-700'
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
                    className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50 relative overflow-hidden"
                  >
                    {/* Status Top Strip */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                        <span>{isPending ? t.status_pending || "Kutilyapti" : t.status_accepted || "Tasdiqlangan"}</span>
                      </span>

                      <div className="inline-flex items-center space-x-1 text-xs font-black text-brand-orange bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>{timeSlot}</span>
                      </div>
                    </div>

                    {/* Barber & Service Info */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={barberAvatar}
                        alt={barberName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-blue/10 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-brand-blue truncate">
                          {barberName}
                        </h3>
                        <p className="text-xs text-gray-700 font-semibold truncate mt-0.5">
                          {getTranslatedServiceName(serviceName, lang)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-brand-blue" />
                          <span>{dateStr}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-brand-blue">
                          {apt.price?.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>

                    {/* Status hint notice */}
                    <div className="mt-3 p-2 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-relaxed">
                      {isPending
                        ? "Usta navbatingizni tasdiqlashi kutilmoqda. Tasdiqlanganda Telegram orqali xabar olasiz."
                        : "Navbatingiz usta tomonidan tasdiqlangan. Iltimos, o'z vaqtida kelishingizni so'raymiz."}
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 mt-3 pt-2 border-t border-gray-100">
                      {apt.barber_phone && (
                        <a
                          href={`tel:${apt.barber_phone}`}
                          className="flex-1 py-2 text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{t.call_barber_btn || "Qo'ng'iroq"}</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="flex-1 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
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
                    className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                        <span>{isCompleted ? t.status_completed || "Keldi / Yakunlandi" : t.status_cancelled || "Bekor qilingan"}</span>
                      </span>

                      <span className="text-xs font-bold text-gray-500">
                        {apt.date_str || apt.date}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={barberAvatar}
                        alt={barberName}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-gray-900 truncate">
                          {barberName}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {getTranslatedServiceName(serviceName, lang)}
                        </p>
                        <span className="text-xs font-black text-brand-blue mt-0.5 block">
                          {apt.price?.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>

                    {/* Izoh qoldirish qismi (Agar xizmat yakunlangan bo'lsa) */}
                    {isCompleted && (
                      <div className="pt-2 border-t border-gray-100">
                        {apt.reviewed ? (
                          <div className="p-2.5 bg-emerald-50 rounded-xl text-xs flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <div className="flex items-center text-amber-500">
                                {[...Array(apt.client_rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="text-[11px] font-bold text-emerald-800">
                                {t.review_submitted_badge || "Izoh qoldirilgan"}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {apt.client_rating}/5
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenReviewModal(apt)}
                            className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
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
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-1.5">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-base font-extrabold text-brand-blue">
                  {t.review_modal_title || "Ustaga baho va izoh qoldiring"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAptForReview(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
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
    </div>
  );
}

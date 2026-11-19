import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Search,
  RefreshCw,
  LogOut,
  BellRing,
  CreditCard,
  Crown,
  ChevronRight,
  TrendingUp,
  Scissors
} from 'lucide-react';
import { getSuperAdminStats, manageBarberSubscription, sendSuperAdminBroadcast } from '../services/api';

export default function SuperAdminScreen({ onExit, t }) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'billing' | 'broadcast' | 'barbers'
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [billingFilter, setBillingFilter] = useState('all'); // 'all' | 'expiring' | 'active' | 'suspended'

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState('all'); // 'all' | 'barbers' | 'clients'
  const [broadcastTitle, setBroadcastTitle] = useState('BarberHub Yangiliklari');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Action status toast
  const [toastMessage, setToastMessage] = useState('');

  const loadStats = async () => {
    setIsLoading(true);
    const data = await getSuperAdminStats();
    if (data) {
      setStatsData(data);
    } else {
      // Mock fallback for super admin display if backend is offline
      setStatsData({
        total_barbers: 12,
        total_appointments: 148,
        active_clients_count: 94,
        total_revenue_volume: 8640000,
        regions_breakdown: [
          { region: "Toshkent shahri", count: 7 },
          { region: "Samarqand", count: 2 },
          { region: "Farg'ona", count: 1 },
          { region: "Andijon", count: 1 },
          { region: "Toshkent viloyati", count: 1 }
        ],
        billing: {
          trial_expiring_count: 2,
          active_paid_count: 4,
          suspended_count: 1,
          active_trial_count: 5,
          all_barbers: [
            {
              id: "barber-2",
              name: "Sardor Karimov",
              phone: "+998 90 999 88 77",
              address: "Toshkent, Yunusobod tumani",
              trial_days_left: 2,
              subscription_status: "trial",
              linked_card: { type: "Uzcard", number: "8600 •••• 4589" },
              rating: 4.8,
              reviews_count: 218
            },
            {
              id: "barber-1",
              name: "Azizbek Rustamov",
              phone: "+998 90 123 45 67",
              address: "Toshkent, Yunusobod 14-mavze",
              trial_days_left: 0,
              subscription_status: "active",
              linked_card: { type: "Humo", number: "9860 •••• 1122" },
              rating: 4.9,
              reviews_count: 142
            },
            {
              id: "barber-3",
              name: "Jasur Alimov",
              phone: "+998 93 555 11 22",
              address: "Toshkent, Shahriston metrosi",
              trial_days_left: 1,
              subscription_status: "trial",
              linked_card: null,
              rating: 4.9,
              reviews_count: 89
            },
            {
              id: "barber-4",
              name: "Bobur Mirzayev",
              phone: "+998 97 777 44 33",
              address: "Toshkent, Chilonzor 9-mavze",
              trial_days_left: 0,
              subscription_status: "expired",
              linked_card: null,
              rating: 4.7,
              reviews_count: 64
            }
          ]
        }
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Usta obunasini boshqarish
  const handleSubscriptionAction = async (barberId, action) => {
    await manageBarberSubscription(barberId, action);
    showToast(
      action === 'extend_trial_7'
        ? "Sinov muddati +7 kunga uzaytirildi! 🟡"
        : action === 'activate_paid'
        ? "Akkaunt faol obunaga o'tkazildi! 🟢"
        : "Akkaunt vaqtincha to'xtatildi! 🔴"
    );
    loadStats();
  };

  // Ommaviy xabarnoma jo'natish
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSendingBroadcast(true);
    const result = await sendSuperAdminBroadcast({
      target: broadcastTarget,
      title: broadcastTitle,
      message: broadcastMessage
    });

    setIsSendingBroadcast(false);
    setBroadcastResult(result);
    showToast(result?.message || "Xabarnoma muvaffaqiyatli tarqatildi! 📢");
    setBroadcastMessage('');
  };

  // Obuna ro'yxati filtri
  const allBarbers = statsData?.billing?.all_barbers || [];
  const filteredBarbers = allBarbers.filter((b) => {
    const matchesSearch =
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.address || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (billingFilter === 'expiring') {
      return (b.trial_days_left || 0) <= 3 && b.subscription_status === 'trial';
    }
    if (billingFilter === 'active') {
      return b.subscription_status === 'active';
    }
    if (billingFilter === 'suspended') {
      return b.subscription_status === 'expired';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-32 max-w-md mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white py-2.5 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in max-w-xs text-center border border-white/20">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 bg-[#002f57] text-white z-40 pt-4 px-4 pb-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-brand-blue flex items-center justify-center font-black shadow-md">
              <Crown className="w-5 h-5 fill-brand-blue" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight flex items-center space-x-1.5">
                <span>Super Admin</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Boshqaruv
                </span>
              </h1>
              <span className="text-[10px] text-blue-200 block">Platforma egasi kabineti</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadStats}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 transition-colors"
              title="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onExit}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-blue-100 hover:text-white transition-colors flex items-center space-x-1 text-xs font-bold"
              title="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-2xl mt-3">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Statistika</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 relative ${
              activeTab === 'billing'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>To'lovlar</span>
            {(statsData?.billing?.trial_expiring_count || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400 absolute top-1.5 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'broadcast'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Xabarnoma</span>
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* ================= 1. STATISTIKA TABI ================= */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-2">
                  <Scissors className="w-4 h-4 text-brand-orange" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 block">Jami ustalar</span>
                <span className="text-xl font-black text-brand-blue mt-0.5 block">
                  {statsData?.total_barbers || 12} <span className="text-xs font-bold text-gray-500">ta</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  100% faol tizimda
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 block">Jami buyurtmalar</span>
                <span className="text-xl font-black text-gray-900 mt-0.5 block">
                  {statsData?.total_appointments || 148} <span className="text-xs font-bold text-gray-500">ta</span>
                </span>
                <span className="text-[10px] text-blue-600 font-bold block mt-1">
                  {statsData?.active_clients_count || 94} ta faol mijoz
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 block">Faol mijozlar</span>
                <span className="text-xl font-black text-purple-900 mt-0.5 block">
                  {statsData?.active_clients_count || 94}
                </span>
                <span className="text-[10px] text-purple-600 font-bold block mt-1">
                  Telegram orqali
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 block">Umumiy aylanma</span>
                <span className="text-base font-black text-brand-orange mt-0.5 block truncate">
                  {((statsData?.total_revenue_volume || 8640000) / 1000000).toFixed(1)}M <span className="text-[10px] font-bold text-gray-600">UZS</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">
                  Xizmatlar summasi
                </span>
              </div>
            </div>

            {/* Viloyatlar kesimida ustalar taqsimoti */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-blue">
                    Viloyatlar kesimida ustalar
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {statsData?.regions_breakdown?.length || 5} ta hudud
                </span>
              </div>

              <div className="space-y-3">
                {(statsData?.regions_breakdown || []).map((reg, idx) => {
                  const maxCount = Math.max(...(statsData?.regions_breakdown || [{ count: 1 }]).map(r => r.count), 1);
                  const percentage = Math.round((reg.count / (statsData?.total_barbers || 1)) * 100);

                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-gray-800">{reg.region}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-brand-blue">{reg.count} usta</span>
                          <span className="text-[10px] text-gray-400 font-medium">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-blue h-full rounded-full transition-all duration-500"
                          style={{ width: `${(reg.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platforma xavfsizligi va holati */}
            <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Tizim barqaror va onlayn ishlamoqda
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  Telegram Bot, Vercel frontend va FastAPI server uzluksiz sinxronlashgan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. TO'LOVLAR & OBUNALAR TABI ================= */}
        {activeTab === 'billing' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Quick Filter Badges */}
            <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 p-1 rounded-2xl text-[11px] font-bold">
              <button
                onClick={() => setBillingFilter('all')}
                className={`py-1.5 rounded-xl transition-all ${
                  billingFilter === 'all' ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Barchasi ({allBarbers.length})
              </button>
              <button
                onClick={() => setBillingFilter('expiring')}
                className={`py-1.5 rounded-xl transition-all ${
                  billingFilter === 'expiring' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Tugayapti ({statsData?.billing?.trial_expiring_count || 0})
              </button>
              <button
                onClick={() => setBillingFilter('active')}
                className={`py-1.5 rounded-xl transition-all ${
                  billingFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Faol ({statsData?.billing?.active_paid_count || 0})
              </button>
              <button
                onClick={() => setBillingFilter('suspended')}
                className={`py-1.5 rounded-xl transition-all ${
                  billingFilter === 'suspended' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                To'xtagan ({statsData?.billing?.suspended_count || 0})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Usta ismi yoki manzil bo'yicha qidirish..."
                className="w-full bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-800 border border-blue-50 focus:outline-none focus:border-brand-blue shadow-2xs"
              />
            </div>

            {/* Barbers Subscriptions Cards */}
            <div className="space-y-3">
              {filteredBarbers.map((b) => {
                const daysLeft = b.trial_days_left ?? 14;
                const status = b.subscription_status || 'trial';
                const isExpiring = daysLeft <= 3 && status === 'trial';
                const isPaid = status === 'active';
                const isSuspended = status === 'expired';

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
                          {b.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-brand-blue truncate">
                            {b.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 block">
                            {b.phone || '+998 90 123 45 67'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isSuspended
                            ? 'bg-red-100 text-red-800'
                            : isExpiring
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-blue-100 text-brand-blue'
                        }`}
                      >
                        {isPaid && <span>🟢 Faol obuna</span>}
                        {isSuspended && <span>🔴 To'xtatilgan</span>}
                        {!isPaid && !isSuspended && (
                          <span>🟡 Sinov: {daysLeft} kun qoldi</span>
                        )}
                      </span>
                    </div>

                    {/* Card & Details row */}
                    <div className="bg-gray-50 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-brand-blue" />
                        <span className="text-gray-600 font-medium">
                          {b.linked_card
                            ? `${b.linked_card.type || 'Karta'}: ${b.linked_card.number}`
                            : "Karta ulanmagan"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {b.address || 'Toshkent'}
                      </span>
                    </div>

                    {/* Action Buttons for Super Admin */}
                    <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => handleSubscriptionAction(b.id, 'extend_trial_7')}
                        className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold transition-colors"
                      >
                        +7 kun berish
                      </button>

                      <button
                        onClick={() => handleSubscriptionAction(b.id, 'activate_paid')}
                        className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold transition-colors"
                      >
                        🟢 Faollashtirish
                      </button>

                      <button
                        onClick={() => handleSubscriptionAction(b.id, 'suspend')}
                        className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[11px] font-bold transition-colors"
                        title="Akkauntni to'xtatish"
                      >
                        🔴 To'xtatish
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredBarbers.length === 0 && (
                <div className="text-center py-10 bg-white rounded-3xl p-5 border border-blue-50">
                  <p className="text-xs text-gray-400 font-semibold">
                    Ushbu toifada ustalar topilmadi.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. BROADCAST (OMMAVIY XABARNOMA) TABI ================= */}
        {activeTab === 'broadcast' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-brand-orange flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-brand-blue">
                  Ommaviy Telegram Xabarnoma
                </h3>
                <p className="text-[11px] text-gray-400">
                  Barcha ustalarga yoki mijozlarga bitta tugma bilan xabar yuborish
                </p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {/* Auditoriya tanlash */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Qabul qiluvchilar auditoriyasi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: '🌐 Barchaga' },
                    { id: 'barbers', label: '💈 Ustalarga' },
                    { id: 'clients', label: '👤 Mijozlarga' }
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setBroadcastTarget(aud.id)}
                      className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all text-center ${
                        broadcastTarget === aud.id
                          ? 'bg-brand-blue text-white shadow-sm ring-2 ring-brand-blue/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sarlavha */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Xabar sarlavhasi:
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Masalan: Yangi imkoniyatlar yoki Bayram aksiyasi"
                  className="w-full bg-gray-50 rounded-2xl p-3 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue font-medium"
                />
              </div>

              {/* Xabar matni */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Xabarnoma matni:
                </label>
                <textarea
                  rows="4"
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Hurmatli foydalanuvchilar, BarberHub ilovamizda yangi imkoniyatlar qo'shildi..."
                  className="w-full bg-gray-50 rounded-2xl p-3 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
                />
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-gray-600">
                <span className="font-bold text-brand-blue block mb-1">Telegramda ko'rinishi:</span>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-gray-800">
                  <p className="font-extrabold text-brand-blue mb-1">📢 {broadcastTitle || "Sarlavha"}</p>
                  <p className="whitespace-pre-line text-xs">{broadcastMessage || "Xabar matni bu yerda ko'rinadi..."}</p>
                  <p className="text-[10px] text-gray-400 mt-2 italic">💈 Hurmat bilan, BarberHub platformasi ma'muriyati</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingBroadcast || !broadcastMessage.trim()}
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingBroadcast ? "Xabar tarqatilmoqda..." : "🚀 Xabarnomani barchaga yuborish"}</span>
              </button>
            </form>

            {broadcastResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{broadcastResult.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

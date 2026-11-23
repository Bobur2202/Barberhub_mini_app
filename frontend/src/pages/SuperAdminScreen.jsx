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
  Scissors,
  User,
  UserPlus,
  Trash2,
  Key
} from 'lucide-react';
import { 
  getSuperAdminStats, 
  manageBarberSubscription, 
  sendSuperAdminBroadcast,
  getSuperAdminsList,
  addSuperAdminAccount,
  deleteSuperAdminAccount,
  getPlatformSettings,
  updatePlatformSettings
} from '../services/api';

export default function SuperAdminScreen({ 
  onExit, 
  t, 
  telegramUserId = "1973875822",
  onOpenClientView,
  onOpenBarberView
}) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'billing' | 'broadcast' | 'admins'
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [billingFilter, setBillingFilter] = useState('all'); // 'all' | 'expiring' | 'active' | 'suspended'

  // Super Admins state
  const [superAdminsList, setSuperAdminsList] = useState([]);
  const [newAdminTgId, setNewAdminTgId] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminActionError, setAdminActionError] = useState('');

  // Platform Tarif va To'lov sozlamalari
  const [platformSettings, setPlatformSettings] = useState({
    subscription_price: 50000,
    vip_boost_price: 40000,
    payment_card: "8600 0000 0000 0000",
    payment_card_holder: "BARBERHUB MA'MURIYATI",
    click_url: "https://my.click.uz/",
    payme_url: "https://payme.uz/",
    trial_days: 14,
    support_telegram: "@barberhub_admin",
    announcement_active: false,
    announcement_text: "🎉 BarberHub platformasiga xush kelibsiz! Eng yaxshi ustalarga qulay navbat oling.",
    announcement_type: "promo",
    maintenance_mode: false,
    maintenance_message: "Tizimda profilaktika ishlari olib borilmoqda. Tez orada qaytamiz!"
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');

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

  const loadAdmins = async () => {
    try {
      const list = await getSuperAdminsList(telegramUserId);
      if (list && Array.isArray(list)) {
        setSuperAdminsList(list);
      }
    } catch (e) {
      console.warn("Failed to load super admins list:", e);
    }
  };

  const handleSavePlatformSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveMsg('');
    try {
      const res = await updatePlatformSettings(platformSettings, telegramUserId);
      if (res?.success) {
        setPlatformSettings(res.settings);
        setSettingsSaveMsg("Tariflar va to'lov sozlamalari muvaffaqiyatli saqlandi! ✓");
        setTimeout(() => setSettingsSaveMsg(''), 4000);
        showToast("Tariflar muvaffaqiyatli yangilandi! ✓");
      }
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadAdmins();
    getPlatformSettings().then(res => {
      if (res) setPlatformSettings(res);
    });
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminTgId.trim()) return;
    setIsAddingAdmin(true);
    setAdminActionError('');
    try {
      const res = await addSuperAdminAccount({
        telegramId: telegramUserId,
        newAdminId: newAdminTgId.trim(),
        name: newAdminName.trim() || `Admin (${newAdminTgId.trim()})`
      });
      if (res?.success) {
        setSuperAdminsList(res.admins);
        setNewAdminTgId('');
        setNewAdminName('');
        showToast("Yangi super admin muvaffaqiyatli qo'shildi! ✓");
      } else {
        setAdminActionError(res?.detail || "Xatolik yuz berdi");
      }
    } catch (err) {
      setAdminActionError(err.message || "Xatolik yuz berdi");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (String(adminId) === "1973875822") {
      alert("Platforma egasini (Bosh adminni) o'chirib bo'lmaydi!");
      return;
    }
    if (!window.confirm(`Haqiqatan ham bu adminni (ID: ${adminId}) ro'yxatdan o'chirmoqchimisiz?`)) return;
    try {
      const res = await deleteSuperAdminAccount({
        telegramId: telegramUserId,
        adminId
      });
      if (res?.success) {
        setSuperAdminsList(res.admins);
        showToast("Admin muvaffaqiyatli o'chirildi! ✓");
      }
    } catch (err) {
      alert("O'chirishda xatolik: " + err.message);
    }
  };

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
        : action === 'suspend'
        ? "Akkaunt vaqtincha to'xtatildi! 🔴"
        : action === 'toggle_vip'
        ? "Usta VIP maqomi yangilandi! ⭐"
        : "Tasdiqlanganlik (Verified ✅) holati yangilandi!"
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
    <div className="min-h-screen bg-[#F8FAFC] pb-32 max-w-md mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white py-2.5 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in max-w-xs text-center border border-white/20">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 bg-[#0F172A] text-white z-40 pt-4 px-4 pb-3 shadow-md">
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

        {/* Tezkor Ko'rinishlar (Quick Preview Switcher for Super Admin) */}
        {(onOpenClientView || onOpenBarberView) && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10">
            {onOpenClientView && (
              <button
                onClick={onOpenClientView}
                className="py-1.5 px-2.5 rounded-xl bg-blue-500/25 hover:bg-blue-500/40 text-blue-100 hover:text-white border border-blue-400/30 transition-all flex items-center justify-center space-x-1.5 text-xs font-bold active:scale-95"
                title="Mijozlar ilovasi va katalogini ochish"
              >
                <User className="w-3.5 h-3.5 text-cyan-300" />
                <span>Mijoz ko'rinishi 👤</span>
              </button>
            )}

            {onOpenBarberView && (
              <button
                onClick={onOpenBarberView}
                className="py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/30 transition-all flex items-center justify-center space-x-1.5 text-xs font-bold active:scale-95"
                title="Usta kabineti va buyurtmalarni ochish"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>Usta kabineti ✂️</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-white/10 p-1 rounded-2xl mt-3 text-center">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="truncate">Statistika</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 relative ${
              activeTab === 'billing'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="truncate">To'lovlar</span>
            {(statsData?.billing?.trial_expiring_count || 0) > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 absolute top-1.5 right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'broadcast'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="truncate">Xabarnoma</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'admins'
                ? 'bg-amber-400 text-brand-blue shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">Adminlar</span>
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
            {/* ⚙️ Super Admin: Tariflar va To'lov Sozlamalari */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-blue">
                    Tariflar va To'lov Sozlamalari
                  </h3>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  Faqat Super Admin
                </span>
              </div>

              <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                {/* 1. Moliyaviy tariflar */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                    💰 Moliyaviy Tariflar va Kassa (SaaS)
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Oylik Obuna narxi (UZS):
                      </label>
                      <input
                        type="number"
                        required
                        step="5000"
                        value={platformSettings.subscription_price}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, subscription_price: Number(e.target.value) }))}
                        className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        VIP Boost narxi (UZS):
                      </label>
                      <input
                        type="number"
                        required
                        step="5000"
                        value={platformSettings.vip_boost_price}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, vip_boost_price: Number(e.target.value) }))}
                        className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      To'lov qabul qiluvchi karta raqami (P2P):
                    </label>
                    <input
                      type="text"
                      value={platformSettings.payment_card}
                      onChange={(e) => setPlatformSettings(p => ({ ...p, payment_card: e.target.value }))}
                      placeholder="8600 0000 0000 0000"
                      className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Click to'lov havolasi:
                      </label>
                      <input
                        type="url"
                        value={platformSettings.click_url}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, click_url: e.target.value }))}
                        placeholder="https://my.click.uz/..."
                        className="w-full bg-gray-50 rounded-xl px-3 py-2 text-[11px] text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Payme to'lov havolasi:
                      </label>
                      <input
                        type="url"
                        value={platformSettings.payme_url}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, payme_url: e.target.value }))}
                        placeholder="https://payme.uz/..."
                        className="w-full bg-gray-50 rounded-xl px-3 py-2 text-[11px] text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Platforma Siyosati va Qo'llab-quvvatlash */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                    ⚙️ Sinov Muddati va Aloqa
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Bepul Sinov Muddati (kun):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={platformSettings.trial_days || 14}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, trial_days: Number(e.target.value) }))}
                        className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                      />
                      <span className="text-[9px] text-gray-400 mt-0.5 block">Yangi ustalarga beriladi</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Admin Telegram username:
                      </label>
                      <input
                        type="text"
                        value={platformSettings.support_telegram || "@barberhub_admin"}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, support_telegram: e.target.value }))}
                        placeholder="@username"
                        className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                      />
                      <span className="text-[9px] text-gray-400 mt-0.5 block">Aloqa va cheklar uchun</span>
                    </div>
                  </div>
                </div>

                {/* 3. 📢 Umumiy E'lon / Aksiya Banneri */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                      📢 Katalog tepasidagi E'lon Banneri
                    </h4>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformSettings.announcement_active || false}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, announcement_active: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded text-brand-orange focus:ring-0"
                      />
                      <span className="text-[11px] font-bold text-brand-blue">
                        {platformSettings.announcement_active ? "Ko'rsatilsin" : "O'chiq"}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <select
                        value={platformSettings.announcement_type || 'promo'}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, announcement_type: e.target.value }))}
                        className="bg-gray-50 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-gray-800 border border-gray-200"
                      >
                        <option value="promo">🎁 Aksiya / Yangilik</option>
                        <option value="info">ℹ️ Muhim ma'lumot</option>
                        <option value="warning">⚠️ Ogohlantirish</option>
                      </select>
                      <span className="text-[10px] text-gray-400">Banner uslubi</span>
                    </div>

                    <textarea
                      rows={2}
                      value={platformSettings.announcement_text || ''}
                      onChange={(e) => setPlatformSettings(p => ({ ...p, announcement_text: e.target.value }))}
                      placeholder="Mijozlar katalogida ko'rinadigan umumiy e'lon matni..."
                      className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                {/* 4. 🔒 Texnik Profilaktika Rejimi (Maintenance Mode) */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center space-x-1">
                      <span>🔒 Profilaktika Rejimi</span>
                      {platformSettings.maintenance_mode && (
                        <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                          FAOL
                        </span>
                      )}
                    </h4>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformSettings.maintenance_mode || false}
                        onChange={(e) => setPlatformSettings(p => ({ ...p, maintenance_mode: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded text-red-600 focus:ring-0"
                      />
                      <span className={`text-[11px] font-bold ${platformSettings.maintenance_mode ? 'text-red-600' : 'text-gray-500'}`}>
                        {platformSettings.maintenance_mode ? "Tizim yopiq" : "Tizim ochiq"}
                      </span>
                    </label>
                  </div>

                  {platformSettings.maintenance_mode && (
                    <input
                      type="text"
                      value={platformSettings.maintenance_message || ''}
                      onChange={(e) => setPlatformSettings(p => ({ ...p, maintenance_message: e.target.value }))}
                      placeholder="Profilaktika xabari..."
                      className="w-full bg-red-50 rounded-xl px-3 py-2 text-xs font-medium text-red-900 border border-red-200 focus:outline-none"
                    />
                  )}
                </div>

                {settingsSaveMsg && (
                  <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 animate-in fade-in">
                    {settingsSaveMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSavingSettings ? "Saqlanmoqda..." : "Barcha Sozlamalarni Saqlash ✓"}</span>
                </button>
              </form>
            </div>

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
                          <h4 className="font-extrabold text-sm text-brand-blue truncate flex items-center space-x-1.5">
                            <span>{b.name}</span>
                            {b.is_verified && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full font-black border border-blue-200" title="Rasmiy tasdiqlangan">
                                ✓
                              </span>
                            )}
                            {b.is_vip && (
                              <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 rounded-full" title="VIP Boost">
                                ⭐ VIP
                              </span>
                            )}
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
                    <div className="space-y-1.5 pt-1 border-t border-gray-100">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleSubscriptionAction(b.id, 'extend_trial_7')}
                          className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          +7 kun
                        </button>

                        <button
                          onClick={() => handleSubscriptionAction(b.id, 'activate_paid')}
                          className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          🟢 Obuna
                        </button>

                        <button
                          onClick={() => handleSubscriptionAction(b.id, 'suspend')}
                          className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[10px] font-bold transition-colors"
                          title="Akkauntni to'xtatish"
                        >
                          🔴 To'xtatish
                        </button>
                      </div>

                      {/* VIP va Verified boshqaruvi */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleSubscriptionAction(b.id, 'toggle_vip')}
                          className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center space-x-1 ${
                            b.is_vip
                              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs font-black'
                              : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          <span>{b.is_vip ? "⭐ VIP Faol" : "⭐ VIP berish"}</span>
                        </button>

                        <button
                          onClick={() => handleSubscriptionAction(b.id, 'toggle_verified')}
                          className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center space-x-1 ${
                            b.is_verified
                              ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-black'
                              : 'bg-blue-50/80 hover:bg-blue-100 text-brand-blue border-blue-200'
                          }`}
                        >
                          <span>{b.is_verified ? "✅ Tasdiqlangan" : "✅ Tasdiqlash"}</span>
                        </button>
                      </div>
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

        {/* ================= 4. SUPER ADMINLAR TABI ================= */}
        {activeTab === 'admins' && (
          <div className="space-y-4 animate-in fade-in pb-12">
            {/* Header / Info Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-brand-blue text-sm">
                    Super Adminlar Nazorati
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Platformani boshqarish huquqiga ega akkauntlar ro'yxati
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <p>
                  🔒 <b>Xavfsizlik qoidasi:</b> Faqat shu ro'yxatda mavjud bo'lgan Telegram ID egalarigina ilovaning Super Admin bo'limiga kira oladi. Begona mijozlar yoki ustalarga bu boshqaruv bo'limi umuman ko'rinmaydi.
                </p>
              </div>
            </div>

            {/* Qo'shish Formasi */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
              <h4 className="font-extrabold text-brand-blue text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-brand-orange" />
                <span>Yangi Super Admin Qo'shish</span>
              </h4>

              <form onSubmit={handleAddAdmin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Telegram ID raqami: *
                  </label>
                  <input
                    type="number"
                    required
                    value={newAdminTgId}
                    onChange={(e) => setNewAdminTgId(e.target.value)}
                    placeholder="Masalan: 987654321"
                    className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Admin o'z Telegram ID sini @userinfobot orqali bilishi mumkin
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Admin ismi / izoh:
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Masalan: Akmal (Yordamchi menejer)"
                    className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {adminActionError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                    ⚠️ {adminActionError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isAddingAdmin || !newAdminTgId.trim()}
                  className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingAdmin ? "Qo'shilmoqda..." : "+ Super Admin qo'shish"}</span>
                </button>
              </form>
            </div>

            {/* Mavjud Adminlar Ro'yxati */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
              <h4 className="font-extrabold text-brand-blue text-xs uppercase tracking-wider mb-3">
                Faol Super Adminlar ({superAdminsList.length})
              </h4>

              <div className="space-y-2.5">
                {superAdminsList.map((admin) => {
                  const isOwner = String(admin.id) === "1973875822";
                  return (
                    <div
                      key={admin.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isOwner
                          ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                          : 'bg-gray-50/70 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isOwner ? 'bg-amber-500 text-brand-blue' : 'bg-blue-100 text-brand-blue'
                        }`}>
                          {isOwner ? '👑' : '👤'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-xs text-brand-blue">
                              {admin.name || "Admin"}
                            </span>
                            {isOwner && (
                              <span className="text-[9px] bg-brand-orange text-brand-blue font-black px-1.5 py-0.2 rounded-full uppercase">
                                Bosh Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-gray-500 block">
                            ID: {admin.id}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isOwner ? (
                          <span className="text-[10px] text-amber-800 font-extrabold bg-amber-100/60 px-2 py-1 rounded-lg">
                            Ega
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Adminni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

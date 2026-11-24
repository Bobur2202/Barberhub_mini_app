import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  Check,
  X,
  CreditCard,
  Plus,
  Scissors,
  CheckCircle,
  AlertCircle,
  DollarSign,
  RefreshCw,
  Edit2,
  Trash2,
  Tag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Star,
  Camera,
  Image as ImageIcon,
  Upload,
  Eye,
  MapPin,
  LogOut,
  Cloud,
  BellRing,
  Radio,
  Users,
  Coffee,
  CalendarDays,
  Layers,
  ChevronRight,
  Receipt,
  FileText,
  Printer,
  Download,
  UserCheck,
  UserPlus,
  Send,
  PhoneCall,
  Rocket
} from 'lucide-react';
import { 
  getAdminAppointments, 
  updateAppointmentStatus, 
  updateBarberSchedule, 
  sendAppointmentReminder, 
  callClientToChair,
  cancelBarberSubscription,
  activateVipBoost,
  getPlatformSettings
} from '../services/api';
import { 
  getTranslatedServiceName, 
  formatServiceDuration,
  formatAppointmentDate,
  getTranslatedPromoBadge,
  getTranslatedDayName,
  getTranslatedRole 
} from '../data/serviceTranslations';
import { mockBarbers } from '../data/mockBarbers';
import { hapticFeedback } from '../utils/haptics';
import { openExternalUrl } from '../utils/openExternalUrl';

// 00 dan 23 gacha hamma 24 ta soat
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
// 00 dan 59 gacha hamma 60 ta minut
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// Maxsus aniq vaqt tanlash komponenti (Soat 00-23 va Minut 00-59)
function TimePickerField({ label, value, onChange, icon, lang = 'uz', t = {} }) {
  const parts = (value || "09:00").split(':');
  const h = parts[0] || "09";
  const m = parts[1] || "00";

  const handleHour = (newH) => {
    onChange(`${newH}:${m}`);
  };

  const handleMinute = (newM) => {
    onChange(`${h}:${newM}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
          {icon}
          <span>{label}</span>
        </span>
        <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
          {h}:{m}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Soat (00 - 23) */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
            {t?.hour_label_24 || (lang === 'ru' ? 'Час (00 - 23)' : lang === 'en' ? 'Hour (00 - 23)' : 'Soat (00 - 23)')}
          </label>
          <select
            value={h}
            onChange={(e) => handleHour(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            {HOURS_24.map((hour) => (
              <option key={hour} value={hour} className="dark:bg-slate-800 dark:text-white">
                {hour}:00
              </option>
            ))}
          </select>
        </div>

        {/* Minut (00 - 59) */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
            {t?.minute_label_60 || (lang === 'ru' ? 'Минуты (00 - 59)' : lang === 'en' ? 'Minutes (00 - 59)' : 'Minut (00 - 59)')}
          </label>
          <select
            value={m}
            onChange={(e) => handleMinute(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            {MINUTES_60.map((min) => (
              <option key={min} value={min} className="dark:bg-slate-800 dark:text-white">
                {min}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tezkor minut knopkalari */}
      <div className="flex items-center space-x-1.5 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
          {t?.quick_label || (lang === 'ru' ? 'Быстро:' : lang === 'en' ? 'Quick:' : 'Tezkor:')}
        </span>
        {['00', '15', '30', '45'].map((quickM) => (
          <button
            key={quickM}
            type="button"
            onClick={() => handleMinute(quickM)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
              m === quickM
                ? 'bg-amber-500 dark:bg-amber-500 text-slate-950 font-black shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            :{quickM}
          </button>
        ))}
      </div>
    </div>
  );
}

// Curated stylish avatar presets for quick selection
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250"
];

// Curated barbershop salon interior presets for quick adding
const SALON_PRESETS = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=700"
];

export default function AdminDashboardScreen({
  t,
  currentBarber,
  lang = 'uz',
  onUpdateProfile,
  onLogout,
  onDeleteAccount
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed'
  const [mainTab, setMainTab] = useState('appointments'); // 'appointments' | 'schedule' | 'services' | 'finance'
  const [scheduleSaveToast, setScheduleSaveToast] = useState('');

  // Modal for Logout & Delete Account
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // ☕ Tezkor Tanaffus (Quick Break) State
  const [quickBreakUntil, setQuickBreakUntil] = useState(() => {
    const saved = localStorage.getItem('barberhub_quick_break');
    if (saved) {
      const ts = parseInt(saved, 10);
      if (ts > Date.now()) return ts;
    }
    return null;
  });

  // 📋 vs 📅 Jadval (Timeline / List View Switch)
  const [appointmentsViewMode, setAppointmentsViewMode] = useState('list'); // 'list' | 'timeline'

  // 🚶‍♂️ Jonli Mijoz (Walk-in / Offline Client) Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('+998 ');
  const [walkInServiceId, setWalkInServiceId] = useState('');
  const [walkInPrice, setWalkInPrice] = useState(50000);
  const [walkInPaymentType, setWalkInPaymentType] = useState('cash'); // 'cash' | 'card'
  const [walkInTime, setWalkInTime] = useState('');

  // 🧾 Kun Yakuni Kassa Cheki Modal State
  const [showDailyReceiptModal, setShowDailyReceiptModal] = useState(false);
  const [receiptSentToTg, setReceiptSentToTg] = useState(false);

  // 📢 1-Bosishda Mijozni Chaqirish Pop-up Alert
  const [calledClientAlert, setCalledClientAlert] = useState(null);

  // Usta profili (Avatar, Ish vaqti, Salon rasmlari)
  const [barberProfile, setBarberProfile] = useState(() => {
    if (currentBarber) return currentBarber;
    const saved = localStorage.getItem('barberhub_barber_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: "barber-2",
      name: "Sardor Karimov",
      role: "Erkaklar sartaroshi",
      address: "Toshkent, Yunusobod, Amir Temur shoh ko'chasi 107",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      workHours: { start: "09:00", end: "22:00" },
      salonPhotos: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=700"
      ]
    };
  });

  const updateProfileData = (newData) => {
    const updated = { ...barberProfile, ...newData };
    setBarberProfile(updated);
    localStorage.setItem('barberhub_barber_profile', JSON.stringify(updated));
    if (onUpdateProfile) onUpdateProfile(updated);

    // Sync into mockBarbers list
    const idx = mockBarbers.findIndex(b => b.id === updated.id || b.name === updated.name);
    if (idx !== -1) {
      mockBarbers[idx] = { ...mockBarbers[idx], ...updated };
    }
  };

  // 1. Ish vaqti va Dam olish kunlari sozlamalari
  const [showWorkHoursModal, setShowWorkHoursModal] = useState(false);
  const [tempWorkStart, setTempWorkStart] = useState(barberProfile.workHours?.start || "09:00");
  const [tempWorkEnd, setTempWorkEnd] = useState(barberProfile.workHours?.end || "22:00");
  const [tempIsWorkingToday, setTempIsWorkingToday] = useState(barberProfile.isWorkingToday !== false);
  const [tempDaysOff, setTempDaysOff] = useState(barberProfile.daysOff || []);
  const [tempBreakEnabled, setTempBreakEnabled] = useState(barberProfile.breakTime?.enabled !== false);
  const [tempBreakStart, setTempBreakStart] = useState(barberProfile.breakTime?.start || "13:00");
  const [tempBreakEnd, setTempBreakEnd] = useState(barberProfile.breakTime?.end || "14:00");

  const handleToggleWorkingToday = async () => {
    const nextStatus = barberProfile.isWorkingToday === false ? true : false;
    updateProfileData({ isWorkingToday: nextStatus });
    setTempIsWorkingToday(nextStatus);
    if (barberProfile.id) {
      await updateBarberSchedule(barberProfile.id, {
        isWorkingToday: nextStatus,
        daysOff: barberProfile.daysOff || [],
        workHours: barberProfile.workHours,
        breakTime: barberProfile.breakTime
      });
    }
  };

  const handleToggleDayOff = (dayName) => {
    setTempDaysOff(prev =>
      prev.includes(dayName) ? prev.filter(d => d !== dayName) : [...prev, dayName]
    );
  };

  const handleSaveWorkHours = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const breakData = {
      enabled: tempBreakEnabled,
      start: tempBreakStart,
      end: tempBreakEnd
    };
    updateProfileData({
      workHours: { start: tempWorkStart, end: tempWorkEnd },
      breakTime: breakData,
      isWorkingToday: tempIsWorkingToday,
      daysOff: tempDaysOff,
    });
    setShowWorkHoursModal(false);
    setScheduleSaveToast("Ish grafigi va vaqtlar muvaffaqiyatli saqlandi! ✅");
    setTimeout(() => setScheduleSaveToast(''), 3500);

    if (barberProfile.id) {
      await updateBarberSchedule(barberProfile.id, {
        isWorkingToday: tempIsWorkingToday,
        daysOff: tempDaysOff,
        workHours: { start: tempWorkStart, end: tempWorkEnd },
        breakTime: breakData
      });
    }
  };

  // 2. Profil rasmi (Avatar)
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(barberProfile.avatar);
  const avatarFileInputRef = useRef(null);

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    updateProfileData({ avatar: tempAvatar });
    setShowAvatarModal(false);
  };

  // 3. Sartaroshxona rasmlari (Salon Photos Gallery)
  const [showSalonPhotoModal, setShowSalonPhotoModal] = useState(false);
  const [tempSalonPhotoUrl, setTempSalonPhotoUrl] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const salonFileInputRef = useRef(null);

  const handleSalonPhotoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSalonPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSalonPhoto = (e) => {
    e.preventDefault();
    if (!tempSalonPhotoUrl) return;
    const currentPhotos = barberProfile.salonPhotos || [];
    const updatedPhotos = [tempSalonPhotoUrl, ...currentPhotos];
    updateProfileData({ salonPhotos: updatedPhotos });
    setTempSalonPhotoUrl('');
    setShowSalonPhotoModal(false);
  };

  const handleDeleteSalonPhoto = (photoIndex) => {
    if (window.confirm(t.delete_photo_confirm || "Ushbu rasmni o'chirmoqchimisiz?")) {
      const currentPhotos = barberProfile.salonPhotos || [];
      const updatedPhotos = currentPhotos.filter((_, i) => i !== photoIndex);
      updateProfileData({ salonPhotos: updatedPhotos });
    }
  };

  // Navbatlar ro'yxati
  const [appointments, setAppointments] = useState([
    {
      id: 'apt-1',
      clientName: 'Sardorbek Rahimov',
      client_name: 'Sardorbek Rahimov',
      phone: '+998 90 123 45 67',
      client_phone: '+998 90 123 45 67',
      serviceName: 'Soch va soqol tekislash (Kompleks)',
      service_name: 'Soch va soqol tekislash (Kompleks)',
      price: 80000,
      time: '14:30',
      time_slot: '14:30',
      date: '18-Noyabr',
      date_str: '18-Noyabr',
      status: 'pending',
    },
    {
      id: 'apt-2',
      clientName: 'Javohir Toshpulatov',
      client_name: 'Javohir Toshpulatov',
      phone: '+998 93 555 44 33',
      client_phone: '+998 93 555 44 33',
      serviceName: 'Soch kesish va turmaklash',
      service_name: 'Soch kesish va turmaklash',
      price: 60000,
      time: '15:30',
      time_slot: '15:30',
      date: '18-Noyabr',
      date_str: '18-Noyabr',
      status: 'accepted',
    },
    {
      id: 'apt-3',
      clientName: 'Temur Mirzayev',
      client_name: 'Temur Mirzayev',
      phone: '+998 97 111 22 33',
      client_phone: '+998 97 111 22 33',
      serviceName: 'Talabalar uchun (Soch kesish)',
      service_name: 'Talabalar uchun (Soch kesish)',
      price: 50000,
      time: '12:00',
      time_slot: '12:00',
      date: '18-Noyabr',
      date_str: '18-Noyabr',
      status: 'completed',
    },
  ]);

  // Xizmatlar ro'yxati (Aksiya va Talaba tariflari bilan)
  const [servicesList, setServicesList] = useState([
    {
      id: '1',
      name: 'Soch kesish va turmaklash',
      price: 60000,
      duration: '40 daq',
      isPromo: false
    },
    {
      id: '2',
      name: 'Soch va soqol parvarishi',
      price: 90000,
      duration: '60 daq',
      isPromo: false
    },
    {
      id: '3',
      name: 'Talabalar uchun (Chegirma)',
      price: 45000,
      oldPrice: 60000,
      duration: '35 daq',
      isPromo: true,
      promoBadge: 'Talabalik guvohnomasi bilan'
    },
    {
      id: '4',
      name: 'Fade & Crop soch kesish',
      price: 55000,
      duration: '45 daq',
      isPromo: false
    }
  ]);

  // Modal holatlari
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  
  // Yangi/Tahrirlanayotgan xizmat formasi
  const [formServiceName, setFormServiceName] = useState('');
  const [formServicePrice, setFormServicePrice] = useState('');
  const [formServiceDuration, setFormServiceDuration] = useState('40 daq');
  const [formIsPromo, setFormIsPromo] = useState(false);
  const [formOldPrice, setFormOldPrice] = useState('');
  const [formPromoBadge, setFormPromoBadge] = useState('Talabalar uchun');

  // To'lov va Karta holatlari
  const [linkedCard, setLinkedCard] = useState(() => {
    const saved = localStorage.getItem('barberhub_linked_card');
    return saved ? JSON.parse(saved) : { number: '8600 •••• •••• 4589', expiry: '08/28', type: 'Uzcard' };
  });
  const [showCardModal, setShowCardModal] = useState(false);
  const [inputCardNumber, setInputCardNumber] = useState('');
  const [inputCardExpiry, setInputCardExpiry] = useState('');

  // Super Admin belgilagan dinamik narxlar va to'lov havolalari
  const [platformSettings, setPlatformSettings] = useState({
    subscription_price: 50000,
    vip_boost_price: 40000,
    payment_card: "8600 0000 0000 0000",
    click_url: "https://my.click.uz/",
    payme_url: "https://payme.uz/"
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await getPlatformSettings();
      if (data) setPlatformSettings(data);
    }
    loadSettings();
  }, []);

  // To'lov usullari modali
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newBookingNotification, setNewBookingNotification] = useState(null);
  const barberDisplayName = barberProfile.name || "Sardor Karimov";

  // Backenddan buyurtmalarni sokin (silent) fonda avtomatik yangilash
  const loadAppointments = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const backendData = await getAdminAppointments();
      if (backendData && backendData.length > 0) {
        setAppointments((prev) => {
          if (silent && prev && prev.length > 0) {
            const prevIds = new Set(prev.map((a) => a.id));
            const brandNew = backendData.filter((a) => !prevIds.has(a.id) && a.status === 'pending');
            if (brandNew.length > 0) {
              hapticFeedback.notification('success');
              setNewBookingNotification(brandNew[0]);
              setTimeout(() => {
                setNewBookingNotification(null);
              }, 7000);
            }
          }
          return backendData;
        });
      }
    } catch (err) {
      console.warn("Silent sync appointments error:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments(false);
    // Fonda har 15 soniyada yangilanish (ustaning qo'shimcha tugma bosishiga hojat yo'q)
    const interval = setInterval(() => {
      loadAppointments(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Status changers
  const handleUpdateStatus = async (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    await updateAppointmentStatus(id, newStatus);
  };

  const [reminderLoadingId, setReminderLoadingId] = useState(null);
  const [reminderToast, setReminderToast] = useState('');
  const [callingClientId, setCallingClientId] = useState(null);

  const handleCallClient = async (id) => {
    setCallingClientId(id);
    const targetApt = appointments.find(a => a.id === id);
    try {
      hapticFeedback.impact('medium');
      await callClientToChair(id);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, queue_status: 'ready_call' } : item))
      );
      hapticFeedback.notification('success');
      setCalledClientAlert({
        name: targetApt?.clientName || targetApt?.client_name || "Mijoz",
        time: targetApt?.time || targetApt?.time_slot || "Hozir",
        service: targetApt?.serviceName || targetApt?.service_name || "Soch olish"
      });
      setReminderToast("Mijozga 'Navbatingiz tayyor, kiring!' xabari yetkazildi! 📢");
      setTimeout(() => setReminderToast(''), 4000);
    } catch (err) {
      console.warn("Mijozni chaqirishda xatolik:", err);
    } finally {
      setCallingClientId(null);
    }
  };

  // ☕ Tezkor Tanaffus Boshqaruvi
  const handleStartQuickBreak = (minutes) => {
    const until = Date.now() + minutes * 60 * 1000;
    setQuickBreakUntil(until);
    localStorage.setItem('barberhub_quick_break', String(until));
    hapticFeedback.notification('success');
    setScheduleSaveToast(`☕ ${minutes} daqiqalik tezkor tanaffus yoqildi!`);
    setTimeout(() => setScheduleSaveToast(''), 3500);
  };

  const handleEndQuickBreak = () => {
    setQuickBreakUntil(null);
    localStorage.removeItem('barberhub_quick_break');
    hapticFeedback.impact('medium');
    setScheduleSaveToast("🟢 Tezkor tanaffus yakunlandi, ish davom etmoqda!");
    setTimeout(() => setScheduleSaveToast(''), 3500);
  };

  // 🚶‍♂️ Jonli Mijoz (Walk-in) Boshqaruvi
  const handleOpenWalkInModal = (defaultTime = null) => {
    hapticFeedback.impact('light');
    setWalkInName('');
    setWalkInPhone('+998 ');
    const firstSrv = servicesList[0];
    setWalkInServiceId(firstSrv?.id || 's-1');
    setWalkInPrice(firstSrv?.price || 50000);
    setWalkInPaymentType('cash');
    if (defaultTime) {
      setWalkInTime(defaultTime);
    } else {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setWalkInTime(`${h}:${m}`);
    }
    setShowWalkInModal(true);
  };

  const handleSubmitWalkIn = (e) => {
    e.preventDefault();
    hapticFeedback.notification('success');
    const selectedSrv = servicesList.find(s => s.id === walkInServiceId);
    const newApt = {
      id: `walkin-${Date.now()}`,
      clientName: walkInName.trim() || "Ko'chadan mijoz",
      client_name: walkInName.trim() || "Ko'chadan mijoz",
      phone: walkInPhone.trim() || "+998 -- --- -- --",
      client_phone: walkInPhone.trim() || "+998 -- --- -- --",
      serviceName: selectedSrv?.name || "Klassik soch kesish",
      service_name: selectedSrv?.name || "Klassik soch kesish",
      price: Number(walkInPrice) || 50000,
      time: walkInTime || "Hozir",
      time_slot: walkInTime || "Hozir",
      date_str: "Bugun",
      status: 'completed',
      paymentType: walkInPaymentType,
      is_walk_in: true,
      created_at: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev]);
    setShowWalkInModal(false);
    setReminderToast("🚶‍♂️ Jonli mijoz kassa va navbatga muvaffaqiyatli qo'shildi! 💰");
    setTimeout(() => setReminderToast(''), 4000);
  };

  // 📅 Kunlik Vaqt Jadvali (Timeline Slots)
  const generateTimelineSlots = () => {
    const startStr = barberProfile.workHours?.start || "09:00";
    const endStr = barberProfile.workHours?.end || "22:00";
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    const startMinutes = (startH || 9) * 60 + (startM || 0);
    const endMinutes = (endH || 22) * 60 + (endM || 0);

    const bStart = barberProfile.breakTime?.start ? barberProfile.breakTime.start.split(':').map(Number) : [13, 0];
    const bEnd = barberProfile.breakTime?.end ? barberProfile.breakTime.end.split(':').map(Number) : [14, 0];
    const breakStartMin = bStart[0] * 60 + bStart[1];
    const breakEndMin = bEnd[0] * 60 + bEnd[1];

    const slots = [];
    let cur = startMinutes;
    while (cur < endMinutes) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const timeFmt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      const isLunch = barberProfile.breakTime?.enabled !== false && cur >= breakStartMin && cur < breakEndMin;
      const matchingApt = appointments.find(a => (a.time === timeFmt || a.time_slot === timeFmt));

      slots.push({
        time: timeFmt,
        isLunch,
        appointment: matchingApt || null
      });

      cur += 45; // 45 daqiqalik qulay oraliq
    }
    return slots;
  };

  const handleSendReminder = async (id) => {
    setReminderLoadingId(id);
    try {
      await sendAppointmentReminder(id);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, reminder_sent: true, sms_sent: true } : item))
      );
      setReminderToast(t.reminder_success_toast || "Mijozga Telegram va SMS orqali eslatma yuborildi! 🔔");
      setTimeout(() => setReminderToast(''), 4000);
    } catch (err) {
      console.warn("Eslatma yuborishda xatolik:", err);
    } finally {
      setReminderLoadingId(null);
    }
  };

  // 1. Yangi xizmat qo'shish modalini ochish
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setFormServiceName('');
    setFormServicePrice('');
    setFormServiceDuration('40');
    setFormIsPromo(false);
    setFormOldPrice('');
    setFormPromoBadge('Talabalar uchun');
    setShowServiceModal(true);
  };

  // 2. Mavjud xizmatni tahrirlash modalini ochish
  const handleOpenEditService = (service) => {
    setEditingServiceId(service.id);
    setFormServiceName(service.name);
    setFormServicePrice(service.price);
    const minsOnly = service.duration ? String(service.duration).replace(/\D/g, '') : '40';
    setFormServiceDuration(minsOnly || '40');
    setFormIsPromo(Boolean(service.isPromo));
    setFormOldPrice(service.oldPrice || '');
    setFormPromoBadge(service.promoBadge || 'Talabalar uchun');
    setShowServiceModal(true);
  };

  // 3. Xizmatni o'chirish
  const handleDeleteService = (id) => {
    if (window.confirm(t.confirm_delete_service)) {
      setServicesList(prev => prev.filter(s => s.id !== id));
    }
  };

  // 4. Xizmatni saqlash (Qo'shish yoki Tahrirlash)
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!formServiceName || !formServicePrice) return;

    const mins = formServiceDuration ? String(formServiceDuration).replace(/\D/g, '') : '40';
    const formattedDuration = `${mins || 40} daq`;

    if (editingServiceId) {
      setServicesList(prev => prev.map(s => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            name: formServiceName,
            price: Number(formServicePrice),
            duration: formattedDuration,
            isPromo: formIsPromo,
            oldPrice: formIsPromo && formOldPrice ? Number(formOldPrice) : null,
            promoBadge: formIsPromo ? formPromoBadge : null
          };
        }
        return s;
      }));
    } else {
      const newService = {
        id: `s-${Date.now()}`,
        name: formServiceName,
        price: Number(formServicePrice),
        duration: formattedDuration,
        isPromo: formIsPromo,
        oldPrice: formIsPromo && formOldPrice ? Number(formOldPrice) : null,
        promoBadge: formIsPromo ? formPromoBadge : null
      };
      setServicesList(prev => [...prev, newService]);
    }

    setShowServiceModal(false);
  };

  // 5. Kartani saqlash (Uzcard, Humo, Visa, Mastercard)
  const handleSaveCard = (e) => {
    e.preventDefault();
    const cleanNum = inputCardNumber.replace(/\s+/g, '');
    if (!cleanNum || cleanNum.length < 16) {
      alert("Iltimos, 16 xonali karta raqamini to'liq kiriting!");
      return;
    }
    const last4 = cleanNum.slice(-4);
    let cardType = 'Bank Card';
    if (cleanNum.startsWith('8600')) cardType = 'Uzcard';
    else if (cleanNum.startsWith('9860')) cardType = 'Humo';
    else if (cleanNum.startsWith('4')) cardType = 'Visa';
    else if (cleanNum.startsWith('5')) cardType = 'Mastercard';

    const newCard = {
      number: `${cleanNum.slice(0, 4)} •••• •••• ${last4}`,
      expiry: inputCardExpiry || '12/28',
      type: cardType
    };
    setLinkedCard(newCard);
    localStorage.setItem('barberhub_linked_card', JSON.stringify(newCard));
    setShowCardModal(false);
    setInputCardNumber('');
    setInputCardExpiry('');
    hapticFeedback.notification('success');
    showScheduleToast("Kartangiz muvaffaqiyatli ulandi! Avto-yechish faol ✓");
  };

  // 6. Kartani o'chirish / Obunani bekor qilish
  const handleRemoveCard = () => {
    if (window.confirm("Rostdan ham kartani o'chirmoqchimisiz? Avtomatik to'lov to'xtatiladi.")) {
      setLinkedCard(null);
      localStorage.removeItem('barberhub_linked_card');
      showScheduleToast("Karta o'chirildi.");
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm("Rostdan ham oylik avtomatik obunani bekor qilmoqchimisiz? Keyingi oydan pul yechilmaydi.")) {
      hapticFeedback.impact('medium');
      await cancelBarberSubscription(barberProfile.id);
      setLinkedCard(null);
      localStorage.removeItem('barberhub_linked_card');
      setBarberProfile(prev => ({ ...prev, subscription_status: 'cancelled' }));
      showScheduleToast("Obuna bekor qilindi. Avto-yechish to'xtatildi.");
    }
  };

  // 7. VIP Boost (Sun'iy reyting 5.0 va Katalog tepasiga chiqish)
  const handleActivateVip = async () => {
    const price = (platformSettings.vip_boost_price || 40000).toLocaleString();
    if (window.confirm(`TOP-1 ga chiqish & Reyting 5.0 ⭐ (VIP Boost) xizmatini faollashtirasizmi? Narxi: ${price} UZS/oy`)) {
      hapticFeedback.impact('heavy');

      // Optimistik yangilash: usta darhol VIP holatiga o'tadi va ma'lumotlar saqlanadi
      const vipData = {
        is_vip: true,
        rating: 5.0,
        custom_boosted_rating: 5.0
      };
      updateProfileData(vipData);

      // mockBarbers ro'yxatida ham 1-o'ringa ko'tarish
      const idx = mockBarbers.findIndex(b => b.id === barberProfile.id || b.name === barberProfile.name);
      if (idx !== -1) {
        mockBarbers[idx].is_vip = true;
        mockBarbers[idx].rating = 5.0;
        mockBarbers[idx].custom_boosted_rating = 5.0;
        const [vipB] = mockBarbers.splice(idx, 1);
        mockBarbers.unshift(vipB);
      }

      try {
        await activateVipBoost(barberProfile.id);
      } catch (err) {
        console.warn("VIP boost backend sync warning:", err);
      }

      hapticFeedback.notification('success');
      showScheduleToast("🚀 VIP Boost faollashtirildi! Profilingiz katalog tepasida 1-o'rinda va 5.0 reyting bilan ko'rinadi!");
    }
  };

  // 8. To'lov ilovalarini xavfsiz Telegram openLink va Universal havolalar orqali ochish (Click, Payme, Uzum Bank)
  // Hech qachon window.location.href yoki intent:// ishlatilmaydi (net::ERR_UNKNOWN_URL_SCHEME xatosi chiqmasligi uchun)
  const handleOpenPaymentApp = (type) => {
    let targetUrl = '';

    if (type === 'click') {
      targetUrl = platformSettings.click_url || 'https://my.click.uz/';
    } else if (type === 'payme') {
      targetUrl = platformSettings.payme_url || 'https://payme.uz/';
    } else if (type === 'uzum') {
      targetUrl = 'https://uzumbank.uz/';
    }

    openExternalUrl(targetUrl);
    setShowPaymentModal(false);
  };

  // Filterlangan buyurtmalar
  const filteredAppointments = appointments.filter((apt) => {
    if (filterTab === 'pending') return apt.status === 'pending';
    if (filterTab === 'accepted') return apt.status === 'accepted';
    if (filterTab === 'completed') return apt.status === 'completed';
    return true;
  });

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const todayRevenue = appointments
    .filter((a) => a.status === 'completed' || a.status === 'accepted')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 max-w-md mx-auto">
      {/* Toast bildirishnoma */}
      {scheduleSaveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white py-2.5 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in max-w-xs text-center border border-white/20">
          <span>{scheduleSaveToast}</span>
        </div>
      )}

      {/* 1. Usta Profil Kartasi (Avatar, Ish vaqti, Holat) */}
      <div className="pt-4 px-4 pb-1">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
          <div className="flex items-center space-x-3.5">
            {/* Avatar with change button */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              <img
                src={barberProfile.avatar}
                alt={barberProfile.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-blue/10 shadow-sm group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-orange text-brand-blue flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Barber info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base text-brand-blue truncate">
                  {barberProfile.name}
                </h2>
                <button
                  onClick={handleToggleWorkingToday}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1 transition-all shadow-2xs ${
                    barberProfile.isWorkingToday !== false
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                  }`}
                  title="Ish holatini o'zgartirish uchun bosing"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${barberProfile.isWorkingToday !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span>{barberProfile.isWorkingToday !== false ? (t.online_status || "Ishda") : (t.day_off_badge || "Dam olish")}</span>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                {getTranslatedRole(barberProfile.role, lang) || t.barber_role}
              </p>

              {/* Ish vaqti va Tushlik xulosasi */}
              <div className="mt-2 flex items-center space-x-1.5 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={() => setMainTab('schedule')}
                  className="inline-flex items-center space-x-1 bg-blue-50/80 hover:bg-blue-100 text-brand-blue px-2.5 py-0.5 rounded-xl text-[11px] font-bold transition-colors border border-blue-200/60"
                >
                  <Clock className="w-3 h-3 text-brand-orange" />
                  <span>{barberProfile.workHours?.start || "09:00"} — {barberProfile.workHours?.end || "22:00"}</span>
                </button>

                {barberProfile.breakTime?.enabled !== false && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-200">
                    <span>☕</span>
                    <span>{barberProfile.breakTime?.start || "13:00"}-{barberProfile.breakTime?.end || "14:00"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENT BO'LIMLARI */}

      {/* TAB 1: NAVBATLAR (Appointments Queue) */}
      {mainTab === 'appointments' && (
        <div className="animate-in fade-in space-y-3">
          {/* 3. Header & Appointments Title */}
          <div className="pt-2 px-4 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-brand-blue">
              {t.admin_title}
            </h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-xs text-gray-500 font-medium">
                {t.today_badge} — {appointments.length} {t.queue_count_label || (lang === 'ru' ? 'записей' : lang === 'en' ? 'bookings' : 'ta navbat')}
              </p>
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{lang === 'ru' ? 'Авто-синхронизация' : lang === 'en' ? 'Live sync' : 'Jonli efir'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenWalkInModal()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-orange text-brand-blue font-black text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all"
              title="Ko'chadan kelgan yoki telefon qilgan mijozni kiritish"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? '+ С улицы' : lang === 'en' ? '+ Walk-in' : '+ Jonli mijoz'}</span>
            </button>
          </div>
        </div>

        {/* 🔔 Yangi Navbat Bildirishnomasi (Real-time Pop Toast) */}
        {newBookingNotification && (
          <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-300 border border-emerald-400/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-brand-orange animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-300 block">
                  {lang === 'ru' ? '🔔 Новая запись от клиента!' : lang === 'en' ? '🔔 New Booking Alert!' : '🔔 Yangi mijoz navbatga yozildi!'}
                </span>
                <span className="text-xs font-black text-white">
                  {newBookingNotification.client_name || newBookingNotification.clientName} ({newBookingNotification.time_slot || newBookingNotification.time}) — {newBookingNotification.service_name || newBookingNotification.serviceName}
                </span>
              </div>
            </div>
            <button
              onClick={() => setNewBookingNotification(null)}
              className="text-white/80 hover:text-white px-2 py-1 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ☕ Tezkor Tanaffus (Quick Break) Banner */}
        {quickBreakUntil && quickBreakUntil > Date.now() ? (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Coffee className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-amber-950">
                    {lang === 'ru' ? '☕ Вы на перерыве' : lang === 'en' ? '☕ On a quick break' : '☕ Tezkor tanaffusdasiz'}
                  </span>
                  <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                    {Math.max(1, Math.ceil((quickBreakUntil - Date.now()) / 60000))} {lang === 'ru' ? 'мин осталось' : lang === 'en' ? 'min left' : 'daq qoldi'}
                  </span>
                </div>
                <p className="text-[10px] text-amber-900/80 mt-0.5">
                  {lang === 'ru' ? 'Клиенты не могут записаться на этот период' : lang === 'en' ? 'Clients cannot book during this interval' : 'Bu vaqtda mijozlar yangi navbat yozila olmaydi'}
                </p>
              </div>
            </div>
            <button
              onClick={handleEndQuickBreak}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'К работе' : lang === 'en' ? 'Resume' : 'Ishga qaytish'}</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 p-2.5 bg-white border border-blue-100/80 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
              <Coffee className="w-4 h-4 text-brand-orange" />
              <span>{lang === 'ru' ? 'Быстрый перерыв:' : lang === 'en' ? 'Quick break:' : 'Tezkor tanaffus:'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleStartQuickBreak(15)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold active:scale-95 transition-all"
                title="15 daqiqa tanaffus"
              >
                ☕ 15 {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : 'daq'}
              </button>
              <button
                onClick={() => handleStartQuickBreak(30)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold active:scale-95 transition-all"
                title="30 daqiqa tanaffus"
              >
                ☕ 30 {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : 'daq'}
              </button>
              <button
                onClick={() => handleStartQuickBreak(45)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold active:scale-95 transition-all"
                title="45 daqiqa tanaffus"
              >
                ☕ 45 {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : 'daq'}
              </button>
            </div>
          </div>
        )}

        {/* 📋 vs 📅 Jadval (Timeline / List View Switch) */}
        <div className="grid grid-cols-2 gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-blue-50 dark:border-slate-800 shadow-xs mt-3">
          <button
            onClick={() => { hapticFeedback.selection(); setAppointmentsViewMode('list'); }}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              appointmentsViewMode === 'list'
                ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? '📋 Список' : lang === 'en' ? '📋 List' : "📋 Ro'yxat"} ({filteredAppointments.length})</span>
          </button>
          <button
            onClick={() => { hapticFeedback.selection(); setAppointmentsViewMode('timeline'); }}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              appointmentsViewMode === 'timeline'
                ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? '📅 Временная шкала' : lang === 'en' ? '📅 Timeline' : "📅 Vaqt Jadvali (Timeline)"}</span>
          </button>
        </div>

        {/* Filter Tabs (Faqat Ro'yxat ko'rinishida) */}
        {appointmentsViewMode === 'list' && (
          <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 dark:bg-slate-800/80 p-1 rounded-xl mt-3 animate-in fade-in">
            <button
              onClick={() => setFilterTab('all')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.tab_all}
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'pending'
                  ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.tab_pending}
            </button>
            <button
              onClick={() => setFilterTab('accepted')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'accepted'
                  ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.tab_accepted}
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'completed'
                  ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.tab_completed}
            </button>
          </div>
        )}
        {/* Appointments List */}
        {reminderToast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white py-2.5 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in max-w-xs text-center border border-white/20">
            <BellRing className="w-4 h-4 text-brand-orange flex-shrink-0 animate-bounce" />
            <span>{reminderToast}</span>
          </div>
        )}

        {/* Auto Reminder Info Pill */}
        <div className="mt-2.5 p-2.5 bg-blue-50/80 dark:bg-slate-900/80 rounded-2xl border border-blue-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-brand-blue dark:text-slate-200 font-semibold">
          <div className="flex items-center space-x-1.5">
            <BellRing className="w-3.5 h-3.5 text-brand-orange dark:text-amber-400 flex-shrink-0" />
            <span>{t.auto_reminder_badge || "Avto-eslatma: 1 soat oldin (SMS + Telegram)"}</span>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Avto ON
          </span>
        </div>
      </div>

      {/* Appointments Content (Timeline vs List) */}
      {appointmentsViewMode === 'timeline' ? (
        <div className="px-4 mt-2 space-y-2.5 animate-in fade-in">
          <div className="p-3 bg-blue-50/70 dark:bg-slate-900/90 rounded-2xl border border-blue-100/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-blue dark:text-white mb-1 shadow-2xs">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-brand-orange dark:text-amber-400" />
              <span>{lang === 'ru' ? 'Ежедневный почасовой график' : lang === 'en' ? 'Daily hourly schedule' : 'Kunlik soatma-soat grafik'}</span>
            </span>
            <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
              {barberProfile.workHours?.start || "09:00"} - {barberProfile.workHours?.end || "22:00"}
            </span>
          </div>

          {generateTimelineSlots().map((slot, sIdx) => {
            if (slot.isLunch) {
              return (
                <div
                  key={`timeline-${sIdx}`}
                  className="flex items-stretch space-x-3 p-3 bg-amber-50/60 dark:bg-[#1C160C] rounded-2xl border border-dashed border-amber-300/80 dark:border-amber-500/40"
                >
                  <div className="w-14 flex flex-col items-center justify-center border-r border-amber-200/60 dark:border-amber-500/30 pr-2">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-400">{slot.time}</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-300">{lang === 'ru' ? '45 мин' : lang === 'en' ? '45 min' : '45 daq'}</span>
                  </div>
                  <div className="flex-1 flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{lang === 'ru' ? '🍽️ Обед / Время перерыва' : lang === 'en' ? '🍽️ Lunch / Break time' : '🍽️ Tushlik / Tanaffus vaqti'}</span>
                  </div>
                </div>
              );
            }

            if (slot.appointment) {
              const apt = slot.appointment;
              const clientName = apt.clientName || apt.client_name;
              const phone = apt.phone || apt.client_phone;
              const serviceName = apt.serviceName || apt.service_name;

              return (
                <div
                  key={`timeline-${sIdx}`}
                  className="flex items-stretch space-x-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs relative overflow-hidden"
                >
                  <div className="w-14 flex flex-col items-center justify-center border-r border-gray-100 dark:border-slate-800 pr-2">
                    <span className="text-xs font-black text-brand-blue dark:text-amber-400">{slot.time}</span>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-400">{lang === 'ru' ? 'Занято' : lang === 'en' ? 'Booked' : 'Band'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                        {clientName}
                      </h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        apt.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                          : apt.status === 'accepted'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-500/20'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                      }`}>
                        {apt.status === 'completed' ? (t.status_completed || 'Tugatildi') : apt.status === 'accepted' ? (t.status_accepted || 'Qabul qilingan') : (t.status_pending || 'Kutilmoqda')}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                      {getTranslatedServiceName(serviceName, lang)}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 dark:border-slate-800">
                      <span className="text-xs font-black text-brand-blue dark:text-white">
                        {(apt.price || 0).toLocaleString()} UZS
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {apt.status === 'accepted' && (
                          <button
                            type="button"
                            disabled={callingClientId === apt.id || apt.queue_status === 'ready_call'}
                            onClick={() => handleCallClient(apt.id)}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-600 dark:bg-blue-500 text-white flex items-center space-x-1 active:scale-95 shadow-xs"
                          >
                            <Radio className={`w-2.5 h-2.5 ${callingClientId === apt.id ? 'animate-spin' : ''}`} />
                            <span>{apt.queue_status === 'ready_call' ? (lang === 'ru' ? "Позвали ✂️" : lang === 'en' ? "Called ✂️" : "Chaqirildi ✂️") : (lang === 'ru' ? "Позвать 📢" : lang === 'en' ? "Call 📢" : "Chaqirish 📢")}</span>
                          </button>
                        )}
                        {apt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600 dark:bg-emerald-500 text-white active:scale-95 shadow-xs"
                          >
                            {lang === 'ru' ? 'Пришёл ✓' : lang === 'en' ? 'Arrived ✓' : 'Keldi ✓'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Empty Slot (Bo'sh vaqt)
            return (
              <div
                key={`timeline-${sIdx}`}
                className="flex items-center justify-between p-3 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-blue/40 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-14 text-center border-r border-gray-200 dark:border-slate-800 pr-2">
                    <span className="text-xs font-black text-gray-500 dark:text-slate-300">{slot.time}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{lang === 'ru' ? 'Свободно' : lang === 'en' ? 'Open' : "Bo'sh vaqt"}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenWalkInModal(slot.time)}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-brand-blue dark:text-slate-200 rounded-xl text-[11px] font-extrabold flex items-center space-x-1 transition-all active:scale-95 border border-blue-100 dark:border-slate-700 shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-brand-orange dark:text-amber-400" />
                  <span>{lang === 'ru' ? 'Записать' : lang === 'en' ? 'Book' : "Mijoz yozish"}</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Ro'yxat ko'rinishi */
        <div className="px-4 mt-2 space-y-3">
          {/* Skeleton Loaders if refreshing */}
          {isRefreshing && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 animate-pulse space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isRefreshing && filteredAppointments.map((apt) => {
          const clientName = apt.clientName || apt.client_name;
          const phone = apt.phone || apt.client_phone;
          const serviceName = apt.serviceName || apt.service_name;
          const time = apt.time || apt.time_slot;

          return (
            <div
              key={apt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-blue-50 dark:border-slate-800 relative overflow-hidden"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  apt.status === 'completed'
                    ? 'bg-emerald-500'
                    : apt.status === 'accepted'
                    ? 'bg-blue-500'
                    : apt.status === 'cancelled'
                    ? 'bg-red-400'
                    : 'bg-amber-400'
                }`}
              />

              <div className="flex items-start justify-between pl-1">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {clientName}
                    </h3>
                    {(apt.is_multi_person || apt.multi_person_details) && (
                      <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-brand-blue dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Users className="w-3 h-3 text-brand-orange dark:text-amber-400" />
                        <span>2 kishi</span>
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="text-xs text-brand-blue dark:text-amber-400 font-semibold hover:underline mt-0.5 inline-block"
                  >
                    {phone}
                  </a>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center space-x-1 text-xs font-black text-brand-orange dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
                    <Clock className="w-3 h-3" />
                    <span>{time}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 block mt-1">
                    {formatAppointmentDate(apt.date || apt.date_str, lang)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs pl-1">
                <div>
                  <span className="text-gray-600 dark:text-slate-300 font-medium truncate max-w-[200px] block">
                    {getTranslatedServiceName(serviceName, lang)}
                  </span>
                  {(apt.is_multi_person && apt.multi_person_details) && (
                    <span className="text-[10px] text-brand-orange dark:text-amber-400 font-bold block">
                      + {apt.multi_person_details.companion_title}: {apt.multi_person_details.companion_service} ({apt.multi_person_details.second_slot})
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-brand-blue dark:text-white">
                  {apt.price?.toLocaleString()} UZS
                </span>
              </div>

              {/* Status Actions */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between pl-1">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    apt.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      : apt.status === 'accepted'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                      : apt.status === 'cancelled'
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-500/20'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                  }`}
                >
                  {apt.status === 'completed'
                    ? t.status_completed
                    : apt.status === 'accepted'
                    ? t.status_accepted
                    : apt.status === 'cancelled'
                    ? t.status_cancelled
                    : t.status_pending}
                </span>

                <div className="flex items-center space-x-1.5">
                  {/* SMS + TG Reminder button */}
                  {(apt.status === 'accepted' || apt.status === 'pending') && (
                    <button
                      type="button"
                      disabled={reminderLoadingId === apt.id}
                      onClick={() => handleSendReminder(apt.id)}
                      className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
                        apt.reminder_sent
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                      }`}
                      title={lang === 'ru' ? 'Отправить SMS и Telegram напоминание' : lang === 'en' ? 'Send SMS and Telegram reminder' : "Mijozga SMS va Telegram eslatma jo'natish"}
                    >
                      <BellRing className={`w-3 h-3 ${reminderLoadingId === apt.id ? 'animate-spin' : 'text-amber-600 dark:text-amber-400'}`} />
                      <span>
                        {reminderLoadingId === apt.id
                          ? '...'
                          : apt.reminder_sent
                          ? (lang === 'ru' ? 'Отправлено' : lang === 'en' ? 'Sent' : (t.reminder_sent_badge ? "Eslatildi" : "Sent"))
                          : (t.btn_send_reminder || "🔔 Eslatma")}
                      </span>
                    </button>
                  )}

                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'accepted')}
                        className="px-3 py-1 bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold hover:bg-brand-blue-dark dark:hover:bg-amber-400 transition-all flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.btn_accept}</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {apt.status === 'accepted' && (
                    <>
                      {/* ⏳ Chaqirish (Call next client) button */}
                      <button
                        type="button"
                        disabled={callingClientId === apt.id || apt.queue_status === 'ready_call'}
                        onClick={() => handleCallClient(apt.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          apt.queue_status === 'ready_call'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:opacity-90 active:scale-95'
                        }`}
                        title={lang === 'ru' ? 'Вызвать клиента к креслу' : lang === 'en' ? 'Call client to barber chair' : "Mijozga navbati yetganini xabar qilish"}
                      >
                        <Radio className={`w-3 h-3 ${callingClientId === apt.id ? 'animate-spin' : ''}`} />
                        <span>
                          {apt.queue_status === 'ready_call' 
                            ? (t.btn_called_status || (lang === 'ru' ? 'Вызван ✂️' : lang === 'en' ? 'Called ✂️' : "Chaqirildi ✂️")) 
                            : (t.btn_call_client || (lang === 'ru' ? 'Вызвать 📢' : lang === 'en' ? 'Call client 📢' : "Chaqirish 📢"))}
                        </span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center space-x-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t.btn_arrived}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAppointments.length === 0 && !isRefreshing && (
          <div className="text-center py-10 bg-white rounded-3xl p-6 shadow-sm border border-blue-50">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">
              {t.no_appointments || "Hozircha navbatlar mavjud emas"}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  )}

      {/* TAB 2: ISH GRAFIGI VA VAQT (Schedule Management) */}
      {mainTab === 'schedule' && (
        <div className="px-4 mt-3 space-y-4 animate-in fade-in">
          {/* Bugun ish holati switch */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
                  {t.today_work_status_title || "Bugungi ish holati"}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t.today_work_status_desc || "Agar bugun ishga chiqolmasangiz, bitta tugma bilan dam olishni yoqing"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleWorkingToday}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs ${
                  barberProfile.isWorkingToday !== false
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${barberProfile.isWorkingToday !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{barberProfile.isWorkingToday !== false ? (t.status_working_btn || "Ishdaman 🟢") : (t.status_dayoff_btn || "Dam olish 🔴")}</span>
              </button>
            </div>
          </div>

          {/* Haftalik Ish Vaqti */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50 space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
              <Clock className="w-4 h-4 text-brand-orange" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-blue">
                  {t.daily_work_hours_title || "Kunlik ish vaqti"}
                </h3>
                <span className="text-[10px] text-gray-400 block">
                  {t.daily_work_hours_hint || "00:00 dan 23:59 gacha istalgan soat va minutni tanlang"}
                </span>
              </div>
            </div>

            <TimePickerField
              label={t.work_start_time || "Ish boshlanish vaqti"}
              value={tempWorkStart}
              onChange={setTempWorkStart}
              icon={<Clock className="w-3.5 h-3.5 text-brand-blue" />}
              lang={lang}
              t={t}
            />

            <TimePickerField
              label={t.work_end_time || "Ish tugash vaqti"}
              value={tempWorkEnd}
              onChange={setTempWorkEnd}
              icon={<Clock className="w-3.5 h-3.5 text-brand-blue" />}
              lang={lang}
              t={t}
            />

            {/* Tezkor ish vaqti shablonlari */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-gray-400 block mb-1.5">
                {t.quick_presets_label || "Tezkor shablonlar:"}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "09:00 - 22:00", s: "09:00", e: "22:00" },
                  { label: "08:00 - 20:00", s: "08:00", e: "20:00" },
                  { label: "10:00 - 23:00", s: "10:00", e: "23:00" },
                  { label: "07:00 - 19:00", s: "07:00", e: "19:00" },
                  { label: "12:00 - 00:00", s: "12:00", e: "00:00" },
                  { label: "00:00 - 23:59 (24/7)", s: "00:00", e: "23:59" },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTempWorkStart(preset.s);
                      setTempWorkEnd(preset.e);
                    }}
                    className="py-1.5 px-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 transition-colors text-center"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tushlik / Tanaffus vaqti */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-blue">
                    {t.lunch_break_title || "Tushlik / Tanaffus vaqti"}
                  </h3>
                  <span className="text-[10px] text-gray-400 block">
                    {t.lunch_break_hint || "Bu vaqtda mijozlar navbat ololmaydi"}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempBreakEnabled}
                  onChange={(e) => setTempBreakEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
              </label>
            </div>

            {tempBreakEnabled && (
              <div className="space-y-3 animate-in fade-in">
                <TimePickerField
                  label={t.lunch_start_time || "Tushlik boshlanishi"}
                  value={tempBreakStart}
                  onChange={setTempBreakStart}
                  icon={<Coffee className="w-3.5 h-3.5 text-amber-600" />}
                  lang={lang}
                  t={t}
                />

                <TimePickerField
                  label={t.lunch_end_time || "Tushlik tugashi"}
                  value={tempBreakEnd}
                  onChange={setTempBreakEnd}
                  icon={<Coffee className="w-3.5 h-3.5 text-amber-600" />}
                  lang={lang}
                  t={t}
                />

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    {t.quick_lunch_label || "Tezkor tushlik:"}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "13:00 - 14:00", s: "13:00", e: "14:00" },
                      { label: "12:30 - 13:30", s: "12:30", e: "13:30" },
                      { label: "14:00 - 15:00", s: "14:00", e: "15:00" },
                    ].map((bp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTempBreakStart(bp.s);
                          setTempBreakEnd(bp.e);
                        }}
                        className="py-1.5 px-1 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 rounded-xl text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-center transition-colors"
                      >
                        {bp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Haftalik Dam Olish Kunlari */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50 space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
              <CalendarDays className="w-4 h-4 text-brand-blue" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-blue">
                  {t.weekly_days_off_title || "Haftalik dam olish kunlari"}
                </h3>
                <span className="text-[10px] text-gray-400 block">
                  {t.weekly_days_off_hint || "Qaysi kunlarda ishlamasligingizni belgilang"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'].map((day) => {
                const isOff = tempDaysOff.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDayOff(day)}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                      isOff
                        ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <span>{getTranslatedDayName(day, lang)}</span>
                    <span className="block text-[8px] font-bold mt-0.5">
                      {isOff ? (t.day_off_pill || "Dam olish") : (t.work_day_pill || "Ish kuni")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saqlash tugmasi */}
          <button
            type="button"
            onClick={handleSaveWorkHours}
            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t.save_schedule_btn || "Grafik va Vaqtlarni Saqlash"}</span>
          </button>
        </div>
      )}

      {/* TAB 3: XIZMATLAR VA GALEREYA (Services & Salon Photos) */}
      {mainTab === 'services' && (
        <div className="px-4 mt-3 space-y-4 animate-in fade-in">
          {/* 4. Xizmatlar boshqaruvi (CRUD & Aksiya/Talabalar) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <Scissors className="w-4 h-4 text-brand-blue" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {t.my_services_title}
                </h3>
              </div>
              <button
              onClick={handleOpenAddService}
              className="text-xs font-extrabold text-brand-blue bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl flex items-center space-x-1 transition-colors border border-amber-200/60"
            >
              <Plus className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t.btn_new_service}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {servicesList.map((srv) => (
              <div
                key={srv.id}
                className="p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <h4 className="font-bold text-gray-900 text-xs">
                        {getTranslatedServiceName(srv.name, lang)}
                      </h4>
                      {srv.isPromo && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{getTranslatedPromoBadge(srv.promoBadge, lang) || (lang === 'ru' ? 'Акция' : lang === 'en' ? 'Offer' : 'Aksiya')}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {formatServiceDuration(srv.duration, lang)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditService(srv)}
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-brand-blue hover:border-brand-blue transition-colors"
                      title={t.btn_edit}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                      title={t.btn_delete}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {t.service_price_label || (lang === 'ru' ? 'Цена:' : lang === 'en' ? 'Price:' : 'Narxi:')}
                  </span>
                  <div className="text-right">
                    {srv.oldPrice && (
                      <span className="text-[10px] text-gray-400 line-through mr-1.5">
                        {srv.oldPrice.toLocaleString()} UZS
                      </span>
                    )}
                    <span className={`font-black ${srv.isPromo ? 'text-brand-orange' : 'text-brand-blue'}`}>
                      {srv.price.toLocaleString()} UZS
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleOpenAddService}
            className="w-full mt-3.5 py-3 rounded-2xl font-bold text-xs text-brand-blue bg-brand-orange hover:bg-brand-orange-hover transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.add_new_service}</span>
          </button>
        </div>

        {/* Sartaroshxona va Ishlar Galereyasi (Portfolio) */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5">
              <Camera className="w-4 h-4 text-brand-blue" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {t.salon_photos_title || "Sartaroshxona & Ishlar galereyasi"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSalonPhotoModal(true)}
              className="text-xs font-extrabold text-brand-blue bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl flex items-center space-x-1 transition-colors border border-amber-200/60"
            >
              <Plus className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t.add_salon_photo || (lang === 'ru' ? '+ Фото' : lang === 'en' ? '+ Photo' : '+ Rasm')}</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            {t.salon_photos_desc || (lang === 'ru' ? 'Клиенты увидят эти фотографии при посещении вашего профиля:' : lang === 'en' ? 'Clients will see these photos when visiting your profile:' : "Mijozlar profilingizga kirganda sizning ishlaringiz va sartaroshxona qulayliklarini ko'rishadi:")}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(barberProfile.salonPhotos || []).map((photoUrl, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-2xs">
                <img
                  src={photoUrl}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteSalonPhoto(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title={t.btn_delete || "O'chirish"}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowSalonPhotoModal(true)}
              className="border-2 border-dashed border-gray-200 hover:border-brand-blue/50 rounded-2xl aspect-square flex flex-col items-center justify-center text-gray-400 hover:text-brand-blue bg-gray-50/50 hover:bg-blue-50/30 transition-all"
            >
              <Plus className="w-5 h-5 text-brand-orange mb-1" />
              <span className="text-[10px] font-bold">
                {t.add_salon_photo || (lang === 'ru' ? 'Добавить фото' : lang === 'en' ? 'Add photo' : "Rasm qo'shish")}
              </span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* TAB 4: MOLIYA VA KASSA (Revenue, SaaS, Card, Account) */}
      {mainTab === 'finance' && (
        <div className="px-4 mt-3 space-y-4 animate-in fade-in">
          {/* Kunlik Kassa & Statistika */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {t.daily_cash_stats || (lang === 'ru' ? 'ЕЖЕДНЕВНАЯ КАССА И СТАТИСТИКА' : lang === 'en' ? 'DAILY CASH & STATISTICS' : 'Kunlik Kassa & Statistika')}
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {t.today_badge || (lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : 'Bugun')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-500 block">
                  {t.today_revenue_title || t.today_revenue || (lang === 'ru' ? 'Касса за сегодня' : lang === 'en' ? "Today's revenue" : 'Bugungi kassa')}
                </span>
                <span className="text-lg font-black text-emerald-700 block mt-0.5">
                  {todayRevenue.toLocaleString()} UZS
                </span>
                <span className="text-[9px] text-emerald-600 font-medium">
                  {t.accepted_and_completed || (lang === 'ru' ? 'Принято + Завершено' : lang === 'en' ? 'Accepted + Completed' : 'Qabul qilingan + Tugatilgan')}
                </span>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-500 block">
                  {t.total_clients_label || (lang === 'ru' ? 'Всего клиентов' : lang === 'en' ? 'Total clients' : 'Jami mijozlar')}
                </span>
                <span className="text-lg font-black text-brand-blue block mt-0.5">
                  {appointments.length} {t.clients_count_unit || (lang === 'ru' ? 'чел.' : lang === 'en' ? 'clients' : 'ta')}
                </span>
                <span className="text-[9px] text-gray-500 font-medium">
                  {t.all_bookings_today || (lang === 'ru' ? 'Все записи на сегодня' : lang === 'en' ? 'All bookings today' : 'Bugungi barcha navbatlar')}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-gray-600 font-medium">
                  {t.completed_services_count || (lang === 'ru' ? 'Завершенные услуги:' : lang === 'en' ? 'Completed services:' : 'Tugatilgan xizmatlar:')}
                </span>
              </div>
              <span className="font-extrabold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length} {t.services_count_unit || (lang === 'ru' ? 'услуг' : lang === 'en' ? 'services' : 'ta')}
              </span>
            </div>

            {/* Kunni yakunlash & Kassa Cheki tugmasi */}
            <button
              onClick={() => {
                hapticFeedback.impact('medium');
                setReceiptSentToTg(false);
                setShowDailyReceiptModal(true);
              }}
              className="mt-3.5 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-105 active:scale-98 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <Receipt className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'ru' ? 'Завершить день и Чек кассы 🧾' : lang === 'en' ? 'Close Day & POS Receipt 🧾' : 'Kunni yakunlash & Kassa Cheki 🧾'}</span>
            </button>
          </div>

          {/* 5. SaaS Obuna & 14 kunlik Sinov Davri */}
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold bg-brand-orange text-brand-blue px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>{t.trial_badge}</span>
              </span>
              <span className="text-xs font-bold text-amber-300">
                {t.trial_days_left}
              </span>
            </div>

            <h3 className="text-base font-extrabold">
              {t.pro_plan}
            </h3>
            <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
              {t.pro_features}
            </p>

            <div className="w-full bg-white/10 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-brand-orange h-full rounded-full" style={{ width: '78%' }}></div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-200 block text-[10px]">
                  {lang === 'ru' ? 'Ежемесячная оплата:' : lang === 'en' ? 'Monthly fee:' : "Oylik to'lov:"}
                </span>
                <span className="text-sm font-black text-brand-orange">
                  {(platformSettings.subscription_price || 50000).toLocaleString()} UZS / {t.per_month}
                </span>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                {t.renew_subscription}
              </button>
            </div>
          </div>

          {/* 6. Ulangan Bank Kartasi (Avtomatik to'lov) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-brand-blue" />
                <span>{t.linked_card_title}</span>
              </h3>
              {linkedCard && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.auto_debit_active}</span>
                </span>
              )}
            </div>

            {linkedCard ? (
              <div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-6 bg-amber-400 rounded-md opacity-80 shadow-inner"></div>
                    <span className="font-extrabold text-xs tracking-wider text-amber-400 uppercase">
                      {linkedCard.type}
                    </span>
                  </div>
                  <p className="font-mono text-base font-bold tracking-widest mt-4">
                    {linkedCard.number}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
                    <span>EXPIRES: {linkedCard.expiry}</span>
                    <span className="text-white font-semibold">AUTO-BILLING ON</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
                  {t.auto_debit_desc}
                </p>

                <div className="flex space-x-2 mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    {t.btn_change_card}
                  </button>
                  <button
                    onClick={handleRemoveCard}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    {t.btn_remove_card}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 bg-transparent dark:bg-red-950/30 hover:bg-red-50 dark:hover:bg-red-900/40 transition-all"
                    title={t.btn_cancel_subscription || "Oylik obunani bekor qilish"}
                  >
                    {t.btn_cancel_subscription || (lang === 'ru' ? 'Отменить подписку' : lang === 'en' ? 'Cancel subscription' : 'Obunani bekor qilish')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-3">
                  {t.no_card_linked}
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-dark transition-all"
                  >
                    {t.btn_link_card}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 7. 🚀 TOP-1 Reklama & Reyting 5.0 (VIP Boost) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-yellow-500/15 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/30 rounded-3xl p-5 shadow-sm border border-amber-300 dark:border-amber-500/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚀</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center space-x-1">
                    <span>{t.vip_title || (lang === 'ru' ? 'ТОП-1 Реклама & Рейтинг 5.0' : lang === 'en' ? 'TOP-1 Promo & 5.0 Rating' : 'TOP-1 Reklama & Reyting 5.0')}</span>
                    <span className="bg-amber-400 text-amber-950 text-[9px] px-1.5 py-0.2 rounded-full font-black">VIP</span>
                  </h3>
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                    {t.vip_subtitle || (lang === 'ru' ? '1-е место в каталоге и гарантия рейтинга 5.0' : lang === 'en' ? 'Top rank in catalog & full 5.0 rating' : "Katalogda eng yuqorida turish va to'liq 5.0 reyting")}
                  </span>
                </div>
              </div>
              {barberProfile.is_vip ? (
                <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                  {t.vip_active_badge || (lang === 'ru' ? 'АКТИВЕН ⭐' : lang === 'en' ? 'ACTIVE ⭐' : 'FAOL ⭐')}
                </span>
              ) : (
                <span className="text-[10px] bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-transparent dark:border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                  {(platformSettings.vip_boost_price || 40000).toLocaleString()} {t.per_month_unit || (lang === 'ru' ? 'сум/мес' : lang === 'en' ? 'UZS/mo' : 'UZS/oy')}
                </span>
              )}
            </div>

            <p className="text-[11px] text-amber-950 dark:text-amber-100 font-medium leading-relaxed mb-3.5">
              {barberProfile.is_vip
                ? (t.vip_active_desc || (lang === 'ru' ? 'Ваш профиль сейчас отображается на 1-м месте в каталоге с золотой короной и гарантированным рейтингом 5.0.' : lang === 'en' ? 'Your profile is currently displayed at #1 in the catalog with a golden crown and guaranteed 5.0 rating.' : "Sizning profilingiz hozir barcha mijozlarga eng birinchi bo'lib TOP-1 qatorda va oltin toj/VIP belgisi bilan 5.0 reytingda ko'rinmoqda."))
                : (t.vip_inactive_desc || (lang === 'ru' ? 'При включении VIP ваш профиль показывается выше всех мастеров в каталоге (на 1-м месте) и с гарантированным рейтингом 5.0. Это увеличивает поток клиентов в 3–5 раз!' : lang === 'en' ? 'Activating VIP puts your profile above all barbers in the catalog (1st place) with a guaranteed 5.0 rating. This increases client flow by 3–5x!' : "VIP xizmatini yoqsangiz, profilingiz katalogda boshqa barcha ustalardan yuqorida (1-o'rinda) va kafolatlangan 5.0 yulduzli reyting bilan ko'rsatiladi. Bu mijozlar oqimini 3-5 barobarga oshiradi!"))}
            </p>

            <button
              onClick={handleActivateVip}
              disabled={barberProfile.is_vip}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 shadow-md leading-normal ${
                barberProfile.is_vip
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 active:scale-98'
              }`}
            >
              <span>
                {barberProfile.is_vip 
                  ? (t.vip_active_btn || (lang === 'ru' ? 'VIP Boost активен (1-е место в каталоге)' : lang === 'en' ? 'VIP Boost Active (#1 in catalog)' : "VIP Boost Faol (Katalogda 1-o'rinda)")) 
                  : `${t.vip_activate_btn || (lang === 'ru' ? 'Активировать VIP Boost' : lang === 'en' ? 'Activate VIP Boost' : 'VIP Boostni faollashtirish')} (${(platformSettings.vip_boost_price || 40000).toLocaleString()} UZS)`
                }
              </span>
            </button>
          </div>

          {/* 7. Akkaunt va Xavfsizlik (Cloud Persistence, Logout, Delete Account) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-blue-50 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-blue dark:text-amber-400" />
                <span>{t.account_settings_title || "Akkaunt va Xavfsizlik"}</span>
              </h3>
              <span className="text-[10px] text-brand-blue dark:text-blue-300 font-extrabold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-blue-100 dark:border-blue-900/40">
                <Cloud className="w-3 h-3 text-brand-orange dark:text-amber-400" />
                <span>{t.cloud_saved_badge || "Bulutda saqlangan"}</span>
              </span>
            </div>

            {/* Telegram ID Protection Card */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-brand-blue dark:bg-slate-700 text-white dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-blue dark:text-white">
                    Telegram ID: <code>{barberProfile.telegram_id || "87654321"}</code>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {t.auto_restore_on || (lang === 'ru' ? 'Автовосстановление ВКЛ' : lang === 'en' ? 'Auto-restore ON' : 'Avto-tiklash ON')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.cloud_saved_desc || "Tarix tozalansa yoki botdan chiqib ketilsa ham sizning barcha ma'lumotlaringiz, izohlar va reyting saqlanib qoladi."}
                </p>
              </div>
            </div>

            {/* Actions: Logout & Delete Account */}
            <div className="space-y-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.btn_logout || "Hisobdan chiqish (Log Out)"}</span>
              </button>

              <button
                onClick={() => setShowDeleteAccountModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.btn_delete_account || "Akkauntni butunlay o'chirish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Fixed Bottom Navigation Bar (Usta uchun bir barmoq bilan qulay navigatsiya) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/70 px-3 py-2 z-40 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 text-center">
          <button
            type="button"
            onClick={() => {
              setMainTab('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
              mainTab === 'appointments'
                ? 'text-brand-blue font-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Calendar className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{t.admin_nav_queue || (lang === 'ru' ? 'Записи' : lang === 'en' ? 'Queue' : 'Navbat')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab('schedule');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
              mainTab === 'schedule'
                ? 'text-brand-blue font-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.admin_nav_schedule || (lang === 'ru' ? 'График' : lang === 'en' ? 'Schedule' : 'Grafik')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
              mainTab === 'services'
                ? 'text-brand-blue font-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Scissors className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.admin_nav_services || (lang === 'ru' ? 'Услуги' : lang === 'en' ? 'Services' : 'Xizmatlar')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab('finance');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
              mainTab === 'finance'
                ? 'text-brand-blue font-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.admin_nav_finance || (lang === 'ru' ? 'Касса' : lang === 'en' ? 'Cash' : 'Kassa')}</span>
          </button>
        </div>
      </div>

      {/* MODAL: Ish vaqtini belgilash */}
      {showWorkHoursModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-5 h-5 text-brand-orange" />
                <h3 className="text-base font-extrabold text-brand-blue dark:text-white">
                  {t.work_hours_title || "Ish vaqti sozlamalari"}
                </h3>
              </div>
              <button
                onClick={() => setShowWorkHoursModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
              Mijozlar navbat tanlayotganda faqat shu soatlar oralig'ida bo'sh vaqtlarni ko'rishadi:
            </p>

            <form onSubmit={handleSaveWorkHours} className="space-y-3.5">
              {/* Bugungi holat */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  {t.working_status_label || "Bugungi ish holati:"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempIsWorkingToday(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      tempIsWorkingToday
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🟢</span>
                    <span>{t.status_working || "Ishdaman"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempIsWorkingToday(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      !tempIsWorkingToday
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🔴</span>
                    <span>{t.status_day_off || "Bugun dam olish"}</span>
                  </button>
                </div>
              </div>

              {/* Haftalik dam olish kunlari */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-0.5">
                  {t.weekly_days_off || "Haftalik dam olish kunlari:"}
                </label>
                <p className="text-[10px] text-gray-400 dark:text-slate-400 mb-2">
                  {t.days_off_desc || "Belgilangan kunlarda mijozlar navbat ololmaydi"}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {[
                    { key: "Dush", label: "Du" },
                    { key: "Sesh", label: "Se" },
                    { key: "Chor", label: "Ch" },
                    { key: "Pay", label: "Pa" },
                    { key: "Juma", label: "Ju" },
                    { key: "Shan", label: "Sh" },
                    { key: "Yak", label: "Ya" },
                  ].map(day => {
                    const isOff = tempDaysOff.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => handleToggleDayOff(day.key)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                          isOff
                            ? 'bg-red-500 text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {tempDaysOff.length > 0 && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    Dam olish: {tempDaysOff.join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <TimePickerField
                  label={t.work_start_label || "Boshlanish vaqti"}
                  value={tempWorkStart}
                  onChange={setTempWorkStart}
                  icon={<Clock className="w-3.5 h-3.5 text-brand-blue" />}
                  lang={lang}
                  t={t}
                />

                <TimePickerField
                  label={t.work_end_label || "Tugash vaqti"}
                  value={tempWorkEnd}
                  onChange={setTempWorkEnd}
                  icon={<Clock className="w-3.5 h-3.5 text-brand-blue" />}
                  lang={lang}
                  t={t}
                />
              </div>

              {/* Tushlik / Tanaffus vaqti */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <label className="text-xs font-semibold text-gray-700">
                      {t.break_time_title || "Tushlik / Tanaffus vaqti"}
                    </label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempBreakEnabled}
                      onChange={(e) => setTempBreakEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-orange"></div>
                  </label>
                </div>

                {tempBreakEnabled && (
                  <div className="space-y-2 bg-amber-500/10 dark:bg-amber-500/10 p-2.5 rounded-2xl border border-amber-200/70 dark:border-amber-500/30 animate-in fade-in">
                    <TimePickerField
                      label={t.break_start_label || "Tushlik boshlanishi"}
                      value={tempBreakStart}
                      onChange={setTempBreakStart}
                      icon={<Coffee className="w-3.5 h-3.5 text-amber-600" />}
                      lang={lang}
                      t={t}
                    />

                    <TimePickerField
                      label={t.break_end_label || "Tushlik tugashi"}
                      value={tempBreakEnd}
                      onChange={setTempBreakEnd}
                      icon={<Coffee className="w-3.5 h-3.5 text-amber-600" />}
                      lang={lang}
                      t={t}
                    />
                  </div>
                )}
              </div>

              {/* Quick presets */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                  {t.quick_presets_label || (lang === 'ru' ? 'Быстрый выбор:' : lang === 'en' ? 'Quick presets:' : 'Tezkor tanlov:')}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "09:00 - 22:00", s: "09:00", e: "22:00" },
                    { label: "08:00 - 20:00", s: "08:00", e: "20:00" },
                    { label: "10:00 - 23:00", s: "10:00", e: "23:00" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTempWorkStart(preset.s);
                        setTempWorkEnd(preset.e);
                      }}
                      className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWorkHoursModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md"
                >
                  {t.save_work_hours || "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Profil rasmini o'zgartirish (Avatar) */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Camera className="w-5 h-5 text-brand-blue dark:text-blue-400" />
                <h3 className="text-base font-extrabold text-brand-blue dark:text-white">
                  {t.profile_photo_title || "Profil rasmi"}
                </h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current preview */}
            <div className="text-center my-3">
              <img
                src={tempAvatar}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-brand-blue/20 shadow-md"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {lang === 'ru' ? 'Превью нового фото' : lang === 'en' ? 'New photo preview' : "Yangi rasm ko'rinishi"}
              </span>
            </div>

            {/* Upload file from device */}
            <input
              type="file"
              ref={avatarFileInputRef}
              accept="image/*"
              onChange={handleAvatarFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-brand-blue rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 border border-blue-200/70 mb-3"
            >
              <Upload className="w-4 h-4" />
              <span>{t.upload_from_device || "Telefondan rasm yuklash"}</span>
            </button>

            {/* Or choose from preset avatars */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-gray-500 block mb-2">
                {t.or_choose_avatar || "Yoki tayyor rasmlardan birini tanlang"}:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_PRESETS.map((pUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setTempAvatar(pUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer ring-2 transition-all ${
                      tempAvatar === pUrl ? 'ring-brand-orange scale-95 shadow-md' : 'ring-transparent hover:ring-gray-200'
                    }`}
                  >
                    <img src={pUrl} alt="Preset" className="w-full h-full object-cover" />
                    {tempAvatar === pUrl && (
                      <div className="absolute inset-0 bg-brand-orange/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-brand-blue stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 mt-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                {t.btn_cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md"
              >
                {t.btn_save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Sartaroshxona rasmini qo'shish */}
      {showSalonPhotoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <ImageIcon className="w-5 h-5 text-brand-blue dark:text-blue-400" />
                <h3 className="text-base font-extrabold text-brand-blue dark:text-white">
                  {t.upload_photo_modal_title || "Sartaroshxona rasmini qo'shish"}
                </h3>
              </div>
              <button
                onClick={() => setShowSalonPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Preview if selected */}
            {tempSalonPhotoUrl && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-gray-100 border border-gray-200">
                <img
                  src={tempSalonPhotoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setTempSalonPhotoUrl('')}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* File input from device */}
            <input
              type="file"
              ref={salonFileInputRef}
              accept="image/*"
              onChange={handleSalonPhotoFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => salonFileInputRef.current?.click()}
              className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-brand-blue rounded-2xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 border border-amber-200/80 mb-3 shadow-2xs"
            >
              <Upload className="w-4 h-4 text-brand-orange" />
              <span>{t.choose_file || "Telefondan rasm tanlash (Galereya / Kamera)"}</span>
            </button>

            <div className="flex space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSalonPhotoModal(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                {t.btn_cancel}
              </button>
              <button
                type="button"
                disabled={!tempSalonPhotoUrl}
                onClick={handleAddSalonPhoto}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all shadow-md ${
                  tempSalonPhotoUrl
                    ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-blue'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t.btn_save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview for single photo in Admin */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        >
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Salon Full"
              className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* MODAL 1: Xizmat qo'shish / tahrirlash */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <h3 className="text-base font-extrabold text-brand-blue dark:text-white mb-3">
              {editingServiceId ? t.modal_edit_service_title : t.modal_add_service_title}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  {t.modal_service_name} *
                </label>
                <input
                  type="text"
                  required
                  value={formServiceName}
                  onChange={(e) => setFormServiceName(e.target.value)}
                  placeholder={t.modal_service_name_placeholder}
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  {t.modal_service_price} *
                </label>
                <input
                  type="number"
                  required
                  value={formServicePrice}
                  onChange={(e) => setFormServicePrice(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue font-bold text-brand-blue dark:text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  {t.service_duration_label || "Davomiyligi (daq)"} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    required
                    value={formServiceDuration ? String(formServiceDuration).replace(/\D/g, '') : ''}
                    onChange={(e) => setFormServiceDuration(e.target.value)}
                    placeholder="Masalan: 40"
                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5 pr-14 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue font-bold text-brand-blue dark:text-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-400 pointer-events-none">
                    {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : 'daq'}
                  </span>
                </div>
                {/* Tezkor tavsiyalar */}
                <div className="flex items-center space-x-1.5 mt-1.5 overflow-x-auto no-scrollbar">
                  {[20, 30, 40, 50, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormServiceDuration(String(mins))}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        String(formServiceDuration).replace(/\D/g, '') === String(mins)
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {mins} {lang === 'ru' ? 'мин' : lang === 'en' ? 'min' : 'daq'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 dark:bg-slate-800/80 rounded-2xl border border-amber-200/70 dark:border-amber-500/30">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPromo}
                    onChange={(e) => setFormIsPromo(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-400">
                    {t.is_promo_label}
                  </span>
                </label>

                {formIsPromo && (
                  <div className="mt-2.5 space-y-2 pt-2 border-t border-amber-200/50 dark:border-amber-500/30">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-300 mb-0.5">
                        {t.promo_old_price_label}
                      </label>
                      <input
                        type="number"
                        value={formOldPrice}
                        onChange={(e) => setFormOldPrice(e.target.value)}
                        placeholder="60000"
                        className="w-full bg-white dark:bg-slate-900 rounded-xl p-2 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-300 mb-0.5">
                        {t.promo_badge_label}
                      </label>
                      <input
                        type="text"
                        value={formPromoBadge}
                        onChange={(e) => setFormPromoBadge(e.target.value)}
                        placeholder={t.promo_badge_placeholder}
                        className="w-full bg-white dark:bg-slate-900 rounded-xl p-2 text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md"
                >
                  {t.btn_save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bank kartasini ulash (Uzcard / Humo / Visa / Mastercard) */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <h3 className="text-base font-extrabold text-brand-blue dark:text-white mb-1">
              {t.card_modal_title || "Bank kartasini ulash"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
              {t.auto_debit_desc || "Oylik obunani avtomatik to'lash uchun kartangizni ulang."}
            </p>

            {/* Qo'llab-quvvatlanadigan kartalar */}
            <div className="flex items-center space-x-1.5 mb-3.5 flex-wrap gap-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                Uzcard (8600)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-amber-950/40 text-orange-800 dark:text-amber-300 border border-orange-200 dark:border-amber-800/40">
                Humo (9860)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                Visa (4...)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                Mastercard (5...)
              </span>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  {t.card_number_label} (16 ta raqam) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={inputCardNumber}
                  onChange={(e) => setInputCardNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="8600... / 9860... / 4... / 5..."
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5 text-xs font-mono tracking-wider text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  {t.card_expiry_label} (OO/YY) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={inputCardExpiry}
                  onChange={(e) => setInputCardExpiry(e.target.value)}
                  placeholder="12/28"
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5 text-xs font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center space-x-1.5 border border-emerald-100 dark:border-emerald-800/40">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {lang === 'ru' ? 'Ваша карта надежно зашифрована' : lang === 'en' ? 'Your card is securely encrypted' : 'Kartangiz xavfsiz shifrlangan holda saqlanadi'}
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md"
                >
                  {t.btn_save_card}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Kengaytirilgan To'lov tizimlari (Click, Payme, Uzum, Bank kartasi) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-brand-blue dark:text-white">
                {t.payment_methods_title}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-2 p-2.5 bg-blue-50/70 dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-brand-blue dark:text-slate-300 font-semibold">
                {lang === 'ru' ? 'Стоимость подписки:' : lang === 'en' ? 'Monthly subscription:' : 'Oylik obuna narxi:'}
              </span>
              <span className="text-sm font-black text-brand-orange dark:text-amber-400">
                {(platformSettings.subscription_price || 50000).toLocaleString()} UZS
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 mt-1">
              {linkedCard && (
                <button
                  onClick={() => {
                    alert(`Avtomatik to'lov muvaffaqiyatli amalga oshirildi! ${linkedCard.number} dan ${(platformSettings.subscription_price || 50000).toLocaleString()} UZS yechildi.`);
                    setShowPaymentModal(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-gray-900 dark:bg-slate-800 text-white flex items-center justify-between text-xs font-bold shadow-sm border border-transparent dark:border-slate-700"
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>{linkedCard.type} ({linkedCard.number.slice(-4)})</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-extrabold">
                    {lang === 'ru' ? 'В один клик' : lang === 'en' ? '1-Click' : 'Bitta bosishda'}
                  </span>
                </button>
              )}

              {/* To'g'ridan-to'g'ri karta o'tkazmasi (P2P) */}
              {platformSettings.payment_card && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'ru' ? 'Перевод на карту платформы:' : lang === 'en' ? 'Transfer to platform card:' : "Platforma kartasiga o'tkazish:"}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(platformSettings.payment_card.replace(/\s+/g, ''));
                        alert(`Karta raqami nusxalandi: ${platformSettings.payment_card}`);
                      }}
                      className="text-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold px-2.5 py-1 rounded-full transition-all border border-slate-300/60 dark:border-slate-700"
                    >
                      {lang === 'ru' ? 'Копировать 📋' : lang === 'en' ? 'Copy 📋' : 'Nusxalash 📋'}
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white tracking-wider">
                    {platformSettings.payment_card}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Istalgan ilovadan (Click, Payme, Uzum, Bank ilovasi) o'tkazishingiz mumkin.
                  </p>
                  {platformSettings.support_telegram && (
                    <a
                      href={`https://t.me/${platformSettings.support_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2.5 block text-center py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition-all shadow-xs"
                    >
                      Chekni adminga yuborish ({platformSettings.support_telegram}) &rarr;
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={() => handleOpenPaymentApp('click')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-between text-xs font-bold transition-all shadow-2xs active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow-xs">C</span>
                  <span className="font-extrabold">{t.pay_with_click}</span>
                </div>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-black">{(platformSettings.subscription_price || 50000).toLocaleString()} UZS</span>
              </button>

              <button
                onClick={() => handleOpenPaymentApp('payme')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-between text-xs font-bold transition-all shadow-2xs active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#00CCCC] text-slate-950 flex items-center justify-center text-[11px] font-black shadow-xs">P</span>
                  <span className="font-extrabold">{t.pay_with_payme}</span>
                </div>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-black">{(platformSettings.subscription_price || 50000).toLocaleString()} UZS</span>
              </button>

              <button
                onClick={() => handleOpenPaymentApp('uzum')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-between text-xs font-bold transition-all shadow-2xs active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#7000FF] text-white flex items-center justify-center text-[11px] font-black shadow-xs">U</span>
                  <span className="font-extrabold">{t.pay_with_uzum}</span>
                </div>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-black">{(platformSettings.subscription_price || 50000).toLocaleString()} UZS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hisobdan chiqish (Log Out) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-brand-blue dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-brand-blue dark:text-white text-center mb-1">
              {t.logout_modal_title || "Hisobdan chiqish"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 text-center mb-5 leading-relaxed">
              {t.logout_modal_desc || "Hisobdan chiqsangiz ham barcha xizmatlaringiz, mijozlar va reytingingiz saqlanadi."}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                {t.btn_cancel}
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md"
              >
                {t.btn_logout || "Chiqish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Akkauntni butunlay o'chirish (Delete Account) */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border-2 border-red-200 dark:border-red-900/50 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-red-600 dark:text-red-400 text-center mb-1">
              {t.delete_modal_title || "Akkauntni butunlay o'chirish"}
            </h3>
            <div className="p-3 bg-red-50/70 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/40 my-3 text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
              {t.delete_modal_warning || "DIQQAT! Akkauntingizni o'chirsangiz, siz umumiy usta katalogidan o'chirilasiz. Barcha mijozlar, izohlar va reytingingiz qayta tiklanmaydi!"}
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                {t.btn_cancel}
              </button>
              <button
                onClick={async () => {
                  setShowDeleteAccountModal(false);
                  if (onDeleteAccount) await onDeleteAccount();
                }}
                className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md"
              >
                {t.confirm_delete_btn || "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 1: 🚶‍♂️ Jonli Mijoz (Walk-in / Offline Client) */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-amber-950/50 text-brand-orange dark:text-amber-400 flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    {lang === 'ru' ? 'Запись клиента с улицы 🚶‍♂️' : lang === 'en' ? 'Walk-in Client Entry 🚶‍♂️' : 'Jonli mijoz kiritish 🚶‍♂️'}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400">
                    {lang === 'ru' ? 'Клиент без предварительной записи' : lang === 'en' ? 'Client without prior booking' : "Ko'chadan kirgan yoki telefon qilgan mijoz"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitWalkIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase mb-1">
                  {lang === 'ru' ? 'Имя клиента' : lang === 'en' ? 'Client Name' : 'Mijoz ismi'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'ru' ? 'Например: Рустам' : lang === 'en' ? 'E.g. Rustam' : 'Masalan: Rustam'}
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Telefon raqami (ixtiyoriy)
                </label>
                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Xizmat turi
                </label>
                <select
                  value={walkInServiceId}
                  onChange={(e) => {
                    setWalkInServiceId(e.target.value);
                    const s = servicesList.find(item => item.id === e.target.value);
                    if (s) setWalkInPrice(s.price);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-brand-blue bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  {servicesList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.price.toLocaleString()} UZS
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Narxi (UZS)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={walkInPrice}
                    onChange={(e) => setWalkInPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Vaqt
                  </label>
                  <input
                    type="text"
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-brand-blue"
                    placeholder="14:30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase mb-1">
                  To'lov usuli
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInPaymentType('cash')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                      walkInPaymentType === 'cash'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    <span>💵 Naqd pul</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInPaymentType('card')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                      walkInPaymentType === 'card'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-brand-blue dark:text-blue-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    <span>💳 Karta / Click</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  {t.btn_cancel || (lang === 'ru' ? 'Отмена' : lang === 'en' ? 'Cancel' : 'Bekor qilish')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black rounded-xl bg-brand-blue hover:bg-brand-blue-dark dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 shadow-md active:scale-95 transition-all"
                >
                  {lang === 'ru' ? 'Внести в кассу ✓' : lang === 'en' ? 'Add to Cash ✓' : "Kassaga qo'shish ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 🧾 Kun Yakunida "Kassa Cheki" (Daily Revenue Receipt) */}
      {showDailyReceiptModal && (() => {
        const completedApts = appointments.filter(a => a.status === 'completed');
        const pendingApts = appointments.filter(a => a.status === 'pending');
        const cancelledApts = appointments.filter(a => a.status === 'cancelled');
        const cashTotal = completedApts
          .filter(a => a.paymentType === 'cash' || !a.paymentType)
          .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        const cardTotal = completedApts
          .filter(a => a.paymentType === 'card')
          .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        const netTotal = cashTotal + cardTotal;
        const now = new Date();
        const dateStr = now.toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[92vh] overflow-y-auto border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-1.5 text-xs font-black text-gray-800 dark:text-white">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ru' ? 'ИТОГОВЫЙ КАССОВЫЙ ЧЕК' : lang === 'en' ? 'END OF DAY RECEIPT' : 'KUN YAKUNI KASSA CHEKI'}</span>
                </div>
                <button
                  onClick={() => setShowDailyReceiptModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thermal POS Receipt Design */}
              <div className="mt-3 p-4 bg-gray-50/90 dark:bg-slate-800/90 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 font-mono text-[11px] space-y-2.5">
                <div className="text-center pb-2 border-b border-dashed border-gray-300 dark:border-slate-700">
                  <div className="font-extrabold text-sm tracking-wider text-gray-900 dark:text-white">
                    BARBERHUB POS
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    {barberProfile.name || "Sardor Karimov"}
                  </div>
                  <div className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {dateStr} | {timeStr}
                  </div>
                </div>

                {/* Operations Summary */}
                <div className="space-y-1 py-1 border-b border-dashed border-gray-300 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Всего клиентов:' : lang === 'en' ? 'Total clients:' : 'Jami mijozlar:'}</span>
                    <span className="font-bold text-gray-800 dark:text-slate-200">{appointments.length} {t.clients_count_unit || 'ta'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Обслужено:' : lang === 'en' ? 'Served:' : "Xizmat ko'rsatilgan:"}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedApts.length} {t.clients_count_unit || 'ta'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Ожидают:' : lang === 'en' ? 'Pending:' : 'Kutilmoqda:'}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{pendingApts.length} {t.clients_count_unit || 'ta'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Отменено:' : lang === 'en' ? 'Cancelled:' : 'Bekor qilingan:'}</span>
                    <span className="font-bold text-red-500 dark:text-red-400">{cancelledApts.length} {t.clients_count_unit || 'ta'}</span>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-1.5 py-1 border-b border-dashed border-gray-300 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Выручка наличными:' : lang === 'en' ? 'Cash revenue:' : 'Naqd pul tushumi:'}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cashTotal.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Выручка по карте:' : lang === 'en' ? 'Card revenue:' : 'Karta / Click tushumi:'}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cardTotal.toLocaleString()} UZS</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-1 flex justify-between items-baseline text-xs font-black">
                  <span className="text-gray-900 dark:text-white">{lang === 'ru' ? 'ИТОГО КАССА:' : lang === 'en' ? 'TOTAL REVENUE:' : 'JAMI KASSA:'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm">{netTotal.toLocaleString()} UZS</span>
                </div>

                <div className="text-center pt-2 text-[9px] text-gray-400 dark:text-slate-500">
                  {lang === 'ru' ? '*** ДЕНЬ УСПЕШНО ЗАВЕРШЁН ***' : lang === 'en' ? '*** DAY SUCCESSFULLY CLOSED ***' : '*** KUN MUVAFFAQIYATLI YAKUNLANDI ***'}
                </div>
              </div>

              {receiptSentToTg && (
                <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{lang === 'ru' ? 'Кассовый чек отправлен в Telegram! ✓' : lang === 'en' ? 'Receipt sent to your Telegram! ✓' : 'Kassa cheki Telegramingizga yuborildi! ✓'}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      hapticFeedback.selection();
                      window.print();
                    }}
                    className="py-2.5 px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400" />
                    <span>{lang === 'ru' ? 'Печать' : lang === 'en' ? 'Print' : 'Chop etish'}</span>
                  </button>
                  <button
                    onClick={() => {
                      hapticFeedback.notification('success');
                      setReceiptSentToTg(true);
                    }}
                    className="py-2.5 px-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-200" />
                    <span>{lang === 'ru' ? 'В Telegram 📲' : lang === 'en' ? 'To Telegram 📲' : 'Telegramga 📲'}</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowDailyReceiptModal(false)}
                  className="w-full py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  {lang === 'ru' ? 'Закрыть' : lang === 'en' ? 'Close' : 'Yopish'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 3: 📢 1-Bosishda Mijozni Chaqirish Pop-up Alert */}
      {calledClientAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
              <Radio className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-brand-blue dark:text-white mb-1">
              {lang === 'ru' ? 'Клиент успешно вызван! 📢' : lang === 'en' ? 'Client Alert Sent! 📢' : 'Mijozga Tezkor Xabar Yuborildi! 📢'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 font-medium">
              {lang === 'ru' ? 'Клиенту отправлено голосовое и текстовое уведомление в Telegram о том, что его очередь подошла.' : lang === 'en' ? 'Client received a notification in Telegram that their turn has arrived.' : 'Telegram bot orqali mijozga navbati yetgani haqida ovozli va matnli bildirishnoma yetkazildi.'}
            </p>

            <div className="p-3 bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700 text-left text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Клиент:' : lang === 'en' ? 'Client:' : 'Mijoz:'}</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{calledClientAlert.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{lang === 'ru' ? 'Время:' : lang === 'en' ? 'Time:' : 'Vaqt:'}</span>
                <span className="font-bold text-brand-orange">{calledClientAlert.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{t.service_label || (lang === 'ru' ? 'Услуга:' : lang === 'en' ? 'Service:' : 'Xizmat:')}</span>
                <span className="font-medium text-gray-700 dark:text-slate-300">{getTranslatedServiceName(calledClientAlert.service, lang)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                hapticFeedback.impact('light');
                setCalledClientAlert(null);
              }}
              className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-black shadow-md active:scale-95 transition-all"
            >
              {lang === 'ru' ? 'Понятно ✓' : lang === 'en' ? 'Got it ✓' : 'Tushunarli ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

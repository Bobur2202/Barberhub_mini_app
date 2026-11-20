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
  Users
} from 'lucide-react';
import { getAdminAppointments, updateAppointmentStatus, updateBarberSchedule, sendAppointmentReminder, callClientToChair } from '../services/api';
import { getTranslatedServiceName, formatServiceDuration } from '../data/serviceTranslations';
import { mockBarbers } from '../data/mockBarbers';

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

  // Modal for Logout & Delete Account
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

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
    e.preventDefault();
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

  // To'lov usullari modali
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const barberDisplayName = barberProfile.name || "Sardor Karimov";

  // Backenddan buyurtmalarni yangilash
  const loadAppointments = async () => {
    setIsRefreshing(true);
    const backendData = await getAdminAppointments();
    if (backendData && backendData.length > 0) {
      setAppointments(backendData);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadAppointments();
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
    try {
      await callClientToChair(id);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, queue_status: 'ready_call' } : item))
      );
      setReminderToast("Mijozga 'Navbatingiz tayyor, kiring!' xabari yetkazildi! 📢");
      setTimeout(() => setReminderToast(''), 4000);
    } catch (err) {
      console.warn("Mijozni chaqirishda xatolik:", err);
    } finally {
      setCallingClientId(null);
    }
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
    setFormServiceDuration('40 daq');
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
    setFormServiceDuration(service.duration || '40 daq');
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

    if (editingServiceId) {
      setServicesList(prev => prev.map(s => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            name: formServiceName,
            price: Number(formServicePrice),
            duration: formServiceDuration,
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
        duration: formServiceDuration,
        isPromo: formIsPromo,
        oldPrice: formIsPromo && formOldPrice ? Number(formOldPrice) : null,
        promoBadge: formIsPromo ? formPromoBadge : null
      };
      setServicesList(prev => [...prev, newService]);
    }

    setShowServiceModal(false);
  };

  // 5. Kartani saqlash
  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!inputCardNumber || inputCardNumber.length < 16) {
      alert("Iltimos, 16 xonali karta raqamini to'liq kiriting!");
      return;
    }
    const last4 = inputCardNumber.slice(-4);
    const cardType = inputCardNumber.startsWith('9860') ? 'Humo' : 'Uzcard';
    const newCard = {
      number: `${inputCardNumber.slice(0, 4)} •••• •••• ${last4}`,
      expiry: inputCardExpiry || '12/28',
      type: cardType
    };
    setLinkedCard(newCard);
    localStorage.setItem('barberhub_linked_card', JSON.stringify(newCard));
    setShowCardModal(false);
    setInputCardNumber('');
    setInputCardExpiry('');
  };

  // 6. Kartani o'chirish
  const handleRemoveCard = () => {
    if (window.confirm("Rostdan ham kartani o'chirmoqchimisiz? Avtomatik to'lov to'xtatiladi.")) {
      setLinkedCard(null);
      localStorage.removeItem('barberhub_linked_card');
    }
  };

  // Filterlangan buyurtmalar
  const filteredAppointments = appointments.filter((apt) => {
    if (filterTab === 'pending') return apt.status === 'pending';
    if (filterTab === 'accepted') return apt.status === 'accepted';
    if (filterTab === 'completed') return apt.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-28 max-w-md mx-auto">
      {/* 1. Usta Profil Kartasi (Avatar, Ish vaqti, Manzil) */}
      <div className="pt-4 px-4 pb-2">
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
                {barberProfile.role || "Erkaklar sartaroshi"}
              </p>

              {/* Ish vaqti va Dam olish kunlari tugmasi */}
              <div className="mt-2 flex items-center justify-between flex-wrap gap-1.5">
                <button
                  onClick={() => setShowWorkHoursModal(true)}
                  className="inline-flex items-center space-x-1.5 bg-blue-50/80 hover:bg-blue-100 text-brand-blue px-2.5 py-1 rounded-xl text-xs font-bold transition-colors border border-blue-200/60"
                >
                  <Clock className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{barberProfile.workHours?.start || "09:00"} — {barberProfile.workHours?.end || "22:00"}</span>
                  <Edit2 className="w-2.5 h-2.5 text-gray-400 ml-1" />
                </button>

                {barberProfile.breakTime?.enabled !== false && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    <span>☕</span>
                    <span>{barberProfile.breakTime?.start || "13:00"}-{barberProfile.breakTime?.end || "14:00"}</span>
                  </span>
                )}

                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="text-[11px] font-bold text-gray-500 hover:text-brand-blue transition-colors ml-auto"
                >
                  {t.change_avatar_btn || "Rasmni almashtirish"}
                </button>
              </div>

              {/* Dam olish holati xabarnomasi */}
              {barberProfile.isWorkingToday === false && (
                <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-1.5 text-[11px] font-bold text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>Bugun dam olish kuni belgilangan (Mijozlar bugunga yozila olmaydi)</span>
                </div>
              )}

              {barberProfile.daysOff && barberProfile.daysOff.length > 0 && barberProfile.isWorkingToday !== false && (
                <div className="mt-2 text-[10px] text-gray-500 flex items-center space-x-1">
                  <span>Haftalik dam olish:</span>
                  <span className="font-bold text-brand-orange bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    {barberProfile.daysOff.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kassa & Statistika (Analytics & Revenue) */}
      <div className="px-4 mt-2">
        <div className="bg-gradient-to-br from-brand-blue via-brand-blue to-[#002f57] text-white rounded-3xl p-4 shadow-md border border-white/10">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-brand-orange flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-100">
                  {t.analytics_title || "Kassa va Statistika"}
                </h3>
                <span className="text-[10px] text-blue-200 block">Real vaqt hisob-kitobi</span>
              </div>
            </div>
            <span className="text-[9px] font-extrabold bg-white/20 text-blue-100 px-2 py-0.5 rounded-full">
              Bugun
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Bugungi Kassa */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-blue-200 block font-medium">
                  {t.today_revenue || "Bugungi kassa"}
                </span>
                <span className="text-lg font-black text-amber-300 block mt-0.5">
                  {(appointments
                    .filter(a => a.status === 'completed' || a.status === 'accepted')
                    .reduce((sum, a) => sum + (Number(a.price) || 0), 0)
                  ).toLocaleString()} <span className="text-[10px] font-bold text-white/90">UZS</span>
                </span>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-emerald-300 font-bold flex items-center space-x-1">
                  <span>✓</span>
                  <span>{appointments.filter(a => a.status === 'completed' || a.status === 'accepted').length} ta mijoz</span>
                </span>
              </div>
            </div>

            {/* Bu oylik tushum */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-blue-200 block font-medium">
                  {t.month_revenue || "Bu oylik tushum"}
                </span>
                <span className="text-lg font-black text-white block mt-0.5">
                  {(appointments
                    .filter(a => a.status === 'completed' || a.status === 'accepted')
                    .reduce((sum, a) => sum + (Number(a.price) || 0), 0) + 4800000
                  ).toLocaleString()} <span className="text-[10px] font-bold text-white/80">UZS</span>
                </span>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-blue-200 font-medium">
                  {appointments.length + 42} jami qabul
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sartaroshxona rasmlari (Salon Photos Gallery) */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-brand-blue" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {t.salon_photos_title || "Sartaroshxona rasmlari"}
              </h3>
              <span className="text-[11px] font-bold text-gray-400">
                ({barberProfile.salonPhotos?.length || 0})
              </span>
            </div>

            <button
              onClick={() => {
                setTempSalonPhotoUrl('');
                setShowSalonPhotoModal(true);
              }}
              className="text-xs font-extrabold text-brand-blue bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl flex items-center space-x-1 transition-colors border border-amber-200/60"
            >
              <Plus className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t.add_salon_photo || "+ Rasm qo'shish"}</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            {t.salon_photos_desc || "Mijozlar profilingizga kirganida ushbu rasmlarni ko'rishadi"}
          </p>

          {barberProfile.salonPhotos && barberProfile.salonPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 overflow-x-auto pb-1">
              {barberProfile.salonPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border border-blue-50"
                >
                  <img
                    src={photo}
                    alt={`Salon ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="w-7 h-7 rounded-full bg-white/90 text-gray-800 flex items-center justify-center shadow-md hover:bg-white"
                      title="Kattalashtirish"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSalonPhoto(idx)}
                      className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-2">
                {t.no_salon_photos_admin || "Hozircha birorta ham rasm yuklanmagan"}
              </p>
              <button
                onClick={() => setShowSalonPhotoModal(true)}
                className="px-3 py-1.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-dark transition-colors"
              >
                {t.add_salon_photo || "+ Rasm qo'shish"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Header & Appointments Title */}
      <div className="pt-3 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-brand-blue">
              {t.admin_title}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {t.today_badge} — {appointments.length} ta navbat
            </p>
          </div>
          <button
            onClick={loadAppointments}
            className={`p-2 rounded-full bg-white shadow-sm text-brand-blue hover:bg-gray-100 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title={t.refresh_tooltip}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 p-1 rounded-xl mt-3">
          <button
            onClick={() => setFilterTab('all')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tab_all}
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'pending'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tab_pending}
          </button>
          <button
            onClick={() => setFilterTab('accepted')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'accepted'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tab_accepted}
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'completed'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.tab_completed}
          </button>
        </div>
        {/* Appointments List */}
        {reminderToast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white py-2.5 px-4 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in max-w-xs text-center border border-white/20">
            <BellRing className="w-4 h-4 text-brand-orange flex-shrink-0 animate-bounce" />
            <span>{reminderToast}</span>
          </div>
        )}

        {/* Auto Reminder Info Pill */}
        <div className="mt-2.5 p-2.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center justify-between text-[11px] text-brand-blue font-semibold">
          <div className="flex items-center space-x-1.5">
            <BellRing className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            <span>{t.auto_reminder_badge || "Avto-eslatma: 1 soat oldin (SMS + Telegram)"}</span>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Avto ON
          </span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-4 mt-2 space-y-3">
        {filteredAppointments.map((apt) => {
          const clientName = apt.clientName || apt.client_name;
          const phone = apt.phone || apt.client_phone;
          const serviceName = apt.serviceName || apt.service_name;
          const time = apt.time || apt.time_slot;

          return (
            <div
              key={apt.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 relative overflow-hidden"
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
                    <h3 className="font-extrabold text-sm text-gray-900">
                      {clientName}
                    </h3>
                    {(apt.is_multi_person || apt.multi_person_details) && (
                      <span className="text-[10px] font-black bg-blue-100 text-brand-blue border border-blue-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Users className="w-3 h-3 text-brand-orange" />
                        <span>2 kishi</span>
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="text-xs text-brand-blue font-semibold hover:underline mt-0.5 inline-block"
                  >
                    {phone}
                  </a>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center space-x-1 text-xs font-black text-brand-orange bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Clock className="w-3 h-3" />
                    <span>{time}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    {apt.date || apt.date_str}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs pl-1">
                <div>
                  <span className="text-gray-600 font-medium truncate max-w-[200px] block">
                    {getTranslatedServiceName(serviceName, lang)}
                  </span>
                  {(apt.is_multi_person && apt.multi_person_details) && (
                    <span className="text-[10px] text-brand-orange font-bold block">
                      + {apt.multi_person_details.companion_title}: {apt.multi_person_details.companion_service} ({apt.multi_person_details.second_slot})
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-brand-blue">
                  {apt.price?.toLocaleString()} UZS
                </span>
              </div>

              {/* Status Actions */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between pl-1">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    apt.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : apt.status === 'accepted'
                      ? 'bg-blue-50 text-blue-700'
                      : apt.status === 'cancelled'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700'
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
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Mijozga SMS va Telegram eslatma jo'natish"
                    >
                      <BellRing className={`w-3 h-3 ${reminderLoadingId === apt.id ? 'animate-spin' : 'text-amber-600'}`} />
                      <span>
                        {reminderLoadingId === apt.id
                          ? '...'
                          : apt.reminder_sent
                          ? (t.reminder_sent_badge ? "Eslatildi" : "Sent")
                          : (t.btn_send_reminder || "🔔 Eslatma")}
                      </span>
                    </button>
                  )}

                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'accepted')}
                        className="px-3 py-1 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-dark transition-all flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.btn_accept}</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                        className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
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
                        title="Mijozga navbati yetganini xabar qilish"
                      >
                        <Radio className={`w-3 h-3 ${callingClientId === apt.id ? 'animate-spin' : ''}`} />
                        <span>{apt.queue_status === 'ready_call' ? "Chaqirildi ✂️" : "Chaqirish 📢"}</span>
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

        {filteredAppointments.length === 0 && (
          <div className="text-center py-10 bg-white rounded-3xl p-6 shadow-sm border border-blue-50">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">
              {t.no_appointments}
            </p>
          </div>
        )}
      </div>

      {/* 4. Xizmatlar boshqaruvi (CRUD & Aksiya/Talabalar) */}
      <div className="px-4 mt-6">
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
                          <span>{srv.promoBadge || 'Aksiya'}</span>
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
                  <span className="text-[10px] text-gray-400 font-medium">Narxi:</span>
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
      </div>

      {/* 5. SaaS Obuna & 14 kunlik Sinov Davri */}
      <div className="px-4 mt-6 space-y-4">
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
              <span className="text-xs text-blue-200 block text-[10px]">Oylik to'lov:</span>
              <span className="text-sm font-black text-brand-orange">
                50,000 UZS / {t.per_month}
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

              <div className="flex space-x-2 mt-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowCardModal(true)}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {t.btn_change_card}
                </button>
                <button
                  onClick={handleRemoveCard}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                >
                  {t.btn_remove_card}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-3">
                {t.no_card_linked}
              </p>
              <button
                onClick={() => setShowCardModal(true)}
                className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-dark transition-all"
              >
                {t.btn_link_card}
              </button>
            </div>
          )}
        </div>

        {/* 7. Akkaunt va Xavfsizlik (Cloud Persistence, Logout, Delete Account) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              <span>{t.account_settings_title || "Akkaunt va Xavfsizlik"}</span>
            </h3>
            <span className="text-[10px] text-brand-blue font-extrabold bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-blue-100">
              <Cloud className="w-3 h-3 text-brand-orange" />
              <span>{t.cloud_saved_badge || "Bulutda saqlangan"}</span>
            </span>
          </div>

          {/* Telegram ID Protection Card */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-blue">
                  Telegram ID: <code>{barberProfile.telegram_id || "87654321"}</code>
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Avto-tiklash ON
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                {t.cloud_saved_desc || "Tarix tozalansa yoki botdan chiqib ketilsa ham sizning barcha ma'lumotlaringiz, izohlar va reyting saqlanib qoladi."}
              </p>
            </div>
          </div>

          {/* Actions: Logout & Delete Account */}
          <div className="space-y-2 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.btn_logout || "Hisobdan chiqish (Log Out)"}</span>
            </button>

            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.btn_delete_account || "Akkauntni butunlay o'chirish"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Ish vaqtini belgilash */}
      {showWorkHoursModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-5 h-5 text-brand-orange" />
                <h3 className="text-base font-extrabold text-brand-blue">
                  {t.work_hours_title || "Ish vaqti sozlamalari"}
                </h3>
              </div>
              <button
                onClick={() => setShowWorkHoursModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Mijozlar navbat tanlayotganda faqat shu soatlar oralig'ida bo'sh vaqtlarni ko'rishadi:
            </p>

            <form onSubmit={handleSaveWorkHours} className="space-y-3.5">
              {/* Bugungi holat */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.working_status_label || "Bugungi ish holati:"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempIsWorkingToday(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      tempIsWorkingToday
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>🔴</span>
                    <span>{t.status_day_off || "Bugun dam olish"}</span>
                  </button>
                </div>
              </div>

              {/* Haftalik dam olish kunlari */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                  {t.weekly_days_off || "Haftalik dam olish kunlari:"}
                </label>
                <p className="text-[10px] text-gray-400 mb-2">
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
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.work_start_label || "Boshlanish vaqti"}
                  </label>
                  <select
                    value={tempWorkStart}
                    onChange={(e) => setTempWorkStart(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-brand-blue focus:outline-none focus:border-brand-blue"
                  >
                    {["07:00", "08:00", "08:30", "09:00", "09:30", "10:00", "11:00"].map((tStr) => (
                      <option key={tStr} value={tStr}>{tStr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.work_end_label || "Tugash vaqti"}
                  </label>
                  <select
                    value={tempWorkEnd}
                    onChange={(e) => setTempWorkEnd(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-brand-blue focus:outline-none focus:border-brand-blue"
                  >
                    {["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"].map((tStr) => (
                      <option key={tStr} value={tStr}>{tStr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tushlik / Tanaffus vaqti */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">☕</span>
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
                  <div className="grid grid-cols-2 gap-2.5 bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/70 animate-in fade-in">
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-600 mb-1">
                        {t.break_start_label || "Boshlanishi"}
                      </span>
                      <select
                        value={tempBreakStart}
                        onChange={(e) => setTempBreakStart(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-brand-blue"
                      >
                        {["12:00", "12:30", "13:00", "13:30", "14:00", "15:00"].map(tStr => (
                          <option key={tStr} value={tStr}>{tStr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold text-gray-600 mb-1">
                        {t.break_end_label || "Tugashi"}
                      </span>
                      <select
                        value={tempBreakEnd}
                        onChange={(e) => setTempBreakEnd(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-brand-blue"
                      >
                        {["13:00", "13:30", "14:00", "14:30", "15:00", "16:00"].map(tStr => (
                          <option key={tStr} value={tStr}>{tStr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick presets */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">Tezkor tanlov:</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-1.5">
                <Camera className="w-5 h-5 text-brand-blue" />
                <h3 className="text-base font-extrabold text-brand-blue">
                  {t.profile_photo_title || "Profil rasmi"}
                </h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
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
              <span className="text-[11px] text-gray-400 mt-1 block">Yangi rasm ko'rinishi</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-1.5">
                <ImageIcon className="w-5 h-5 text-brand-blue" />
                <h3 className="text-base font-extrabold text-brand-blue">
                  {t.upload_photo_modal_title || "Sartaroshxona rasmini qo'shish"}
                </h3>
              </div>
              <button
                onClick={() => setShowSalonPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
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

            {/* URL input */}
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                {t.paste_image_url || "Yoki rasm URL havolasini kiriting"}:
              </label>
              <input
                type="url"
                value={tempSalonPhotoUrl.startsWith('data:') ? '' : tempSalonPhotoUrl}
                onChange={(e) => setTempSalonPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                Yoki tayyor go'zal salon rasmlaridan tanlang:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SALON_PRESETS.map((pUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setTempSalonPhotoUrl(pUrl)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer ring-1 ring-gray-200 hover:ring-brand-orange transition-all group"
                  >
                    <img src={pUrl} alt="Preset" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {tempSalonPhotoUrl === pUrl && (
                      <div className="absolute inset-0 bg-brand-orange/40 flex items-center justify-center">
                        <Check className="w-5 h-5 text-brand-blue stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-brand-blue mb-3">
              {editingServiceId ? t.modal_edit_service_title : t.modal_add_service_title}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.modal_service_name} *
                </label>
                <input
                  type="text"
                  required
                  value={formServiceName}
                  onChange={(e) => setFormServiceName(e.target.value)}
                  placeholder={t.modal_service_name_placeholder}
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.modal_service_price} *
                </label>
                <input
                  type="number"
                  required
                  value={formServicePrice}
                  onChange={(e) => setFormServicePrice(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue font-bold text-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.service_duration_label}
                </label>
                <select
                  value={formServiceDuration}
                  onChange={(e) => setFormServiceDuration(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                >
                  <option value="20 daq">20 daq</option>
                  <option value="30 daq">30 daq</option>
                  <option value="40 daq">40 daq</option>
                  <option value="50 daq">50 daq</option>
                  <option value="60 daq">60 daq</option>
                  <option value="90 daq">90 daq</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPromo}
                    onChange={(e) => setFormIsPromo(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-xs font-bold text-amber-900">
                    {t.is_promo_label}
                  </span>
                </label>

                {formIsPromo && (
                  <div className="mt-2.5 space-y-2 pt-2 border-t border-amber-200/50">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        {t.promo_old_price_label}
                      </label>
                      <input
                        type="number"
                        value={formOldPrice}
                        onChange={(e) => setFormOldPrice(e.target.value)}
                        placeholder="60000"
                        className="w-full bg-white rounded-xl p-2 text-xs text-gray-800 border border-gray-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        {t.promo_badge_label}
                      </label>
                      <input
                        type="text"
                        value={formPromoBadge}
                        onChange={(e) => setFormPromoBadge(e.target.value)}
                        placeholder={t.promo_badge_placeholder}
                        className="w-full bg-white rounded-xl p-2 text-xs text-gray-800 border border-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
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

      {/* MODAL 2: Bank kartasini ulash (Uzcard / Humo) */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-extrabold text-brand-blue mb-1">
              {t.card_modal_title}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {t.auto_debit_desc}
            </p>

            <form onSubmit={handleSaveCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.card_number_label} *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={inputCardNumber}
                  onChange={(e) => setInputCardNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="8600 0000 0000 0000"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs font-mono tracking-wider text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.card_expiry_label} (OO/YY) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={inputCardExpiry}
                  onChange={(e) => setInputCardExpiry(e.target.value)}
                  placeholder="12/28"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs font-mono text-gray-900 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] flex items-center space-x-1.5 border border-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Kartangiz xavfsiz shifrlangan holda saqlanadi</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
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

      {/* MODAL 3: Kengaytirilgan To'lov tizimlari (Payme, Click, Uzum, Paynet, Stars) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <h3 className="font-extrabold text-base text-brand-blue">
                {t.payment_methods_title}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 my-3">
              Obunani faollashtirish uchun o'zingizga qulay to'lov usulini tanlang:
            </p>

            <div className="space-y-2 overflow-y-auto flex-1">
              {linkedCard && (
                <button
                  onClick={() => {
                    alert(`Avtomatik to'lov muvaffaqiyatli amalga oshirildi! ${linkedCard.number} dan 50,000 UZS yechildi.`);
                    setShowPaymentModal(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-gray-900 text-white flex items-center justify-between text-xs font-bold shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>{linkedCard.type} ({linkedCard.number.slice(-4)})</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-extrabold">
                    Bitta bosishda
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  alert("Uzum Bank to'lov sahifasiga yo'naltirilmoqda...");
                  setShowPaymentModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">U</span>
                  <span>{t.pay_with_uzum}</span>
                </div>
                <span className="text-[11px] text-purple-700 font-extrabold">50,000 UZS</span>
              </button>

              <button
                onClick={() => {
                  alert("Payme to'lov sahifasiga yo'naltirilmoqda...");
                  setShowPaymentModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-black">P</span>
                  <span>{t.pay_with_payme}</span>
                </div>
                <span className="text-[11px] text-teal-700 font-extrabold">50,000 UZS</span>
              </button>

              <button
                onClick={() => {
                  alert("Click Up to'lov sahifasiga yo'naltirilmoqda...");
                  setShowPaymentModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">C</span>
                  <span>{t.pay_with_click}</span>
                </div>
                <span className="text-[11px] text-blue-700 font-extrabold">50,000 UZS</span>
              </button>

              <button
                onClick={() => {
                  alert("Paynet to'loviga yo'naltirilmoqda...");
                  setShowPaymentModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-900 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-black">P</span>
                  <span>{t.pay_with_paynet}</span>
                </div>
                <span className="text-[11px] text-green-700 font-extrabold">50,000 UZS</span>
              </button>

              <button
                onClick={() => {
                  alert("Telegram Stars orqali to'lov oynasi ochilmoqda... (⭐️ 250 Stars)");
                  setShowPaymentModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{t.pay_with_stars}</span>
                </div>
                <span className="text-[11px] text-amber-700 font-extrabold">⭐️ 250</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hisobdan chiqish (Log Out) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-brand-blue text-center mb-1">
              {t.logout_modal_title || "Hisobdan chiqish"}
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
              {t.logout_modal_desc || "Hisobdan chiqsangiz ham barcha xizmatlaringiz, mijozlar va reytingingiz saqlanadi."}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
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
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border-2 border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-red-600 text-center mb-1">
              {t.delete_modal_title || "Akkauntni butunlay o'chirish"}
            </h3>
            <div className="p-3 bg-red-50/70 rounded-2xl border border-red-100 my-3 text-[11px] text-red-700 leading-relaxed">
              {t.delete_modal_warning || "DIQQAT! Akkauntingizni o'chirsangiz, siz umumiy usta katalogidan o'chirilasiz. Barcha mijozlar, izohlar va reytingingiz qayta tiklanmaydi!"}
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
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
    </div>
  );
}

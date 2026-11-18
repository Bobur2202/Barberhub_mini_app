import React, { useState, useEffect } from 'react';
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
  Star
} from 'lucide-react';
import { getAdminAppointments, updateAppointmentStatus } from '../services/api';
import { getTranslatedServiceName, formatServiceDuration } from '../data/serviceTranslations';

export default function AdminDashboardScreen({ t, currentBarber, lang = 'uz' }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed'

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
  const barberDisplayName = currentBarber?.name || "Sardor Karimov";

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
      // Tahrirlash
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
      // Yangi qo'shish
      const newService = {
        id: String(Date.now()),
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
      {/* Header */}
      <div className="pt-4 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-brand-blue">
              {t.admin_title}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {t.today_badge} — {barberDisplayName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAppointments}
              className={`p-1.5 rounded-full bg-white shadow-sm text-brand-blue hover:bg-gray-100 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title={t.refresh_tooltip}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>{t.online_status}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 p-1 rounded-xl mt-4">
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
      </div>

      {/* Appointments List */}
      <div className="px-4 mt-3 space-y-3">
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
              {/* Left Border Line */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  apt.status === 'completed'
                    ? 'bg-emerald-500'
                    : apt.status === 'accepted'
                    ? 'bg-brand-blue'
                    : apt.status === 'cancelled'
                    ? 'bg-red-400'
                    : 'bg-amber-400'
                }`}
              />

              {/* Top row: Time badge & Client name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-brand-blue font-extrabold text-xs">
                    {time}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {clientName}
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {apt.price.toLocaleString()} UZS
                </span>
              </div>

              {/* Service info */}
              <p className="text-xs text-gray-500 mt-2">
                ✂️ {getTranslatedServiceName(serviceName, lang)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                📞 {phone}
              </p>

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                {apt.status === 'pending' && (
                  <div className="flex space-x-2 w-full">
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'accepted')}
                      className="flex-1 py-2 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.btn_accept}</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                      className="flex-1 py-2 rounded-xl border border-red-500 text-red-500 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95 hover:bg-red-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.btn_reject}</span>
                    </button>
                  </div>
                )}

                {apt.status === 'accepted' && (
                  <div className="flex space-x-2 w-full">
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'completed')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.btn_arrived}</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                      className="px-4 py-2 rounded-xl border border-red-400 text-red-500 font-bold text-xs flex items-center justify-center active:scale-95"
                    >
                      {t.btn_reject}
                    </button>
                  </div>
                )}

                {apt.status === 'completed' && (
                  <div className="w-full flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t.client_arrived_success}</span>
                    </div>
                    <span>+ {apt.price.toLocaleString()} UZS</span>
                  </div>
                )}

                {apt.status === 'cancelled' && (
                  <div className="w-full text-center text-xs text-red-500 bg-red-50 py-1.5 rounded-xl font-bold">
                    {t.client_cancelled_badge}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-blue-50">
            <p className="text-gray-400 text-xs">{t.no_appointments}</p>
          </div>
        )}
      </div>

      {/* 2. Xizmatlarni boshqarish (CRUD & Aksiya/Talaba tariflari) */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {t.my_services_title}
              </h3>
              <span className="text-[10px] text-gray-400">
                {servicesList.length} ta xizmat faol
              </span>
            </div>
            <button
              onClick={handleOpenAddService}
              className="text-xs font-bold text-brand-blue flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t.btn_new_service}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {servicesList.map((srv) => (
              <div
                key={srv.id}
                className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="font-bold text-gray-900 text-xs">
                        {getTranslatedServiceName(srv.name, lang)}
                      </span>
                      {srv.isPromo && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Tag className="w-2.5 h-2.5 text-brand-orange" />
                          <span>{srv.promoBadge || "Aksiya"}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      ⏱ {formatServiceDuration(srv.duration, lang)}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
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

                {/* Price row */}
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

      {/* 3. SaaS Obuna & 14 kunlik Sinov Davri */}
      <div className="px-4 mt-6 space-y-4">
        {/* Trial / Subscription Card */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          {/* Trial Ribbon */}
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

          {/* Progress bar (14 kundan 11 kun qoldi) */}
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

        {/* 4. Ulangan Bank Kartasi (Avtomatik to'lov) */}
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
              {/* Card visual chip */}
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
      </div>

      {/* MODAL 1: Xizmat qo'shish / tahrirlash (Aksiya va Talaba tariflari bilan) */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-brand-blue mb-3">
              {editingServiceId ? t.modal_edit_service_title : t.modal_add_service_title}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              {/* Nomi */}
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

              {/* Narxi */}
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

              {/* Davomiyligi */}
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

              {/* Aksiya / Chegirma Toggle */}
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

              {/* Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-brand-blue bg-brand-orange hover:bg-brand-orange-hover"
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
              Avtomatik oylik obuna to'lovi uchun karta ma'lumotlarini kiriting
            </p>

            <form onSubmit={handleSaveCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.card_number_label} *
                </label>
                <input
                  type="text"
                  required
                  maxLength="16"
                  value={inputCardNumber}
                  onChange={(e) => setInputCardNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="8600 0000 0000 0000"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 font-mono tracking-widest focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.card_expiry_label} *
                </label>
                <input
                  type="text"
                  required
                  maxLength="5"
                  value={inputCardExpiry}
                  onChange={(e) => setInputCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 font-mono focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="p-2.5 bg-blue-50 rounded-xl flex items-center space-x-2 text-[11px] text-brand-blue font-medium">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>To'lovlar 3D-Secure shifrlangan xavfsizlik bilan himoyalangan</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-dark"
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
              {/* 1. Ulangan karta */}
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

              {/* 2. Uzum Bank */}
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

              {/* 3. Payme */}
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

              {/* 4. Click Up */}
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

              {/* 5. Paynet */}
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

              {/* 6. Telegram Stars */}
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
    </div>
  );
}

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
  RefreshCw
} from 'lucide-react';
import { getAdminAppointments, updateAppointmentStatus } from '../services/api';

export default function AdminDashboardScreen({ t, currentBarber }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed'

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
      date: '17-Noyabr',
      date_str: '17-Noyabr',
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
      date: '17-Noyabr',
      date_str: '17-Noyabr',
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
      date: '17-Noyabr',
      date_str: '17-Noyabr',
      status: 'completed',
    },
  ]);

  const [servicesList, setServicesList] = useState([
    { id: '1', name: 'Soch kesish va turmaklash', price: 60000, duration: '40 daq' },
    { id: '2', name: 'Soch va soqol parvarishi', price: 90000, duration: '60 daq' },
    { id: '3', name: 'Talabalar uchun (Chegirma)', price: 50000, duration: '40 daq' },
  ]);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Barber ismi
  const barberDisplayName = currentBarber?.name || "Sardor Karimov";

  // Backenddan buyurtmalarni yuklash
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

  // Status changers (Frontend + Backend)
  const handleUpdateStatus = async (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    await updateAppointmentStatus(id, newStatus);
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    setServicesList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newServiceName,
        price: Number(newServicePrice),
        duration: '45 daq',
      },
    ]);
    setNewServiceName('');
    setNewServicePrice('');
    setShowAddServiceModal(false);
  };

  // Filtered
  const filteredAppointments = appointments.filter((apt) => {
    if (filterTab === 'pending') return apt.status === 'pending';
    if (filterTab === 'accepted') return apt.status === 'accepted';
    if (filterTab === 'completed') return apt.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-24 max-w-md mx-auto">
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
                ✂️ {serviceName}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                📞 {phone}
              </p>

              {/* Action Buttons depending on status */}
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

      {/* SaaS: Subscription & Pricing Settings Section */}
      <div className="px-4 mt-6 space-y-4">
        {/* Subscription Status Card */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider block">
                {t.subscription_title}
              </span>
              <h3 className="text-sm font-extrabold mt-0.5">
                {t.pro_plan}
              </h3>
              <p className="text-[11px] text-blue-100/80 mt-1">
                {t.pro_features}
              </p>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-5 h-5 text-brand-orange" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-orange">
              50,000 UZS / {t.per_month}
            </span>
            <button
              onClick={() => alert(t.payment_redirect_notice)}
              className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-brand-blue font-bold text-xs rounded-xl shadow transition-all active:scale-95"
            >
              {t.renew_subscription}
            </button>
          </div>
        </div>

        {/* Services & Pricing Management */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t.my_services_title}
            </h3>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="text-xs font-bold text-brand-blue flex items-center space-x-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t.btn_new_service}</span>
            </button>
          </div>

          <div className="space-y-2">
            {servicesList.map((srv) => (
              <div
                key={srv.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 text-xs"
              >
                <div>
                  <span className="font-bold text-gray-800 block">{srv.name}</span>
                  <span className="text-[10px] text-gray-400">{srv.duration}</span>
                </div>
                <span className="font-extrabold text-brand-blue">
                  {srv.price.toLocaleString()} UZS
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddServiceModal(true)}
            className="w-full mt-3 py-2.5 rounded-xl font-bold text-xs text-brand-blue bg-brand-orange hover:bg-brand-orange-hover transition-all flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>{t.add_new_service}</span>
          </button>
        </div>
      </div>

      {/* Add New Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-brand-blue mb-3">
              {t.modal_add_service_title}
            </h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.modal_service_name}
                </label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder={t.modal_service_name_placeholder}
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.modal_service_price}
                </label>
                <input
                  type="number"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="30000"
                  className="w-full bg-gray-50 rounded-xl p-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Scissors, Calendar } from 'lucide-react';
import { translations } from './i18n/translations';
import { mockBarbers } from './data/mockBarbers';
import { getBarberByTelegramId, deleteBarberAccount } from './services/api';
import HeaderBar from './components/HeaderBar';
import SplashScreen from './pages/SplashScreen';
import RoleSelectionScreen from './pages/RoleSelectionScreen';
import BarberRegisterScreen from './pages/BarberRegisterScreen';
import CatalogScreen from './pages/CatalogScreen';
import BarberProfileScreen from './pages/BarberProfileScreen';
import DateTimeScreen from './pages/DateTimeScreen';
import ConfirmScreen from './pages/ConfirmScreen';
import AdminDashboardScreen from './pages/AdminDashboardScreen';
import ClientAppointmentsScreen from './pages/ClientAppointmentsScreen';

export default function App() {
  // Application State
  const [lang, setLang] = useState('uz');
  
  // Rolni saqlash: 'client' | 'barber' | null
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('barberhub_user_role') || null;
  });

  // Ekran qadamlari: 'splash' | 'role_select' | 'barber_register' | 'catalog' | 'profile' | 'datetime' | 'confirm' | 'admin'
  const [currentStep, setCurrentStep] = useState('splash');
  
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  // Mijozning navbatlari va tarixi
  const [clientAppointments, setClientAppointments] = useState(() => {
    const saved = localStorage.getItem('barberhub_client_appointments');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'apt-sample-1',
        barber_id: 'barber-2',
        barber_name: 'Sardor Karimov',
        barber_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        barber_phone: '+998 90 999 88 77',
        service_name: 'Soch kesish va turmaklash',
        price: 60000,
        date_str: '20-Noyabr, Juma',
        time_slot: '15:30',
        status: 'accepted',
        reviewed: false,
        created_at: '2026-11-18 14:00'
      },
      {
        id: 'apt-sample-2',
        barber_id: 'barber-1',
        barber_name: 'Azizbek Rustamov',
        barber_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        barber_phone: '+998 90 123 45 67',
        service_name: 'Soch va soqol kompleks',
        price: 80000,
        date_str: '15-Noyabr, Yakshanba',
        time_slot: '11:00',
        status: 'completed',
        reviewed: false,
        created_at: '2026-11-15 10:00'
      }
    ];
  });

  const activeAppointmentsCount = clientAppointments.filter(
    (a) => a.status === 'pending' || a.status === 'accepted'
  ).length;

  const [currentBarberProfile, setCurrentBarberProfile] = useState(() => {
    const saved = localStorage.getItem('barberhub_barber_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const t = translations[lang] || translations.uz;

  // Telegram WebApp Initialization va Telegram ID orqali ustani tiklash
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#004B86');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#E6EDF9');
    }

    // Agar usta botdan chiqib ketgan yoki tarix tozalangan bo'lsa ham,
    // uning doimiy Telegram ID si orqali profilini bazadan tiklash
    async function restoreBarberByTelegramId() {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const tgId = tgUser?.id;
      if (tgId) {
        const found = await getBarberByTelegramId(tgId);
        if (found) {
          console.log('[Auth] Usta Telegram ID orqali tanildi va tiklandi:', found.name);
          setUserRole('barber');
          setCurrentBarberProfile(found);
          localStorage.setItem('barberhub_user_role', 'barber');
          localStorage.setItem('barberhub_barber_profile', JSON.stringify(found));
          
          const idx = mockBarbers.findIndex(b => b.id === found.id);
          if (idx !== -1) {
            mockBarbers[idx] = { ...mockBarbers[idx], ...found };
          } else {
            mockBarbers.unshift(found);
          }
        }
      }
    }
    restoreBarberByTelegramId();
  }, []);

  // 1. Splash ekranda til tanlanganda
  const handleSelectLanguage = (selectedLang) => {
    setLang(selectedLang);
    // Agar foydalanuvchi roli avval tanlangan bo'lsa
    if (userRole === 'barber') {
      setCurrentStep('admin');
    } else if (userRole === 'client') {
      setCurrentStep('catalog');
    } else {
      // Birinchi marta kirayotgan bo'lsa - rolni tanlash ekraniga o'tadi
      setCurrentStep('role_select');
    }
  };

  // 2. Rol tanlanganda
  const handleSelectRole = (role) => {
    if (role === 'client') {
      setUserRole('client');
      localStorage.setItem('barberhub_user_role', 'client');
      setCurrentStep('catalog');
    } else if (role === 'barber') {
      // Ustani ro'yxatdan o'tkazish sahifasiga o'tadi
      setCurrentStep('barber_register');
    }
  };

  // 3. Usta muvaffaqiyatli ro'yxatdan o'tganda (Katalogga qo'shiladi!)
  const handleBarberRegisterSuccess = (newBarber) => {
    // Yangi ustani umumiy katalogga qo'shamiz
    mockBarbers.unshift(newBarber);
    setUserRole('barber');
    setCurrentBarberProfile(newBarber);
    localStorage.setItem('barberhub_user_role', 'barber');
    localStorage.setItem('barberhub_barber_profile', JSON.stringify(newBarber));
    setCurrentStep('admin');
  };

  // 4. Rolni qayta o'zgartirish (Test qilish uchun)
  const handleSwitchRole = () => {
    const nextRole = userRole === 'barber' ? 'client' : 'barber';
    setUserRole(nextRole);
    localStorage.setItem('barberhub_user_role', nextRole);
    if (nextRole === 'barber') {
      setCurrentStep('admin');
    } else {
      setCurrentStep('catalog');
    }
  };

  // 4. Usta hisobidan chiqish (Log Out)
  const handleLogout = () => {
    localStorage.removeItem('barberhub_user_role');
    localStorage.removeItem('barberhub_barber_profile');
    setUserRole(null);
    setCurrentBarberProfile(null);
    setCurrentStep('role_select');
  };

  // 5. Usta akkauntini butunlay o'chirish (Delete Account)
  const handleDeleteAccount = async () => {
    if (currentBarberProfile?.id) {
      await deleteBarberAccount(currentBarberProfile.id);
      const idx = mockBarbers.findIndex(b => b.id === currentBarberProfile.id);
      if (idx !== -1) mockBarbers.splice(idx, 1);
    }
    localStorage.removeItem('barberhub_user_role');
    localStorage.removeItem('barberhub_barber_profile');
    setUserRole(null);
    setCurrentBarberProfile(null);
    setCurrentStep('role_select');
  };

  // 6. Mijoz oqimi (Navigation)
  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setCurrentStep('profile');
  };

  const handleContinueFromProfile = (service) => {
    setSelectedService(service);
    setCurrentStep('datetime');
  };

  const handleContinueFromDateTime = (dateTime) => {
    setSelectedDateTime(dateTime);
    setCurrentStep('confirm');
  };

  const handleBookingSuccess = (newAppointment, nextDestination = 'catalog') => {
    if (newAppointment) {
      const updated = [newAppointment, ...clientAppointments];
      setClientAppointments(updated);
      localStorage.setItem('barberhub_client_appointments', JSON.stringify(updated));
    }
    setSelectedService(null);
    setSelectedDateTime(null);
    if (nextDestination === 'appointments') {
      setCurrentStep('my_appointments');
    } else {
      setCurrentStep('catalog');
    }
  };

  const handleUpdateClientAppointments = (updated) => {
    setClientAppointments(updated);
    localStorage.setItem('barberhub_client_appointments', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#E6EDF9] font-sans antialiased text-gray-900">
      {/* Top Header Bar (Faqat splash, role_select va barber_register'dan tashqari ko'rinadi) */}
      {!['splash', 'role_select', 'barber_register'].includes(currentStep) && (
        <HeaderBar
          lang={lang}
          setLang={setLang}
          t={t}
          userRole={userRole}
        />
      )}

      {/* 1. Splash Screen */}
      {currentStep === 'splash' && (
        <SplashScreen onSelectLanguage={handleSelectLanguage} />
      )}

      {/* 2. Rolni tanlash ekrani (Onboarding) */}
      {currentStep === 'role_select' && (
        <RoleSelectionScreen
          onSelectRole={handleSelectRole}
          t={t}
        />
      )}

      {/* 3. Usta ro'yxatdan o'tish ekrani */}
      {currentStep === 'barber_register' && (
        <BarberRegisterScreen
          onRegisterSuccess={handleBarberRegisterSuccess}
          onBack={() => setCurrentStep('role_select')}
          t={t}
        />
      )}

      {/* 4. USTA REJIMI: Faqat Usta Admin Paneli ochiladi */}
      {currentStep === 'admin' && (
        <AdminDashboardScreen
          t={t}
          lang={lang}
          currentBarber={currentBarberProfile}
          onUpdateProfile={(updated) => {
            setCurrentBarberProfile(updated);
            localStorage.setItem('barberhub_barber_profile', JSON.stringify(updated));
          }}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* 5. MIJOZ REJIMI: Umumiy katalog va navbat olish oqimi */}
      {currentStep === 'catalog' && (
        <CatalogScreen
          t={t}
          lang={lang}
          onSelectBarber={handleSelectBarber}
          onGoToAppointments={() => setCurrentStep('my_appointments')}
          activeAppointmentsCount={activeAppointmentsCount}
        />
      )}

      {/* 6. MIJOZNING NAVBATLARI VA TARIXI */}
      {currentStep === 'my_appointments' && (
        <ClientAppointmentsScreen
          appointments={clientAppointments}
          t={t}
          lang={lang}
          onBackToCatalog={() => setCurrentStep('catalog')}
          onUpdateAppointments={handleUpdateClientAppointments}
        />
      )}

      {currentStep === 'profile' && selectedBarber && (
        <BarberProfileScreen
          barber={selectedBarber}
          t={t}
          lang={lang}
          onBack={() => setCurrentStep('catalog')}
          onContinue={handleContinueFromProfile}
        />
      )}

      {currentStep === 'datetime' && selectedBarber && selectedService && (
        <DateTimeScreen
          barber={selectedBarber}
          service={selectedService}
          t={t}
          lang={lang}
          onBack={() => setCurrentStep('profile')}
          onContinue={handleContinueFromDateTime}
        />
      )}

      {currentStep === 'confirm' && selectedBarber && selectedService && selectedDateTime && (
        <ConfirmScreen
          barber={selectedBarber}
          service={selectedService}
          dateTime={selectedDateTime}
          t={t}
          lang={lang}
          onBack={() => setCurrentStep('datetime')}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Mijoz uchun Qulay Bottom Navigation Bar (Faqat katalog va navbatlarim ekranida) */}
      {userRole === 'client' && ['catalog', 'my_appointments'].includes(currentStep) && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-blue-100 py-2.5 px-6 flex items-center justify-around shadow-lg z-40">
          <button
            onClick={() => setCurrentStep('catalog')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              currentStep === 'catalog' ? 'text-brand-blue font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${currentStep === 'catalog' ? 'bg-blue-50 text-brand-blue' : ''}`}>
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-[11px]">{t.catalog_tab || "Ustalar"}</span>
          </button>

          <button
            onClick={() => setCurrentStep('my_appointments')}
            className={`flex flex-col items-center space-y-1 relative transition-all ${
              currentStep === 'my_appointments' ? 'text-brand-blue font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${currentStep === 'my_appointments' ? 'bg-blue-50 text-brand-blue' : ''}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px]">{t.my_appointments_tab || "Navbatlarim"}</span>
            {activeAppointmentsCount > 0 && (
              <span className="absolute -top-0.5 right-2 w-4 h-4 bg-brand-orange text-brand-blue font-black text-[9px] rounded-full flex items-center justify-center shadow-xs">
                {activeAppointmentsCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { translations } from './i18n/translations';
import { mockBarbers } from './data/mockBarbers';
import HeaderBar from './components/HeaderBar';
import SplashScreen from './pages/SplashScreen';
import RoleSelectionScreen from './pages/RoleSelectionScreen';
import BarberRegisterScreen from './pages/BarberRegisterScreen';
import CatalogScreen from './pages/CatalogScreen';
import BarberProfileScreen from './pages/BarberProfileScreen';
import DateTimeScreen from './pages/DateTimeScreen';
import ConfirmScreen from './pages/ConfirmScreen';
import AdminDashboardScreen from './pages/AdminDashboardScreen';

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
  const [currentBarberProfile, setCurrentBarberProfile] = useState(null);

  const t = translations[lang] || translations.uz;

  // Telegram WebApp Initialization
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#004B86');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#E6EDF9');
    }
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

  // 5. Mijoz oqimi (Navigation)
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

  const handleBookingSuccess = () => {
    setSelectedService(null);
    setSelectedDateTime(null);
    setCurrentStep('catalog');
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
          onSwitchRole={handleSwitchRole}
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
          currentBarber={currentBarberProfile}
        />
      )}

      {/* 5. MIJOZ REJIMI: Umumiy katalog va navbat olish oqimi */}
      {currentStep === 'catalog' && (
        <CatalogScreen
          t={t}
          onSelectBarber={handleSelectBarber}
        />
      )}

      {currentStep === 'profile' && selectedBarber && (
        <BarberProfileScreen
          barber={selectedBarber}
          t={t}
          onBack={() => setCurrentStep('catalog')}
          onContinue={handleContinueFromProfile}
        />
      )}

      {currentStep === 'datetime' && selectedBarber && selectedService && (
        <DateTimeScreen
          barber={selectedBarber}
          service={selectedService}
          t={t}
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
          onBack={() => setCurrentStep('datetime')}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

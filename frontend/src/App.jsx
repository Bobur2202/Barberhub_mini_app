import React, { useState, useEffect } from 'react';
import { translations } from './i18n/translations';
import HeaderBar from './components/HeaderBar';
import SplashScreen from './pages/SplashScreen';
import CatalogScreen from './pages/CatalogScreen';
import BarberProfileScreen from './pages/BarberProfileScreen';
import DateTimeScreen from './pages/DateTimeScreen';
import ConfirmScreen from './pages/ConfirmScreen';
import AdminDashboardScreen from './pages/AdminDashboardScreen';

export default function App() {
  // Application State
  const [lang, setLang] = useState('uz');
  const [currentStep, setCurrentStep] = useState('splash'); // 'splash' | 'catalog' | 'profile' | 'datetime' | 'confirm'
  const [viewMode, setViewMode] = useState('client'); // 'client' | 'barber'
  
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const t = translations[lang] || translations.uz;

  // Telegram WebApp Initialization
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      // Set header color
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#004B86');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#E6EDF9');
      }
    }
  }, []);

  // When language is selected on splash
  const handleSelectLanguage = (selectedLang) => {
    setLang(selectedLang);
    setCurrentStep('catalog');
  };

  // When a barber card is clicked in catalog
  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setCurrentStep('profile');
  };

  // When service is selected in profile
  const handleContinueFromProfile = (service) => {
    setSelectedService(service);
    setCurrentStep('datetime');
  };

  // When date & time is selected
  const handleContinueFromDateTime = (dateTime) => {
    setSelectedDateTime(dateTime);
    setCurrentStep('confirm');
  };

  // When booking is successfully confirmed
  const handleBookingSuccess = () => {
    setSelectedService(null);
    setSelectedDateTime(null);
    setCurrentStep('catalog');
  };

  return (
    <div className="min-h-screen bg-[#E6EDF9] font-sans antialiased text-gray-900">
      {/* Top Header Bar (Only visible when not in splash) */}
      {currentStep !== 'splash' && (
        <HeaderBar
          lang={lang}
          setLang={setLang}
          t={t}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {/* Barber SaaS Admin Dashboard View */}
      {viewMode === 'barber' ? (
        <AdminDashboardScreen t={t} />
      ) : (
        /* Client Marketplace Flow */
        <>
          {currentStep === 'splash' && (
            <SplashScreen onSelectLanguage={handleSelectLanguage} />
          )}

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
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Scissors, ArrowLeft, MapPin, Phone, User, Store, DollarSign, CheckCircle2 } from 'lucide-react';
import { TASHKENT_DISTRICTS } from '../data/mockBarbers';

export default function BarberRegisterScreen({ onRegisterSuccess, onBack, t }) {
  const [barberName, setBarberName] = useState('');
  const [shopName, setShopName] = useState('');
  const [districtId, setDistrictId] = useState('yunusobod');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [startingPrice, setStartingPrice] = useState('50000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedDistrict = TASHKENT_DISTRICTS.find(d => d.id === districtId);

    // Yangi usta ma'lumotlari
    const newBarber = {
      id: `barber-${Date.now()}`,
      name: barberName,
      role: shopName ? `${shopName} (Sartarosh)` : "Erkaklar sartaroshi",
      rating: 5.0,
      reviewsCount: 1,
      startingPrice: Number(startingPrice) || 50000,
      starting_price: Number(startingPrice) || 50000,
      address: address ? `Toshkent, ${selectedDistrict?.name || ''}, ${address}` : `Toshkent, ${selectedDistrict?.name || ''}`,
      districtId: districtId,
      lat: selectedDistrict?.center?.lat ? selectedDistrict.center.lat + 0.002 : 41.3400,
      lng: selectedDistrict?.center?.lng ? selectedDistrict.center.lng + 0.002 : 69.2800,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      bio: "Tajribali erkaklar sartaroshi. Zamonaviy soch turmaklari va soqol parvarishi.",
      services: [
        { id: `s-${Date.now()}-1`, name: "Klassik soch kesish", duration: "35 daq", price: Number(startingPrice) || 50000 },
        { id: `s-${Date.now()}-2`, name: "Soch va soqol kompleks", duration: "50 daq", price: (Number(startingPrice) || 50000) + 30000 },
        { id: `s-${Date.now()}-3`, name: "Talabalar uchun (Chegirma)", duration: "35 daq", price: Math.max((Number(startingPrice) || 50000) - 10000, 30000), oldPrice: Number(startingPrice) || 50000, isDiscount: true, note: "Talabalik guvohnomasi bilan" }
      ],
      reviews: [
        { id: `r-${Date.now()}`, author: "Yangi mijoz", rating: 5, date: "Hozirgina", comment: "A'lo darajada xizmat ko'rsatildi!" }
      ]
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess(newBarber);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-12 max-w-md mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#E6EDF9]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-blue hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-brand-blue">
          Ustani ro'yxatdan o'tkazish
        </h1>
        <div className="w-9"></div>
      </div>

      <div className="px-4 mt-2">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-brand-orange flex items-center justify-center mx-auto mb-2">
              <Scissors className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-brand-blue">
              Umumiy katalogga qo'shiling
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ro'yxatdan o'tganingizdan so'ng barcha mijozlar sizni ko'radi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Usta Ismi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ism va familiyangiz *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  placeholder="Masalan: Bobur Mirzayev"
                  className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* 2. Barbershop / Salon nomi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Salon yoki Barbershop nomi
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Masalan: Kings Barbershop (yoki yakka o'zingiz)"
                  className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* 3. Tuman tanlash */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Joylashgan tumaningiz *
              </label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
              >
                {TASHKENT_DISTRICTS.filter(d => d.id !== 'all').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Aniq manzil */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Aniq mo'ljal yoki manzil *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masalan: 14-mavze, 23-uy, Metrogacha 200m"
                  className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* 5. Telefon raqam */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Telefon raqamingiz *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue font-medium"
                />
              </div>
            </div>

            {/* 6. Boshlang'ich narx */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Soch kesish boshlang'ich narxi (UZS) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 border border-gray-200 focus:outline-none focus:border-brand-blue font-bold text-brand-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 rounded-xl font-extrabold text-brand-blue bg-brand-orange hover:bg-brand-orange-hover shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all text-center text-xs flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <span>Katalogga qo'shilmoqda...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ro'yxatdan o'tish va Ishni boshlash</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

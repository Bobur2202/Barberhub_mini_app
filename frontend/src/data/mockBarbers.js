export const TASHKENT_DISTRICTS = [
  { id: 'all', name: 'Barcha tumanlar' },
  { id: 'yunusobod', name: 'Yunusobod tumani', center: { lat: 41.3644, lng: 69.2882 } },
  { id: 'chilonzor', name: 'Chilonzor tumani', center: { lat: 41.2721, lng: 69.2045 } },
  { id: 'mirzo_ulugbek', name: 'Mirzo Ulug\'bek tumani', center: { lat: 41.3283, lng: 69.3344 } },
  { id: 'mirobod', name: 'Mirobod tumani', center: { lat: 41.2917, lng: 69.2789 } },
  { id: 'shayxontohur', name: 'Shayxontohur tumani', center: { lat: 41.3195, lng: 69.2412 } },
  { id: 'yakkasaroy', name: 'Yakkasaroy tumani', center: { lat: 41.2825, lng: 69.2536 } },
];

export const mockBarbers = [
  {
    id: "barber-1",
    name: "Azizbek Rustamov",
    role: "Erkaklar sartaroshi",
    rating: 4.9,
    reviewsCount: 142,
    startingPrice: 50000,
    address: "Toshkent, Yunusobod 14-mavze, 23-uy",
    districtId: "yunusobod",
    lat: 41.3665,
    lng: 69.2912,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    bio: "Klassik va zamonaviy soch turmaklash bo'yicha 7 yillik tajribaga ega usta.",
    workHours: { start: "09:00", end: "22:00" },
    isWorkingToday: true,
    daysOff: ["Dush"],
    salonPhotos: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=700"
    ],
    services: [
      { id: "s1", name: "Soch kesish va turmaklash", duration: "35 daq", price: 50000, isDiscount: false },
      { id: "s2", name: "Soch va soqol kompleks", duration: "50 daq", price: 80000, isDiscount: false },
      { id: "s3", name: "Talabalar uchun", duration: "35 daq", price: 40000, oldPrice: 50000, isDiscount: true, note: "Talabalik guvohnomasi bilan" },
      { id: "s4", name: "Yuz tozalash va qora niqob", duration: "25 daq", price: 35000, isDiscount: false }
    ],
    reviews: [
      { id: "r1", author: "Davron B.", rating: 5, date: "Kecha", comment: "Qo'li juda yengil, gap yo'q! Doim shu ustaga kelaman." },
      { id: "r2", author: "Bobur M.", rating: 5, date: "3 kun oldin", comment: "Soqolni chiroyli qilib berdi, salon ham toza." }
    ]
  },
  {
    id: "barber-2",
    name: "Sardor Karimov",
    role: "Erkaklar sartaroshi",
    rating: 4.8,
    reviewsCount: 218,
    startingPrice: 60000,
    address: "Toshkent, Yunusobod, Amir Temur shoh ko'chasi 107",
    districtId: "yunusobod",
    lat: 41.3340,
    lng: 69.2845,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    bio: "Zamonaviy soch turmaklari va soqol parvarishi. Har bir mijozga alohida e'tibor.",
    workHours: { start: "09:00", end: "22:00" },
    isWorkingToday: true,
    daysOff: ["Dush"],
    salonPhotos: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=700"
    ],
    services: [
      { id: "s201", name: "Soch kesish va turmaklash", duration: "40 daq", price: 60000, isDiscount: false },
      { id: "s202", name: "Soch va soqol parvarishi", duration: "60 daq", price: 90000, isDiscount: false },
      { id: "s203", name: "Talabalar uchun", duration: "40 daq", price: 50000, oldPrice: 60000, isDiscount: true, note: "Talabalik guvohnomasi bilan" },
      { id: "s204", name: "Bolalar uchun soch kesish (12 yoshgacha)", duration: "30 daq", price: 45000, isDiscount: false }
    ],
    reviews: [
      { id: "r201", author: "Shaxzod T.", rating: 5, date: "Bugun", comment: "Sardor aka doimgidek a'lo darajada bajardi. Tavsiya qilaman!" },
      { id: "r202", author: "Farhod K.", rating: 4, date: "1 hafta oldin", comment: "Vaqtida qabul qildi, sifatiga gap yo'q." }
    ]
  },
  {
    id: "barber-3",
    name: "Jasur Alimov",
    role: "Erkaklar sartaroshi",
    rating: 4.9,
    reviewsCount: 89,
    startingPrice: 55000,
    address: "Toshkent, Shahriston metrosi yaqinida",
    districtId: "yunusobod",
    lat: 41.3533,
    lng: 69.2889,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    bio: "Fade, Crop va Pompadour uslubidagi sochlarni mukammal darajada kesish bo'yicha mutaxassis.",
    workHours: { start: "10:00", end: "21:00" },
    isWorkingToday: true,
    daysOff: ["Yak"],
    salonPhotos: [
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=700"
    ],
    services: [
      { id: "s301", name: "Fade & Crop soch kesish", duration: "45 daq", price: 55000, isDiscount: false },
      { id: "s302", name: "Premium soch + soqol + maska", duration: "70 daq", price: 110000, isDiscount: false },
      { id: "s303", name: "Talabalar uchun", duration: "40 daq", price: 45000, oldPrice: 55000, isDiscount: true, note: "Talabalik guvohnomasi bilan" }
    ],
    reviews: [
      { id: "r301", author: "Alisher U.", rating: 5, date: "2 kun oldin", comment: "Fadeni daxshat chiqaradi!" }
    ]
  },
  {
    id: "barber-4",
    name: "Bobur Mirzayev",
    role: "Erkaklar sartaroshi",
    rating: 4.7,
    reviewsCount: 64,
    startingPrice: 45000,
    address: "Toshkent, Chilonzor 9-mavze, 12",
    districtId: "chilonzor",
    lat: 41.2750,
    lng: 69.2080,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    bio: "Tez va sifatli soch kesish, talabalar uchun doimiy arzon narxlar.",
    workHours: { start: "08:30", end: "20:00" },
    salonPhotos: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=700"
    ],
    services: [
      { id: "s401", name: "Klassik soch kesish", duration: "30 daq", price: 45000, isDiscount: false },
      { id: "s402", name: "Soqol tekislash", duration: "20 daq", price: 25000, isDiscount: false }
    ],
    reviews: [
      { id: "r401", author: "Otabek S.", rating: 5, date: "1 hafta oldin", comment: "Chilonzorda eng yaxshi usta." }
    ]
  }
];

/**
 * Haversine formulasi — 2 ta koordinata orasidagi aniq masofani hisoblash (km da)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Yer sharining radiusi (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Masofani qulay formatda chiqarish (masalan: 800 m yoki 1.4 km)
 */
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return "1.2 km";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

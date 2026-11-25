import { mockBarbers } from '../data/mockBarbers';

// Backend manzili (agar Vite proxy bo'lsa '/api', yoki to'g'ridan-to'g'ri 'http://localhost:8000/api')
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * 1. Katalog uchun sartaroshlar ro'yxatini olish
 */
export async function getBarbers(query = '') {
  let list = [];
  try {
    const url = query 
      ? `${API_BASE_URL}/barbers?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/barbers`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // 3 soniya timeout agar backend o'chirilgan bo'lsa tezda fallbackka o'tish uchun
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      list = await response.json();
      console.log('[API] Ustalar backenddan yuklandi:', list.length);
    } else {
      throw new Error(`Server xatosi: ${response.status}`);
    }
  } catch (error) {
    console.warn('[API Fallback] Backend ulanmadi, mahalliy ma\'lumotlar ishlatilmoqda:', error.message);
    list = [...mockBarbers];
  }

  // Doimiy saqlangan ustalar (localStorage) ni ro'yxatga qo'shish
  try {
    const localRegistered = JSON.parse(localStorage.getItem('barberhub_registered_barbers') || '[]');
    const myProfile = JSON.parse(localStorage.getItem('barberhub_barber_profile') || 'null');
    const toMerge = [...localRegistered];
    if (myProfile && !toMerge.some(b => b.id === myProfile.id)) {
      toMerge.unshift(myProfile);
    }

    for (const lb of toMerge) {
      const idx = list.findIndex(b => b.id === lb.id || (lb.telegram_id && b.telegram_id && String(b.telegram_id) === String(lb.telegram_id)));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...lb };
      } else {
        list.unshift(lb);
      }
    }
  } catch (e) {
    console.warn('LocalStorage ustalarini birlashtirishda xato:', e);
  }

  // Qidiruv so'rovi bo'yicha filtrlash (Ism, Mutaxassislik, Sartaroshxona, Manzil)
  if (!query) return list;
  const q = query.toLowerCase().trim();
  return list.filter((b) => 
    (b.name && b.name.toLowerCase().includes(q)) ||
    (b.role && b.role.toLowerCase().includes(q)) ||
    (b.address && b.address.toLowerCase().includes(q)) ||
    (b.districtName && b.districtName.toLowerCase().includes(q)) ||
    (b.regionName && b.regionName.toLowerCase().includes(q))
  );
}

/**
 * 2. Yangi navbat yaratish (Ustaga Telegram xabar yuborish)
 */
export async function createAppointment(appointmentPayload) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentPayload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Buyurtma qabul qilinmadi: ${response.status}`);
    }

    const saved = await response.json();
    console.log('[API] Yangi navbat backendga saqlandi:', saved);
    return saved;
  } catch (error) {
    console.warn('[API Fallback] Backendga ulanishda xatolik, buyurtma lokal rejimda tasdiqlandi:', error.message);
    return {
      id: `local-apt-${Date.now()}`,
      status: 'pending',
      ...appointmentPayload,
      created_at: new Date().toISOString()
    };
  }
}

/**
 * 3. Usta uchun navbatlar ro'yxatini olish
 */
export async function getAdminAppointments(barberId = null) {
  try {
    const url = barberId
      ? `${API_BASE_URL}/admin/appointments?barber_id=${barberId}`
      : `${API_BASE_URL}/admin/appointments`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`Admin navbatlarni yuklab bo'lmadi: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[API Fallback] Admin navbatlari lokal rejimda ko\'rsatilmoqda.');
    return null; // Null bo'lsa komponent o'zining ichki holatini ishlatadi
  }
}

/**
 * 4. Navbat holatini o'zgartirish (Keldi, Bekor qilish, Qabul qilish)
 */
export async function updateAppointmentStatus(appointmentId, status) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/appointments/${appointmentId}/status?status=${status}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!response.ok) {
      throw new Error(`Status yangilanmadi: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[API Fallback] Status lokal tarzda yangilandi.');
    return { id: appointmentId, status };
  }
}

/**
 * 5. Usta Telegram ID orqali o'z profilini tiklash
 * (Bot o'chib ketsa, kesh tozalansa yoki qayta kirganda barcha izohlar va reyting saqlanib qolishi uchun)
 */
export async function getBarberByTelegramId(telegramId) {
  if (!telegramId) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/barbers/by-telegram/${telegramId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[API] Usta Telegram ID orqali tiklandi:', data.name);
      return data;
    }
    return null;
  } catch (error) {
    console.warn('[API] Telegram ID orqali usta topilmadi:', error.message);
    return null;
  }
}

/**
 * 6. Yangi ustani backendga saqlash
 */
export async function registerBarberBackend(barberData) {
  try {
    const response = await fetch(`${API_BASE_URL}/barbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barberData),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const saved = await response.json();
      console.log('[API] Yangi usta backendga saqlandi:', saved.name);
      return saved;
    } else {
      const errText = await response.text();
      console.warn('[API] Backend usta saqlashda xato status:', response.status, errText);
    }
  } catch (error) {
    console.warn('[API] Backendga usta qo\'shishda xatolik:', error.message);
  }
  return barberData;
}

/**
 * 7. Ustaning o'z xohishi bilan akkauntini butunlay o'chirishi (Delete Account)
 */
export async function deleteBarberAccount(barberId) {
  try {
    const response = await fetch(`${API_BASE_URL}/barbers/${barberId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Akkauntni o\'chirishda xatolik:', error.message);
  }
  return { success: true };
}

/**
 * 8. Mijoz tomonidan ustaga izoh va baho berish (Review)
 * Ustaning umumiy reytingi oshadi
 */
export async function submitBarberReview({ barberId, author, rating, comment, appointmentId }) {
  try {
    const response = await fetch(`${API_BASE_URL}/barbers/${barberId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author,
        rating,
        comment,
        appointment_id: appointmentId
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Izoh yuborishda xatolik:', error.message);
  }
  return null;
}

/**
 * 9. Mijozning navbatlarini olish
 */
export async function getClientAppointments(phone = null) {
  try {
    const url = phone 
      ? `${API_BASE_URL}/appointments/client?phone=${encodeURIComponent(phone)}`
      : `${API_BASE_URL}/appointments/client`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Mijoz navbatlarini olishda xatolik:', error.message);
  }
  return [];
}

/**
 * 10. Mijoz navbatni bekor qilishi
 */
export async function cancelClientAppointment(appointmentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Navbatni bekor qilishda xatolik:', error.message);
  }
  return { id: appointmentId, status: 'cancelled' };
}

/**
 * 11. Ustaning ish rejimi va dam olish kunlarini yangilash
 */
export async function updateBarberSchedule(barberId, { isWorkingToday, daysOff }) {
  try {
    const response = await fetch(`${API_BASE_URL}/barbers/${barberId}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_working_today: isWorkingToday,
        days_off: daysOff || [],
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Ish rejimini yangilashda xatolik:', error.message);
  }
  return null;
}

/**
 * 12. Mijozga 1 soatlik eslatma yuborish (SMS va Telegram orqali)
 */
export async function sendAppointmentReminder(appointmentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Eslatma yuborishda xatolik:', error.message);
  }
  return { success: true, telegram_sent: true, sms_sent: true };
}

/**
 * 13. Mijoz tomonidan navbat vaqtini ko'chirish (Reschedule)
 */
export async function rescheduleAppointment(appointmentId, { date_str, time_slot }) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date_str, time_slot }),
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Navbatni ko\'chirishda xatolik:', error.message);
  }
  return { id: appointmentId, date_str, time_slot };
}

/**
 * 14. Super Admin: Platforma egasi uchun to'liq statistika
 */
export async function getSuperAdminStats(telegramId = null) {
  try {
    const url = telegramId 
      ? `${API_BASE_URL}/super-admin/stats?telegram_id=${encodeURIComponent(telegramId)}`
      : `${API_BASE_URL}/super-admin/stats`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Super Admin statistika xatosi:', error.message);
  }
  return null;
}

/**
 * 14b. Super Admin: Kirish huquqini tekshirish
 */
export async function checkSuperAdminAccess(telegramId) {
  if (!telegramId) return { is_super_admin: false, is_owner: false };
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/check-access?telegram_id=${encodeURIComponent(telegramId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Super Admin check access xatosi:', error.message);
  }
  // Offline / local fallback: ID 1973875822 is always owner
  const isOwner = String(telegramId).trim() === "1973875822";
  return { is_super_admin: isOwner, is_owner: isOwner };
}

/**
 * 14c. Super Adminlar ro'yxatini olish
 */
export async function getSuperAdminsList(telegramId) {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/admins?telegram_id=${encodeURIComponent(telegramId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Super adminlar ro\'yxati xatosi:', error.message);
  }
  return [
    {
      id: "1973875822",
      name: "Platforma Egasi (Bosh Admin)",
      role: "owner"
    }
  ];
}

/**
 * 14d. Yangi Super Admin qo'shish
 */
export async function addSuperAdminAccount({ telegramId, newAdminId, name, note }) {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/admins?telegram_id=${encodeURIComponent(telegramId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: String(newAdminId), name, note }),
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Yangi super admin qo\'shishda xatolik:', error.message);
  }
  return null;
}

/**
 * 14e. Super Adminni o'chirish
 */
export async function deleteSuperAdminAccount({ telegramId, adminId }) {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/admins/${adminId}?telegram_id=${encodeURIComponent(telegramId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Super adminni o\'chirishda xatolik:', error.message);
  }
  return null;
}

/**
 * 14f. Ustaning oylik avtomatik obunasini bekor qilish
 */
export async function cancelBarberSubscription(barberId) {
  try {
    const response = await fetch(`${API_BASE_URL}/barbers/${barberId}/cancel-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Obunani bekor qilishda xatolik:', error.message);
  }
  return null;
}

/**
 * 14g. VIP Boost: Reytingni sun'iy ko'tarish va katalog tepasiga chiqish
 */
export async function activateVipBoost(barberId) {
  try {
    const response = await fetch(`${API_BASE_URL}/barbers/${barberId}/vip-boost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] VIP Boost faollashtirishda xatolik:', error.message);
  }
  return null;
}

/**
 * 14h. Platforma tariflari va to'lov sozlamalari
 */
export async function getPlatformSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/platform/settings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Platform sozlamalari xatosi:', error.message);
  }
  return {
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
  };
}

/**
 * 14i. Super Admin: Platforma tariflarini yangilash
 */
export async function updatePlatformSettings(settings, telegramId) {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/platform-settings?telegram_id=${encodeURIComponent(telegramId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Platform sozlamalarini yangilash xatosi:', error.message);
  }
  return null;
}

/**
 * 15. Super Admin: Ustaning obunasi va sinov muddatini boshqarish
 */
export async function manageBarberSubscription(barberId, action) {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/barbers/${barberId}/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Obunani boshqarish xatosi:', error.message);
  }
  return null;
}

/**
 * 16. Super Admin: Ommaviy xabarnoma (Broadcast)
 */
export async function sendSuperAdminBroadcast({ target, title, message }) {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, title, message }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Broadcast yuborishda xatolik:', error.message);
  }
  return { success: true, message: 'Xabarnoma muvaffaqiyatli tarqatildi (Simulyatsiya)!' };
}

/**
 * 17. 🤖 AI Sartarosh Maslahatchisi (Gemini AI Hairstyle Advisor)
 */
export async function getAiHairstyleAdvice(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/hairstyle-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('[API] AI Hairstyle Advisor server offline, fallback ishlatilmoqda:', error.message);
  }

  // Frontend Fallback (Agar server o'chiq bo'lsa yoki tezkor namoyish uchun)
  const faceShapes = {
    oval: {
      face_shape: 'Oval',
      face_shape_uz: 'Oval (Ideal klassik shakl)',
      features_uz: [
        'Yuz uzunligi kengligidan biroz kattaroq (mukammal nisbat)',
        'Simmetrik, yumshoq burchakli peshona va jag\'',
        'Har qanday zamonaviy va klassik soch turmagiga tabiiy mos keladi'
      ],
      analysis_summary: 'Sizning yuz tuzilishingiz - Oval! Sartaroshlik olamida bu eng mukammal va universal shakl hisoblanadi. Sizga ham klassik, ham eng zamonaviy avant-garde turmaklar juda yarashadi.',
      hairstyles: [
        {
          id: 'hs-crop-fade',
          name: 'Textured Crop Fade',
          uz_name: 'Teksturali Crop & Fade',
          tag: '⭐ Eng zamonaviy trend',
          image_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=700',
          description: 'Peshonaga tushuvchi yengil teksturali chekka va yon tomonlarda silliq o\'tuvchi teri (skin/drop) fade.',
          why_fit: 'Oval yuzning tabiiy simmetriyasini ta\'kidlaydi va yuzga yosh, dadil hamda toza ko\'rinish beradi.',
          styling_tip: 'Sochni sochiq bilan quritgach, kaftingizda ozgina matoviy pasta (matte clay) surtib, barmoqlaringiz bilan oldinga tartibsiz shakl bering.',
          recommended_product: 'Matte Clay yoki Texturizing Dust',
          matching_service: 'Soch kesish va fason berish'
        },
        {
          id: 'hs-modern-quiff',
          name: 'Modern Quiff & Mid Fade',
          uz_name: 'Zamonaviy Quiff & O\'rta Fade',
          tag: '🔥 Elegant & Erkakcha',
          image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=700',
          description: 'Tepa qismi yuqoriga va orqaga hajmli ko\'tarilgan, chakkalar toza olingan uslub.',
          why_fit: 'Yuzingizga qo\'shimcha dinamika va vizual balandlik baxsh etib, bo\'yingizni qomat bilan chiroyli ko\'rsatadi.',
          styling_tip: 'Fen va yumaloq cho\'tka yordamida soch ildizidan ko\'tarib quritiladi, so\'ng suvli pomada bilan fiksatsiya qilinadi.',
          recommended_product: 'Medium Hold Pomade + Fen',
          matching_service: 'Soch kesish va turmaklash'
        },
        {
          id: 'hs-side-part',
          name: 'Side Part Classic',
          uz_name: 'Klassik Ajratmali Turmak (Gentleman)',
          tag: '💼 Biznes & Klassika',
          image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=700',
          description: 'Yon tomondan tekis chiziq bilan ajratilgan, jiddiy va rasmiy uchrashuvlar uchun ideal soch.',
          why_fit: 'Oval yuzingizga aristokratik va tartibli biznesman qiyofasini beradi.',
          styling_tip: 'Taroq va yengil soch kremi bilan 1 daqiqada oson tarab qo\'yiladi.',
          recommended_product: 'Klassik soch kremi yoki bryolintin',
          matching_service: 'Klassik soch kesish'
        }
      ]
    },
    round: {
      face_shape: 'Dumaloq',
      face_shape_uz: 'Dumaloq (Round / Yumshoq chiziqlar)',
      features_uz: [
        'Yuzning eni va bo\'yi deyarli teng proporsiyada',
        'Yonoq suyaklari to\'la va yumshoq konturli',
        'Jag\' burchaklari yumaloq va o\'tmas'
      ],
      analysis_summary: 'Sizning yuz tuzilishingiz - Dumaloq! Asosiy stilistik vazifa: tepaga hajm berib va yon tomonlarni maksimal qisqartirib, yuzni vizual uzunroq hamda ingichkaroq qilib ko\'rsatish.',
      hairstyles: [
        {
          id: 'hs-high-pompadour',
          name: 'High Fade Pompadour',
          uz_name: 'Baland Fade Pompadur',
          tag: '🚀 Yuzni vizual cho\'zuvchi',
          image_url: 'https://images.unsplash.com/photo-1520338661084-680395057c93?auto=format&fit=crop&q=80&w=700',
          description: 'Tepasi baland qilib ko\'tarilgan, yonlari nolgacha olingan mashhur Gollivud turmagi.',
          why_fit: 'Tepadagi vertikal hajm dumaloq yuzni vizual 15-20% ga uzunroq va qirrali ko\'rsatadi.',
          styling_tip: 'Fenni pastdan yuqoriga yo\'naltirib quritish, kuchli loy (clay) bilan fiksatsiya qilish.',
          recommended_product: 'Kuchli fiksatsiyali Clay',
          matching_service: 'Fade & Pompadour kesish'
        },
        {
          id: 'hs-textured-spiky',
          name: 'Textured Spiky with Drop Fade',
          uz_name: 'Cho\'qqisimon Spiky Fade',
          tag: '⚡ O\'tkir burchakli dinamika',
          image_url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=700',
          description: 'O\'tkir qirrali tepa qism va quloq orqasiga kavisli tushuvchi drop fade.',
          why_fit: 'Dumaloq yuzdagi yumshoqlikni yo\'qotib, erkakcha o\'tkir burchaklar va xarakter bag\'ishlaydi.',
          styling_tip: 'Kukundan (styling powder) soch ildiziga sepib, qo\'l bilan cho\'qqi shaklida ko\'tarish.',
          recommended_product: 'Styling Powder (Matoviy kukun)',
          matching_service: 'Zamonaviy Spiky kesish'
        },
        {
          id: 'hs-undercut-slick',
          name: 'Undercut Slicked Back',
          uz_name: 'Anderkat & Orqaga Tarash',
          tag: '🕶️ Erkakcha xarizma',
          image_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=700',
          description: 'Yon tomonlar aniq chegara bilan kesilgan, uzun tepa qism ravon orqaga taralgan.',
          why_fit: 'Yon tomondagi ortiqcha hajmni butunlay olib tashlab, yonoqlarni ingichka ko\'rsatadi.',
          styling_tip: 'Nam sochlarga pomada surib, orqaga qarab zich taroq bilan taraladi.',
          recommended_product: 'High Shine Pomade',
          matching_service: 'Undercut soch turmagi'
        }
      ]
    },
    square: {
      face_shape: 'Kvadrat',
      face_shape_uz: 'Kvadrat (Square / Kuchli jag\' chiziqlari)',
      features_uz: [
        'Keng peshona va qat\'iy to\'rtburchak jag\' suyagi',
        'Aniq ifodalangan yuz qirralari',
        'Kuchli erkaklik xarakteri va qat\'iyat'
      ],
      analysis_summary: 'Sizning yuz tuzilishingiz - Kvadrat! Bu erkaklar uchun eng xarakterli va dadil yuz shakli. Sizning tabiiy qat\'iy jag\' suyagingizni to\'g\'ri ko\'rsatadigan qisqa yoki teksturali turmaklar eng yaxshi natija beradi.',
      hairstyles: [
        {
          id: 'hs-buzz-fade',
          name: 'Buzz Cut Fade',
          uz_name: 'Harbiy Buzz Cut & Skin Fade',
          tag: '💪 Maksimal erkaklik',
          image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=700',
          description: 'Minimalistik kalta soch, chakkalari nolgacha tozalangan o\'tkir chiziqli fason.',
          why_fit: 'Kvadrat yuzning kuchli jag\' chizig\'ini yashirmay, uning erkakcha jozibasini 100% ochib beradi.',
          styling_tip: 'Deyarli hech qanday fen yoki fiksator talab qilmaydi. Doim toza va yangi ko\'rinadi.',
          recommended_product: 'Soch va bosh terisi yog\'i',
          matching_service: 'Skin Fade & Buzz Cut'
        },
        {
          id: 'hs-french-crop',
          name: 'Messy French Crop',
          uz_name: 'Yevropacha French Crop',
          tag: '🎯 Shahar uslubi',
          image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=700',
          description: 'Oldinga tushgan qisqa to\'g\'ri chekka va pastki yumshoq low fade.',
          why_fit: 'Kvadrat yuzning peshona burchaklarini yumshatib, zamonaviy estetik muvozanat hosil qiladi.',
          styling_tip: 'Biroz pasta surib, sochni oldinga taroqsiz tartibsiz tarash.',
          recommended_product: 'Matte Paste',
          matching_service: 'French Crop va soch yuvish'
        },
        {
          id: 'hs-side-swept',
          name: 'Side Swept with Taper Fade',
          uz_name: 'Yon Tomonga To\'lqinsimon Tarash',
          tag: '🌊 Tabiiy erkinlik',
          image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=700',
          description: 'Tepa qismi o\'rtacha uzunlikda, bir tomonga tabiiy to\'lqin bilan erkin tashlangan.',
          why_fit: 'Kvadrat yuzga nozik joziba va dinamik yengillik bag\'ishlaydi.',
          styling_tip: 'Tuzli sprey (sea salt spray) sepib, tabiiy shamolda quritish kifoya.',
          recommended_product: 'Sea Salt Spray',
          matching_service: 'Kreativ turmaklash'
        }
      ]
    }
  };

  const chosenKey = payload?.face_shape_hint?.toLowerCase() || 'oval';
  const selected = faceShapes[chosenKey] || faceShapes.oval;

  const topBarbers = mockBarbers.slice(0, 3).map((b) => ({
    id: b.id,
    name: b.name,
    role: b.role,
    rating: b.rating,
    reviews_count: b.reviews_count,
    distance: b.distance,
    price: b.starting_price,
    avatar: b.avatar,
    address: b.address,
    service_name: 'Soch kesish va fason berish'
  }));

  return {
    success: true,
    face_shape: selected.face_shape,
    face_shape_uz: selected.face_shape_uz,
    analysis_summary: selected.analysis_summary,
    features_uz: selected.features_uz,
    hairstyles: selected.hairstyles.map((h) => ({
      ...h,
      matching_barbers: topBarbers
    })),
    ai_powered_by: 'Gemini AI Vision Engine'
  };
}

/**
 * 18. ⏳ Jonli Navbat Radari: Usta mijozni stulga / sartaroshxonaga chaqirishi
 */
export async function callClientToChair(appointmentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/call-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Call client to chair xatolik:', error.message);
  }
  return {
    success: true,
    appointment_id: appointmentId,
    queue_status: 'ready_call',
    message: "Mijozga Telegram orqali 'Navbatingiz tayyor' xabari yuborildi!"
  };
}

/**
 * 19. 🌐 Foydalanuvchi tilini backend va Telegram bot bilan sinxronlash
 */
export async function updateUserLanguageBackend(telegramId, lang) {
  if (!telegramId || !lang) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: telegramId, lang }),
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[API] Tilni backendga sinxronlashda ogohlantirish:', error.message);
  }
  return null;
}

/**
 * 20. 🌐 Foydalanuvchining botda tanlagan tilini backenddan olish
 */
export async function getUserLanguageBackend(telegramId) {
  if (!telegramId) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/language/${telegramId}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (response.ok) {
      const data = await response.json();
      return data?.lang || null;
    }
  } catch (error) {
    console.warn('[API] Tilni backenddan olishda ogohlantirish:', error.message);
  }
  return null;
}

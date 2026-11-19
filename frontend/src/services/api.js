import { mockBarbers } from '../data/mockBarbers';

// Backend manzili (agar Vite proxy bo'lsa '/api', yoki to'g'ridan-to'g'ri 'http://localhost:8000/api')
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * 1. Katalog uchun sartaroshlar ro'yxatini olish
 */
export async function getBarbers(query = '') {
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

    if (!response.ok) {
      throw new Error(`Server xatosi: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Ustalar backenddan yuklandi:', data.length);
    return data;
  } catch (error) {
    console.warn('[API Fallback] Backend ulanmadi, mahalliy ma\'lumotlar ishlatilmoqda:', error.message);
    if (!query) return mockBarbers;
    const q = query.toLowerCase();
    return mockBarbers.filter(
      (b) => b.name.toLowerCase().includes(q) || b.role.toLowerCase().includes(q)
    );
  }
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
      return await response.json();
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

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

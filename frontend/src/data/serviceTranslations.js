// Barcha xizmat nomlarini 3 tilda (UZ, RU, EN) tarjima qilish lug'ati
export const SERVICE_TRANSLATIONS = {
  "Soch kesish va turmaklash": {
    uz: "Soch kesish va turmaklash",
    ru: "Стрижка и укладка волос",
    en: "Haircut & Styling"
  },
  "Soch va soqol parvarishi": {
    uz: "Soch va soqol parvarishi",
    ru: "Уход за волосами и бородой",
    en: "Hair & Beard Grooming"
  },
  "Soch va soqol kompleks": {
    uz: "Soch va soqol kompleks",
    ru: "Комплекс: стрижка и борода",
    en: "Hair & Beard Combo"
  },
  "Soch va soqol tekislash (Kompleks)": {
    uz: "Soch va soqol tekislash (Kompleks)",
    ru: "Стрижка и моделирование бороды",
    en: "Hair & Beard Styling Combo"
  },
  "Talabalar uchun": {
    uz: "Talabalar uchun (Chegirma)",
    ru: "Для студентов (Скидка)",
    en: "For Students (Discount)"
  },
  "Talabalar uchun (Chegirma)": {
    uz: "Talabalar uchun (Chegirma)",
    ru: "Для студентов (Скидка)",
    en: "For Students (Discount)"
  },
  "Talabalar uchun (Soch kesish)": {
    uz: "Talabalar uchun (Soch kesish)",
    ru: "Для студентов (Стрижка)",
    en: "Student Haircut"
  },
  "Fade & Crop soch kesish": {
    uz: "Fade & Crop soch kesish",
    ru: "Стрижка Fade & Crop",
    en: "Fade & Crop Haircut"
  },
  "Premium soch + soqol + maska": {
    uz: "Premium soch + soqol + maska",
    ru: "Премиум стрижка + борода + маска",
    en: "Premium Hair + Beard + Mask"
  },
  "Bolalar uchun soch kesish (12 yoshgacha)": {
    uz: "Bolalar uchun soch kesish (12 yoshgacha)",
    ru: "Детская стрижка (до 12 лет)",
    en: "Kids Haircut (under 12)"
  },
  "Yuz tozalash va qora niqob": {
    uz: "Yuz tozalash va qora niqob",
    ru: "Чистка лица и черная маска",
    en: "Facial Cleansing & Black Mask"
  },
  "Klassik soch kesish": {
    uz: "Klassik soch kesish",
    ru: "Классическая стрижка",
    en: "Classic Haircut"
  },
  "Soqol tekislash": {
    uz: "Soqol tekislash",
    ru: "Моделирование бороды",
    en: "Beard Trimming"
  }
};

/**
 * Xizmat nomini foydalanuvchi tanlagan tilga (UZ, RU, EN) tarjima qilish
 */
export function getTranslatedServiceName(name, lang = 'uz') {
  if (!name) return "";
  if (SERVICE_TRANSLATIONS[name] && SERVICE_TRANSLATIONS[name][lang]) {
    return SERVICE_TRANSLATIONS[name][lang];
  }
  return name;
}

/**
 * Xizmat davomiyligini (masalan: '40 daq' -> '40 мин' / '40 min') tarjima qilish
 */
export function formatServiceDuration(durationStr, lang = 'uz') {
  if (!durationStr) return "";
  const minutes = durationStr.replace(/\D/g, ''); // faqat sonni olish
  if (!minutes) return durationStr;

  if (lang === 'ru') return `${minutes} мин`;
  if (lang === 'en') return `${minutes} min`;
  return `${minutes} daq`;
}

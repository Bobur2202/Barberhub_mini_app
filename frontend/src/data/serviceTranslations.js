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
  "Bolalar soch turmagi": {
    uz: "Bolalar soch turmagi",
    ru: "Детская стрижка",
    en: "Kids Haircut"
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
  if (lang === 'uz') return name;

  // Direct lookup
  if (SERVICE_TRANSLATIONS[name] && SERVICE_TRANSLATIONS[name][lang]) {
    return SERVICE_TRANSLATIONS[name][lang];
  }

  // Partial / case-insensitive search
  const lower = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(SERVICE_TRANSLATIONS)) {
    if (key.toLowerCase() === lower || lower.startsWith(key.toLowerCase()) || key.toLowerCase().startsWith(lower)) {
      return val[lang] || name;
    }
  }

  // Substring matching
  if (lower.includes("talaba") || lower.includes("student")) {
    return lang === 'ru' ? "Для студентов (Скидка)" : "For Students (Discount)";
  }
  if (lower.includes("soqol") && lower.includes("soch")) {
    return lang === 'ru' ? "Комплекс: стрижка и борода" : "Hair & Beard Combo";
  }
  if (lower.includes("soch kesish") || lower.includes("turmaklash")) {
    return lang === 'ru' ? "Стрижка и укладка" : "Haircut & Styling";
  }
  if (lower.includes("soqol")) {
    return lang === 'ru' ? "Моделирование бороды" : "Beard Styling";
  }
  if (lower.includes("bola")) {
    return lang === 'ru' ? "Детская стрижка" : "Kids Haircut";
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

/**
 * Piyoda yurish vaqtini tarjima qilish (masalan: 4 daqiqa piyoda -> 4 мин пешком / 4 min walk)
 */
export function formatWalkTime(walkMins, lang = 'uz') {
  const m = Math.max(1, Math.round(walkMins));
  if (lang === 'ru') {
    return m < 60 ? `${m} мин пешком` : `${Math.round(m / 60)} ч пешком`;
  }
  if (lang === 'en') {
    return m < 60 ? `${m} min walk` : `${Math.round(m / 60)} hr walk`;
  }
  return m < 60 ? `${m} daq piyoda` : `${Math.round(m / 60)} soat piyoda`;
}

/**
 * Sartaroshxona manzillarini 3 tilda (UZ, RU, EN) tarjima qilish
 */
export const KNOWN_ADDRESSES = {
  "Toshkent, Yunusobod 14-mavze, 23-uy": {
    uz: "Toshkent, Yunusobod 14-mavze, 23-uy",
    ru: "Ташкент, Юнусабад 14-квартал, дом 23",
    en: "Tashkent, Yunusabad 14th block, bld. 23"
  },
  "Toshkent, Yunusobod 14-mavze, 23": {
    uz: "Toshkent, Yunusobod 14-mavze, 23",
    ru: "Ташкент, Юнусабад 14-квартал, 23",
    en: "Tashkent, Yunusabad 14th block, 23"
  },
  "Toshkent, Yunusobod, Amir Temur shoh ko'chasi 107": {
    uz: "Toshkent, Yunusobod, Amir Temur shoh ko'chasi 107",
    ru: "Ташкент, Юнусабад, проспект Амира Темура 107",
    en: "Tashkent, Yunusabad, 107 Amir Temur Ave"
  },
  "Toshkent, Shahriston metrosi yaqinida": {
    uz: "Toshkent, Shahriston metrosi yaqinida",
    ru: "Ташкент, возле метро Шахристан",
    en: "Tashkent, near Shahriston metro"
  },
  "Toshkent, Chilonzor 9-mavze, 12": {
    uz: "Toshkent, Chilonzor 9-mavze, 12",
    ru: "Ташкент, Чиланзар 9-квартал, 12",
    en: "Tashkent, Chilanzar 9th block, 12"
  },
  "Toshkent, Chilonzor 9-mavze": {
    uz: "Toshkent, Chilonzor 9-mavze",
    ru: "Ташкент, Чиланзар 9-квартал",
    en: "Tashkent, Chilanzar 9th block"
  },
  "Toshkent shahri": {
    uz: "Toshkent shahri",
    ru: "г. Ташкент",
    en: "Tashkent city"
  },
  "Toshkent, Mirzo Ulug'bek": {
    uz: "Toshkent, Mirzo Ulug'bek",
    ru: "Ташкент, Мирзо Улугбек",
    en: "Tashkent, Mirzo Ulugbek"
  },
  "Toshkent, Yunusobod": {
    uz: "Toshkent, Yunusobod",
    ru: "Ташкент, Юнусабад",
    en: "Tashkent, Yunusabad"
  },
  "Toshkent, Chilonzor": {
    uz: "Toshkent, Chilonzor",
    ru: "Ташкент, Чиланзар",
    en: "Tashkent, Chilanzar"
  }
};

export function getTranslatedAddress(address, lang = 'uz') {
  if (!address) return "";
  if (lang === 'uz') return address;

  // Direct lookup
  if (KNOWN_ADDRESSES[address] && KNOWN_ADDRESSES[address][lang]) {
    return KNOWN_ADDRESSES[address][lang];
  }

  // Check prefix or partial match
  const trimmed = address.trim();
  for (const [key, val] of Object.entries(KNOWN_ADDRESSES)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(trimmed.toLowerCase())) {
      return val[lang] || address;
    }
  }

  // Dynamic word replacement for user-entered addresses
  let res = address;
  if (lang === 'ru') {
    res = res
      .replace(/Toshkent/gi, 'Ташкент')
      .replace(/Yunusobod/gi, 'Юнусабад')
      .replace(/Chilonzor/gi, 'Чиланзар')
      .replace(/Mirzo Ulug['’`]?bek/gi, 'Мирзо Улугбек')
      .replace(/Mirobod/gi, 'Мирабад')
      .replace(/Shayxontohur/gi, 'Шайхантахур')
      .replace(/Yakkasaroy/gi, 'Яккасарай')
      .replace(/Shahriston metrosi yaqinida/gi, 'возле метро Шахристан')
      .replace(/Amir Temur shoh ko['’`]?chasi/gi, 'проспект Амира Темура')
      .replace(/shoh ko['’`]?chasi/gi, 'проспект')
      .replace(/ko['’`]?chasi/gi, 'улица')
      .replace(/-mavze/gi, '-квартал')
      .replace(/-uy/gi, '-дом')
      .replace(/shahri/gi, 'город');
  } else if (lang === 'en') {
    res = res
      .replace(/Toshkent/gi, 'Tashkent')
      .replace(/Yunusobod/gi, 'Yunusabad')
      .replace(/Chilonzor/gi, 'Chilanzar')
      .replace(/Mirzo Ulug['’`]?bek/gi, 'Mirzo Ulugbek')
      .replace(/Mirobod/gi, 'Mirabad')
      .replace(/Shayxontohur/gi, 'Shaykhontokhur')
      .replace(/Yakkasaroy/gi, 'Yakkasaray')
      .replace(/Shahriston metrosi yaqinida/gi, 'near Shahriston metro')
      .replace(/Amir Temur shoh ko['’`]?chasi/gi, 'Amir Temur Ave')
      .replace(/shoh ko['’`]?chasi/gi, 'Avenue')
      .replace(/ko['’`]?chasi/gi, 'Street')
      .replace(/-mavze/gi, 'th block')
      .replace(/-uy/gi, ' bld.')
      .replace(/shahri/gi, 'city');
  }

  return res;
}

/**
 * Usta mutaxassisligi (Role) ni tarjima qilish
 */
export function getTranslatedRole(role, lang = 'uz') {
  if (!role) return "";
  if (lang === 'uz') return role;

  const lower = role.toLowerCase();
  if (lower.includes("sartarosh") || lower.includes("barber")) {
    if (lower.includes("top") || lower.includes("stilist")) {
      return lang === 'ru' ? "Топ-барбер / Стилист" : "Top Barber / Stylist";
    }
    return lang === 'ru' ? "Мужской парикмахер" : "Men's Barber";
  }
  if (lower.includes("soch") && lower.includes("soqol")) {
    return lang === 'ru' ? "Мастер волос и бороды" : "Hair & Beard Master";
  }
  return role;
}

/**
 * Usta qisqa tavsifi (Bio) ni tarjima qilish
 */
export function getTranslatedBio(bio, lang = 'uz') {
  if (!bio) return "";
  if (lang === 'uz') return bio;

  const lower = bio.toLowerCase();
  if (lower.includes("7 yillik tajriba") || lower.includes("tajribaga ega")) {
    return lang === 'ru'
      ? "Мастер с 7-летним опытом в классических и современных стрижках."
      : "Professional barber with 7 years of experience in classic and modern haircuts.";
  }
  if (lower.includes("har bir mijozga alohida") || lower.includes("sardor")) {
    return lang === 'ru'
      ? "Современные стрижки и уход за бородой. Индивидуальный подход к каждому клиенту."
      : "Modern haircuts and beard grooming. Individual approach to every client.";
  }
  if (lower.includes("fade, crop") || lower.includes("pompadour")) {
    return lang === 'ru'
      ? "Специалист по безупречным стрижкам в стилях Fade, Crop и Pompadour."
      : "Specialist in flawless Fade, Crop, and Pompadour modern hairstyles.";
  }
  if (lower.includes("tez va sifatli") || lower.includes("arzon")) {
    return lang === 'ru'
      ? "Быстрые и качественные стрижки, постоянные скидки для студентов."
      : "Fast and high-quality haircuts, regular affordable prices for students.";
  }

  return bio;
}

/**
 * Tuman nomlarini tarjima qilish
 */
export function getTranslatedDistrict(districtName, lang = 'uz') {
  if (!districtName) return "";
  if (lang === 'uz') return districtName;

  const map = {
    "Barcha tumanlar": { ru: "Все районы", en: "All districts" },
    "Yunusobod tumani": { ru: "Юнусабадский район", en: "Yunusabad district" },
    "Chilonzor tumani": { ru: "Чиланзарский район", en: "Chilanzar district" },
    "Mirzo Ulug'bek tumani": { ru: "Мирзо-Улугбекский район", en: "Mirzo Ulugbek district" },
    "Mirobod tumani": { ru: "Мирабадский район", en: "Mirabad district" },
    "Shayxontohur tumani": { ru: "Шайхантахурский район", en: "Shaykhontokhur district" },
    "Yakkasaroy tumani": { ru: "Яккасарайский район", en: "Yakkasaray district" },
    "Toshkent, Yunusobod": { ru: "Ташкент, Юнусабад", en: "Tashkent, Yunusabad" },
    "Toshkent, Chilonzor": { ru: "Ташкент, Чиланзар", en: "Tashkent, Chilanzar" }
  };

  if (map[districtName] && map[districtName][lang]) {
    return map[districtName][lang];
  }
  return districtName;
}

/**
 * Sana matnini (masalan: '18-Noyabr', '18-Noyabr, Dush', 'Bugun 18-Noyabr') 3 tilda tarjima qilish
 */
export function formatAppointmentDate(dateStr, lang = 'uz') {
  if (!dateStr) return "";
  let res = String(dateStr);

  const monthsMap = {
    'yanvar': { uz: 'Yanvar', ru: 'января', en: 'January' },
    'fevral': { uz: 'Fevral', ru: 'февраля', en: 'February' },
    'mart': { uz: 'Mart', ru: 'марта', en: 'March' },
    'aprel': { uz: 'Aprel', ru: 'апреля', en: 'April' },
    'may': { uz: 'May', ru: 'мая', en: 'May' },
    'iyun': { uz: 'Iyun', ru: 'июня', en: 'June' },
    'iyul': { uz: 'Iyul', ru: 'июля', en: 'July' },
    'avgust': { uz: 'Avgust', ru: 'августа', en: 'August' },
    'sentabr': { uz: 'Sentabr', ru: 'сентября', en: 'September' },
    'oktabr': { uz: 'Oktabr', ru: 'октября', en: 'October' },
    'noyabr': { uz: 'Noyabr', ru: 'ноября', en: 'November' },
    'dekabr': { uz: 'Dekabr', ru: 'декабря', en: 'December' },
    'январ': { uz: 'Yanvar', ru: 'января', en: 'January' },
    'феврал': { uz: 'Fevral', ru: 'февраля', en: 'February' },
    'март': { uz: 'Mart', ru: 'марта', en: 'March' },
    'апрел': { uz: 'Aprel', ru: 'апреля', en: 'April' },
    'июн': { uz: 'Iyun', ru: 'июня', en: 'June' },
    'июл': { uz: 'Iyul', ru: 'июля', en: 'July' },
    'август': { uz: 'Avgust', ru: 'августа', en: 'August' },
    'сентябр': { uz: 'Sentabr', ru: 'сентября', en: 'September' },
    'октябр': { uz: 'Oktabr', ru: 'октября', en: 'October' },
    'ноябр': { uz: 'Noyabr', ru: 'ноября', en: 'November' },
    'декабр': { uz: 'Dekabr', ru: 'декабря', en: 'December' },
    'january': { uz: 'Yanvar', ru: 'января', en: 'January' },
    'february': { uz: 'Fevral', ru: 'февраля', en: 'February' },
    'march': { uz: 'Mart', ru: 'марта', en: 'March' },
    'april': { uz: 'Aprel', ru: 'апреля', en: 'April' },
    'june': { uz: 'Iyun', ru: 'июня', en: 'June' },
    'july': { uz: 'Iyul', ru: 'июля', en: 'July' },
    'august': { uz: 'Avgust', ru: 'августа', en: 'August' },
    'september': { uz: 'Sentabr', ru: 'сентября', en: 'September' },
    'october': { uz: 'Oktabr', ru: 'октября', en: 'October' },
    'november': { uz: 'Noyabr', ru: 'ноября', en: 'November' },
    'december': { uz: 'Dekabr', ru: 'декабря', en: 'December' }
  };

  const daysMap = {
    'dush': { uz: 'Dush', ru: 'Пн', en: 'Mon' },
    'sesh': { uz: 'Sesh', ru: 'Вт', en: 'Tue' },
    'chor': { uz: 'Chor', ru: 'Ср', en: 'Wed' },
    'pay': { uz: 'Pay', ru: 'Чт', en: 'Thu' },
    'juma': { uz: 'Juma', ru: 'Пт', en: 'Fri' },
    'shan': { uz: 'Shan', ru: 'Сб', en: 'Sat' },
    'yak': { uz: 'Yak', ru: 'Вс', en: 'Sun' },
    'bugun': { uz: 'Bugun', ru: 'Сегодня', en: 'Today' },
    'ertaga': { uz: 'Ertaga', ru: 'Завтра', en: 'Tomorrow' }
  };

  // Replace months
  for (const [key, tr] of Object.entries(monthsMap)) {
    const reg = new RegExp(key, 'gi');
    if (reg.test(res)) {
      if (lang === 'ru') {
        res = res.replace(reg, tr.ru).replace(/(\d+)-/, '$1 ');
      } else if (lang === 'en') {
        res = res.replace(reg, tr.en).replace(/(\d+)-/, '$1 ');
      } else {
        res = res.replace(reg, tr.uz);
      }
      break;
    }
  }

  // Replace days / prefixes
  for (const [key, tr] of Object.entries(daysMap)) {
    const reg = new RegExp(`\\b${key}\\b`, 'gi');
    if (reg.test(res)) {
      res = res.replace(reg, tr[lang] || tr.uz);
    }
  }

  return res;
}

/**
 * Aksiya va Chegirma nishonlarini (masalan: 'Talabalik guvohnomasi bilan') tarjima qilish
 */
export function getTranslatedPromoBadge(badge, lang = 'uz') {
  if (!badge) return "";
  if (lang === 'uz') return badge;
  const lower = badge.toLowerCase();
  if (lower.includes('talaba') || lower.includes('student')) {
    return lang === 'ru' ? 'По студенческому билету' : 'With student ID';
  }
  if (lower.includes('aksiya') || lower.includes('discount') || lower.includes('скидк')) {
    return lang === 'ru' ? 'Акция' : 'Special Offer';
  }
  return badge;
}

/**
 * Hafta kuni qisqartmasini tarjima qilish
 */
export function getTranslatedDayName(dayKey, lang = 'uz') {
  const map = {
    'Dush': { uz: 'Dush', ru: 'Пн', en: 'Mon' },
    'Sesh': { uz: 'Sesh', ru: 'Вт', en: 'Tue' },
    'Chor': { uz: 'Chor', ru: 'Ср', en: 'Wed' },
    'Pay': { uz: 'Pay', ru: 'Чт', en: 'Thu' },
    'Juma': { uz: 'Juma', ru: 'Пт', en: 'Fri' },
    'Shan': { uz: 'Shan', ru: 'Сб', en: 'Sat' },
    'Yak': { uz: 'Yak', ru: 'Вс', en: 'Sun' }
  };
  return map[dayKey]?.[lang] || dayKey;
}


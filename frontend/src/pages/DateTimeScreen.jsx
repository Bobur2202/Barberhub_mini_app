import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Check, Users, UserPlus, AlertCircle, Sparkles, Sun, Sunrise, Moon } from 'lucide-react';
import { getTranslatedServiceName } from '../data/serviceTranslations';
import { hapticFeedback } from '../utils/haptics';

export default function DateTimeScreen({ barber, service, t, lang = 'uz', onBack, onContinue }) {
  // Generate next 7 days dynamically
  const generateDays = () => {
    const dayNames = {
      uz: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'],
      ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    const monthNames = {
      uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
      ru: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };

    const days = [];
    const today = new Date();
    const uzDayKeys = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
    const isWorkingToday = barber?.is_working_today !== false && barber?.isWorkingToday !== false;
    const daysOff = barber?.days_off || barber?.daysOff || [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayIdx = d.getDay();
      const uzKey = uzDayKeys[dayIdx];
      const dayName = (dayNames[lang] || dayNames.uz)[dayIdx];
      const monthName = (monthNames[lang] || monthNames.uz)[d.getMonth()];
      const dateNum = d.getDate();

      // Check if this day is a day off:
      // i === 0 (today) and !isWorkingToday -> day off
      // or if uzKey is in daysOff list
      const isDayOff = (i === 0 && !isWorkingToday) || daysOff.includes(uzKey);

      days.push({
        key: `day-${i}`,
        dayIdx: i,
        uzKey: uzKey,
        dayName: i === 0 ? (lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : 'Bugun') : dayName,
        dateNum: dateNum,
        full: `${dateNum}-${monthName}, ${dayName}`,
        isDayOff: isDayOff,
      });
    }
    return days;
  };

  const daysList = generateDays();
  // Default selected day: first day that is not day off, otherwise day 0
  const initialDay = daysList.find(d => !d.isDayOff) || daysList[0];
  const [selectedDay, setSelectedDay] = useState(initialDay);

  // Generate time slots based on barber's set working hours (e.g. 09:00 - 22:00)
  const generateTimeSlots = () => {
    const startStr = barber?.workHours?.start || "09:00";
    const endStr = barber?.workHours?.end || "22:00";

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const startMinutes = (startH || 9) * 60 + (startM || 0);
    const endMinutes = (endH || 22) * 60 + (endM || 0);

    // Tushlik / Tanaffus vaqti hisobi
    const breakData = barber?.breakTime || barber?.break_time;
    let breakStartMin = -1;
    let breakEndMin = -1;
    if (breakData && breakData.enabled !== false && breakData.start && breakData.end) {
      const [bsh, bsm] = breakData.start.split(':').map(Number);
      const [beh, bem] = breakData.end.split(':').map(Number);
      breakStartMin = (bsh || 13) * 60 + (bsm || 0);
      breakEndMin = (beh || 14) * 60 + (bem || 0);
    }

    const slots = [];
    let current = startMinutes;
    let idx = 0;

    while (current + 35 <= endMinutes) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Tushlik oralig'iga tushishini tekshirish
      const isBreak = breakStartMin !== -1 && current >= breakStartMin && current < breakEndMin;
      // Simulate occasional booked slots
      const isBooked = !isBreak && (idx === 1 || idx === 5 || idx === 9);

      slots.push({
        time: timeFormatted,
        status: isBreak ? 'break' : isBooked ? 'booked' : 'available'
      });

      current += 45; // 45-minute slots
      idx++;
    }

    return slots.length > 0 ? slots : [
      { time: '09:00', status: 'available' },
      { time: '10:00', status: 'booked' },
      { time: '11:00', status: 'available' },
      { time: '14:00', status: 'available' },
      { time: '15:00', status: 'available' },
      { time: '16:00', status: 'available' },
      { time: '18:00', status: 'available' },
      { time: '20:00', status: 'available' }
    ];
  };

  const timeSlots = generateTimeSlots();
  const [selectedTime, setSelectedTime] = useState(null);
  const [timePeriodFilter, setTimePeriodFilter] = useState('all'); // 'all' | 'morning' | 'afternoon' | 'evening'

  // Smart Slot Grouping (🌅 Ertalab, ☀️ Kunduz, 🌙 Kechqurun)
  const morningSlots = timeSlots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h < 12;
  });
  const afternoonSlots = timeSlots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h >= 12 && h < 17;
  });
  const eveningSlots = timeSlots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h >= 17;
  });

  const displayedSlots = timePeriodFilter === 'morning'
    ? morningSlots
    : timePeriodFilter === 'afternoon'
    ? afternoonSlots
    : timePeriodFilter === 'evening'
    ? eveningSlots
    : timeSlots;

  // 👨‍👦 Multi-person Booking State
  const [isMultiPerson, setIsMultiPerson] = useState(false);
  const [companionType, setCompanionType] = useState('child'); // 'child' | 'friend'

  // Companion details
  const companionPrice = companionType === 'child' ? 40000 : service.price;
  const companionTitle = companionType === 'child' ? (t.companion_son || "👶 O'g'lim (Bola)") : (t.companion_friend || "🙋‍♂️ Do'stim / Akam");
  const companionService = companionType === 'child' ? (t.companion_son_service || "Bolalar soch turmagi") : getTranslatedServiceName(service.name, lang);

  // Find consecutive slot if multi-person is active
  const selectedIndex = timeSlots.findIndex((s) => s.time === selectedTime);
  let secondSlot = null;
  let multiPersonError = '';

  if (isMultiPerson && selectedTime && selectedIndex !== -1) {
    const nextSlot = timeSlots[selectedIndex + 1];
    if (!nextSlot || nextSlot.status !== 'available') {
      multiPersonError = lang === 'ru'
        ? "Требуется 2 последовательных свободных времени. Следующий слот занят или на перерыве. Выберите другое время."
        : lang === 'en'
        ? "Requires 2 consecutive available slots. The next slot is booked or on break. Please choose another time."
        : "Ketma-ket 2 ta bo'sh vaqt kerak. Ushbu soatdan keyingi vaqt band yoki tushlik. Boshqa vaqtni tanlang.";
    } else {
      secondSlot = nextSlot.time;
    }
  }

  const isContinueDisabled = !selectedTime || (isMultiPerson && (!secondSlot || !!multiPersonError));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] pb-32 max-w-md mx-auto text-slate-900 dark:text-white">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#F8FAFC]/95 dark:bg-[#0B1120]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-brand-blue dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-brand-blue dark:text-white">
          {t.select_date_time}
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Selected Service Mini Banner */}
      <div className="px-4 mt-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-blue-50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 dark:text-slate-400 block">{t.service_label}:</span>
            <span className="text-xs font-bold text-brand-blue dark:text-white">
              {getTranslatedServiceName(service.name, lang)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-400 dark:text-slate-400 block">{barber.name}</span>
            <span className="text-xs font-extrabold text-brand-orange dark:text-amber-400">
              {service.price.toLocaleString()} UZS
            </span>
          </div>
        </div>

        {/* Barber Working Hours Badge */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 rounded-xl px-3 py-2 border border-blue-100/70 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-blue dark:text-amber-400" />
            <span>
              {t.work_hours_badge || "Ish vaqti"}: <strong className="text-brand-blue dark:text-white">{barber?.workHours?.start || "09:00"} — {barber?.workHours?.end || "22:00"}</strong>
            </span>
          </div>
          {barber?.is_working_today === false || barber?.isWorkingToday === false ? (
            <span className="text-red-700 dark:text-red-300 font-bold bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-1">
              <span>🔴</span>
              <span>{t.day_off_badge || "Dam olish kuni"}</span>
            </span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.open_status || "Ochiq"}</span>
            </span>
          )}
        </div>

        {/* 👨‍👦 Multi-person booking toggle card */}
        <div className="mt-2.5 bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-sm border border-blue-100 dark:border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-brand-blue dark:text-blue-300 flex items-center justify-center font-bold">
                <Users className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <span className="text-xs font-black text-brand-blue dark:text-white block">
                  {t.add_companion_btn || "+ Yana bir kishini qo'shish"}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium block">
                  {t.add_companion_hint || "O'g'lingiz yoki do'stingiz bilan ketma-ket 2 ta navbat olish"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMultiPerson(!isMultiPerson);
                setSelectedTime(null);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isMultiPerson ? 'bg-brand-orange' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  isMultiPerson ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* If Multi-person is active */}
          {isMultiPerson && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2.5 animate-in fade-in">
              <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 block">
                {lang === 'ru' ? 'Для кого запись?' : lang === 'en' ? 'Who is this booking for?' : "Kim uchun navbat olinmoqda?"}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCompanionType('child')}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all ${
                    companionType === 'child'
                      ? 'border-brand-blue dark:border-amber-500 bg-blue-50/70 dark:bg-amber-500/10 text-brand-blue dark:text-amber-400 ring-1 ring-brand-blue dark:ring-amber-500'
                      : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-extrabold block">{t.companion_son || "👶 O'g'lim (Bola)"}</span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 block">{t.companion_son_service || "Bolalar sochi (40 000 UZS)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanionType('friend')}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all ${
                    companionType === 'friend'
                      ? 'border-brand-blue dark:border-amber-500 bg-blue-50/70 dark:bg-amber-500/10 text-brand-blue dark:text-amber-400 ring-1 ring-brand-blue dark:ring-amber-500'
                      : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-extrabold block">{t.companion_friend || "🙋‍♂️ Do'stim / Akam"}</span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 block">{getTranslatedServiceName(service.name, lang)}</span>
                </button>
              </div>

              {selectedTime && secondSlot && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
                  <div>
                    <span className="block">{lang === 'ru' ? '1-я запись (Вы):' : lang === 'en' ? '1st slot (You):' : '1-navbat (Siz):'} {selectedTime}</span>
                    <span className="block">{lang === 'ru' ? '2-я запись' : lang === 'en' ? '2nd slot' : '2-navbat'} ({companionTitle}): {secondSlot}</span>
                  </div>
                  <span className="text-sm font-black text-brand-blue dark:text-white">
                    {(service.price + companionPrice).toLocaleString()} UZS
                  </span>
                </div>
              )}

              {multiPersonError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{multiPersonError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date Selection Bar */}
      <div className="px-4 mt-5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 mb-2.5">
          <Calendar className="w-4 h-4 text-brand-blue dark:text-amber-400" />
          <span>{t.choose_day}</span>
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1">
          {daysList.map((day) => {
            const isSelected = selectedDay.key === day.key;
            return (
              <button
                key={day.key}
                onClick={() => {
                  hapticFeedback.selection();
                  setSelectedDay(day);
                  setSelectedTime(null);
                }}
                className={`flex-shrink-0 w-16 py-2.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-md shadow-blue-900/20 dark:shadow-amber-500/20 scale-105'
                    : day.isDayOff
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100/50'
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border border-blue-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`text-[10px] font-medium ${
                  isSelected ? 'text-blue-100 dark:text-slate-950 font-semibold' : day.isDayOff ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-400 dark:text-slate-400'
                }`}>
                  {day.dayName}
                </span>
                <span className="text-base font-bold mt-0.5">
                  {day.dateNum}
                </span>
                {day.isDayOff && (
                  <span className={`text-[8px] font-extrabold px-1 rounded-sm mt-0.5 ${
                    isSelected ? 'bg-red-400 text-white' : 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300'
                  }`}>
                    {t.day_off_badge ? "Dam" : "Off"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Grid or Day Off Notice */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300 mb-2.5">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-brand-blue dark:text-amber-400" />
            <span>{t.choose_time}</span>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-slate-400 font-normal">
            {selectedDay.full}
          </span>
        </div>

        {selectedDay.isDayOff ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center shadow-sm border border-red-100 dark:border-red-950/50 my-2">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">
              {t.barber_not_working_today || "Usta ushbu kunda dam oladi"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t.select_another_day_notice || "Usta ushbu kunda mijozlarni qabul qilmaydi. Iltimos, boshqa ish kunini tanlang."}
            </p>
          </div>
        ) : (
          <div>
            {/* 🌅 Smart Time Period Filter Chips */}
            <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 dark:bg-slate-800/80 p-1 rounded-2xl mb-3 text-center">
              {[
                { key: 'all', label: t.period_all || 'Barchasi', count: timeSlots.filter(s => s.status === 'available').length },
                { key: 'morning', label: t.period_morning || '🌅 Ertalab', count: morningSlots.filter(s => s.status === 'available').length },
                { key: 'afternoon', label: t.period_afternoon || '☀️ Kunduz', count: afternoonSlots.filter(s => s.status === 'available').length },
                { key: 'evening', label: t.period_evening || '🌙 Oqshom', count: eveningSlots.filter(s => s.status === 'available').length },
              ].map((period) => (
                <button
                  key={period.key}
                  type="button"
                  onClick={() => {
                    hapticFeedback.selection();
                    setTimePeriodFilter(period.key);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all ${
                    timePeriodFilter === period.key
                      ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="block truncate">{period.label}</span>
                  <span className={`text-[8px] font-extrabold block ${timePeriodFilter === period.key ? 'text-amber-300 dark:text-slate-900' : 'text-gray-400 dark:text-slate-400'}`}>
                    {period.count} {lang === 'ru' ? 'свободно' : lang === 'en' ? 'open' : "bo'sh"}
                  </span>
                </button>
              ))}
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {displayedSlots.map((slot, idx) => {
                const isBreak = slot.status === 'break';
                const isBooked = slot.status === 'booked';
                const isFirstSelected = selectedTime === slot.time;
                const isSecondSelected = isMultiPerson && secondSlot === slot.time;
                const isSelected = isFirstSelected || isSecondSelected;

                // Prime hours check (17:00 - 20:30)
                const hourNum = parseInt(slot.time.split(':')[0], 10);
                const isPrime = hourNum >= 17 && hourNum <= 20 && slot.status === 'available';

                return (
                  <button
                    key={idx}
                    disabled={isBooked || isBreak}
                    onClick={() => {
                      hapticFeedback.selection();
                      setSelectedTime(slot.time);
                    }}
                    className={`py-3 rounded-xl text-center text-xs font-bold transition-all relative ${
                      isBreak
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 cursor-not-allowed opacity-80'
                        : isBooked
                        ? 'bg-gray-200/60 dark:bg-slate-800/60 text-gray-400 dark:text-slate-500 line-through cursor-not-allowed border border-transparent'
                        : isFirstSelected
                        ? 'bg-brand-blue dark:bg-amber-500 text-white dark:text-slate-950 shadow-md shadow-blue-900/25 dark:shadow-amber-500/25 ring-2 ring-brand-blue/30 dark:ring-amber-400/40 scale-[1.02]'
                        : isSecondSelected
                        ? 'bg-brand-orange dark:bg-amber-400 text-brand-blue dark:text-slate-950 font-black shadow-md ring-2 ring-brand-orange/40 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border border-blue-50 dark:border-slate-800 shadow-sm hover:border-brand-blue/40 dark:hover:border-amber-500/40'
                    }`}
                  >
                    <span>{slot.time}</span>
                    {isPrime && !isSelected && (
                      <span className="block text-[8px] font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                        {t.prime_time_badge || "🔥 Ommabop"}
                      </span>
                    )}
                    {isBreak && (
                      <span className="block text-[8px] font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">
                        ☕ Tushlik
                      </span>
                    )}
                    {isMultiPerson && isFirstSelected && (
                      <span className="block text-[8px] font-extrabold text-amber-300 dark:text-slate-950 mt-0.5">
                        1-Siz
                      </span>
                    )}
                    {isMultiPerson && isSecondSelected && (
                      <span className="block text-[8px] font-black text-brand-blue dark:text-slate-950 mt-0.5">
                        2-{companionType === 'child' ? 'Bola' : "Do'st"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-[11px] text-gray-500 dark:text-slate-400">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700"></div>
            <span>{t.slot_available}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue dark:bg-amber-500"></div>
            <span>{t.slot_selected}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span>{t.break_badge_profile || "☕ Tushlik"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-slate-700"></div>
            <span>{t.slot_booked}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 p-4 shadow-lg z-40">
        <button
          disabled={isContinueDisabled}
          onClick={() => {
            hapticFeedback.notification('success');
            onContinue({
              day: selectedDay,
              time: selectedTime,
              isMultiPerson,
              companionType,
              companionTitle,
              companionService,
              secondSlot,
              secondPrice: isMultiPerson ? companionPrice : 0,
              totalPrice: service.price + (isMultiPerson ? companionPrice : 0)
            });
          }}
          className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all ${
            !isContinueDisabled
              ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-amber-200/60 dark:bg-slate-800 text-amber-800/40 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {isMultiPerson
            ? `Davom etish (2 kishi: ${(service.price + companionPrice).toLocaleString()} UZS)`
            : t.continue_btn}
        </button>
      </div>
    </div>
  );
}

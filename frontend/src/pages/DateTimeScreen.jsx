import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Check, Users, UserPlus, AlertCircle } from 'lucide-react';
import { getTranslatedServiceName } from '../data/serviceTranslations';

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

  // 👨‍👦 Multi-person Booking State
  const [isMultiPerson, setIsMultiPerson] = useState(false);
  const [companionType, setCompanionType] = useState('child'); // 'child' | 'friend'

  // Companion details
  const companionPrice = companionType === 'child' ? 40000 : service.price;
  const companionTitle = companionType === 'child' ? "O'g'lim (Bola)" : "Do'stim / Akam";
  const companionService = companionType === 'child' ? "Bolalar soch turmagi" : service.name;

  // Find consecutive slot if multi-person is active
  const selectedIndex = timeSlots.findIndex((s) => s.time === selectedTime);
  let secondSlot = null;
  let multiPersonError = '';

  if (isMultiPerson && selectedTime && selectedIndex !== -1) {
    const nextSlot = timeSlots[selectedIndex + 1];
    if (!nextSlot || nextSlot.status !== 'available') {
      multiPersonError = "Ketma-ket 2 ta bo'sh vaqt kerak. Ushbu soatdan keyingi vaqt band yoki tushlik. Boshqa vaqtni tanlang.";
    } else {
      secondSlot = nextSlot.time;
    }
  }

  const isContinueDisabled = !selectedTime || (isMultiPerson && (!secondSlot || !!multiPersonError));

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-32 max-w-md mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 bg-[#E6EDF9]/95 backdrop-blur-sm z-30 pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-blue hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-brand-blue">
          {t.select_date_time}
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Selected Service Mini Banner */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block">{t.service_label}:</span>
            <span className="text-xs font-bold text-brand-blue">
              {getTranslatedServiceName(service.name, lang)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">{barber.name}</span>
            <span className="text-xs font-extrabold text-brand-orange">
              {service.price.toLocaleString()} UZS
            </span>
          </div>
        </div>

        {/* Barber Working Hours Badge */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 bg-white/80 rounded-xl px-3 py-2 border border-blue-100/70 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            <span>
              {t.work_hours_badge || "Ish vaqti"}: <strong className="text-brand-blue">{barber?.workHours?.start || "09:00"} — {barber?.workHours?.end || "22:00"}</strong>
            </span>
          </div>
          {barber?.is_working_today === false || barber?.isWorkingToday === false ? (
            <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-1">
              <span>🔴</span>
              <span>{t.day_off_badge || "Dam olish kuni"}</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.open_status || "Ochiq"}</span>
            </span>
          )}
        </div>

        {/* 👨‍👦 Multi-person booking toggle card */}
        <div className="mt-2.5 bg-white rounded-2xl p-3.5 shadow-sm border border-blue-100 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
                <Users className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <span className="text-xs font-black text-brand-blue block">
                  + Yana bir kishini qo'shish
                </span>
                <span className="text-[10px] text-gray-500 font-medium block">
                  O'g'lingiz yoki do'stingiz bilan ketma-ket 2 ta navbat olish
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
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 animate-in fade-in">
              <span className="text-[11px] font-bold text-gray-700 block">
                Kim uchun navbat olinmoqda?
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCompanionType('child')}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all ${
                    companionType === 'child'
                      ? 'border-brand-blue bg-blue-50/70 text-brand-blue ring-1 ring-brand-blue'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-extrabold block">👶 O'g'lim (Bola)</span>
                  <span className="text-[10px] text-gray-500 block">Bolalar sochi (40 000 UZS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanionType('friend')}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all ${
                    companionType === 'friend'
                      ? 'border-brand-blue bg-blue-50/70 text-brand-blue ring-1 ring-brand-blue'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-extrabold block">🙋‍♂️ Do'stim / Akam</span>
                  <span className="text-[10px] text-gray-500 block">{service.name}</span>
                </button>
              </div>

              {selectedTime && secondSlot && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <div>
                    <span className="block">1-navbat (Siz): {selectedTime}</span>
                    <span className="block">2-navbat ({companionTitle}): {secondSlot}</span>
                  </div>
                  <span className="text-sm font-black text-brand-blue">
                    {(service.price + companionPrice).toLocaleString()} UZS
                  </span>
                </div>
              )}

              {multiPersonError && (
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-1.5">
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
        <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 mb-2.5">
          <Calendar className="w-4 h-4 text-brand-blue" />
          <span>{t.choose_day}</span>
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1">
          {daysList.map((day) => {
            const isSelected = selectedDay.key === day.key;
            return (
              <button
                key={day.key}
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedTime(null);
                }}
                className={`flex-shrink-0 w-16 py-2.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-brand-blue text-white shadow-md shadow-blue-900/20 scale-105'
                    : day.isDayOff
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/50'
                    : 'bg-white text-gray-700 border border-blue-50 hover:bg-gray-50'
                }`}
              >
                <span className={`text-[10px] font-medium ${
                  isSelected ? 'text-blue-100' : day.isDayOff ? 'text-red-500 font-bold' : 'text-gray-400'
                }`}>
                  {day.dayName}
                </span>
                <span className="text-base font-bold mt-0.5">
                  {day.dateNum}
                </span>
                {day.isDayOff && (
                  <span className={`text-[8px] font-extrabold px-1 rounded-sm mt-0.5 ${
                    isSelected ? 'bg-red-400 text-white' : 'bg-red-100 text-red-700'
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
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-3">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-brand-blue" />
            <span>{t.choose_time}</span>
          </div>
          <span className="text-[11px] text-gray-400 font-normal">
            {selectedDay.full}
          </span>
        </div>

        {selectedDay.isDayOff ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100 my-2">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              {t.barber_not_working_today || "Usta ushbu kunda dam oladi"}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              {t.select_another_day_notice || "Usta ushbu kunda mijozlarni qabul qilmaydi. Iltimos, boshqa ish kunini tanlang."}
            </p>
          </div>
        ) : (
          /* 3-Column Grid */
          <div className="grid grid-cols-3 gap-2.5">
            {timeSlots.map((slot, idx) => {
              const isBreak = slot.status === 'break';
              const isBooked = slot.status === 'booked';
              const isFirstSelected = selectedTime === slot.time;
              const isSecondSelected = isMultiPerson && secondSlot === slot.time;
              const isSelected = isFirstSelected || isSecondSelected;

              return (
                <button
                  key={idx}
                  disabled={isBooked || isBreak}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-3 rounded-xl text-center text-xs font-bold transition-all relative ${
                    isBreak
                      ? 'bg-amber-50 text-amber-800/80 border border-amber-200 cursor-not-allowed opacity-80'
                      : isBooked
                      ? 'bg-gray-200/60 text-gray-400 line-through cursor-not-allowed border border-transparent'
                      : isFirstSelected
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-900/25 ring-2 ring-brand-blue/30 scale-[1.02]'
                      : isSecondSelected
                      ? 'bg-brand-orange text-brand-blue font-black shadow-md ring-2 ring-brand-orange/40 scale-[1.02]'
                      : 'bg-white text-gray-800 border border-blue-50 shadow-sm hover:border-brand-blue/40'
                  }`}
                >
                  <span>{slot.time}</span>
                  {isBreak && (
                    <span className="block text-[8px] font-extrabold text-amber-700 mt-0.5">
                      ☕ Tushlik
                    </span>
                  )}
                  {isMultiPerson && isFirstSelected && (
                    <span className="block text-[8px] font-extrabold text-amber-300 mt-0.5">
                      1-Siz
                    </span>
                  )}
                  {isMultiPerson && isSecondSelected && (
                    <span className="block text-[8px] font-black text-brand-blue mt-0.5">
                      2-{companionType === 'child' ? 'Bola' : "Do'st"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-[11px] text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300"></div>
            <span>{t.slot_available}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue"></div>
            <span>{t.slot_selected}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span>{t.break_badge_profile || "☕ Tushlik"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
            <span>{t.slot_booked}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-blue-100 p-4 shadow-lg z-40">
        <button
          disabled={isContinueDisabled}
          onClick={() =>
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
            })
          }
          className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all ${
            !isContinueDisabled
              ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-amber-200/60 text-amber-800/40 cursor-not-allowed'
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

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Check } from 'lucide-react';
import { getTranslatedServiceName } from '../data/serviceTranslations';

export default function DateTimeScreen({ barber, service, t, lang = 'uz', onBack, onContinue }) {
  // Generate next 7 days
  const daysList = [
    { key: 'd1', dayName: 'Dush', dateNum: '16', full: '16-Noyabr, Dushanba' },
    { key: 'd2', dayName: 'Sesh', dateNum: '17', full: '17-Noyabr, Seshanba' },
    { key: 'd3', dayName: 'Chor', dateNum: '18', full: '18-Noyabr, Chorshanba' },
    { key: 'd4', dayName: 'Pay', dateNum: '19', full: '19-Noyabr, Payshanba' },
    { key: 'd5', dayName: 'Juma', dateNum: '20', full: '20-Noyabr, Juma' },
    { key: 'd6', dayName: 'Shan', dateNum: '21', full: '21-Noyabr, Shanba' },
    { key: 'd7', dayName: 'Yak', dateNum: '22', full: '22-Noyabr, Yakshanba' },
  ];

  const [selectedDay, setSelectedDay] = useState(daysList[0]);

  // Mock time slots
  const timeSlots = [
    { time: '10:00', status: 'available' },
    { time: '10:45', status: 'booked' },
    { time: '11:30', status: 'available' },
    { time: '12:15', status: 'available' },
    { time: '14:00', status: 'booked' },
    { time: '14:45', status: 'available' },
    { time: '15:30', status: 'available' },
    { time: '16:15', status: 'available' },
    { time: '17:00', status: 'booked' },
    { time: '17:45', status: 'available' },
    { time: '18:30', status: 'available' },
    { time: '19:15', status: 'available' },
  ];

  const [selectedTime, setSelectedTime] = useState(null);

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
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 w-16 py-3 rounded-2xl text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-brand-blue text-white shadow-md shadow-blue-900/20 scale-105'
                    : 'bg-white text-gray-700 border border-blue-50 hover:bg-gray-50'
                }`}
              >
                <span className={`text-[11px] font-medium ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-base font-bold mt-0.5">
                  {day.dateNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Grid */}
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

        {/* 3-Column Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {timeSlots.map((slot, idx) => {
            const isBooked = slot.status === 'booked';
            const isSelected = selectedTime === slot.time;

            return (
              <button
                key={idx}
                disabled={isBooked}
                onClick={() => setSelectedTime(slot.time)}
                className={`py-3 rounded-xl text-center text-xs font-bold transition-all ${
                  isBooked
                    ? 'bg-gray-200/60 text-gray-400 line-through cursor-not-allowed border border-transparent'
                    : isSelected
                    ? 'bg-brand-blue text-white shadow-md shadow-blue-900/25 ring-2 ring-brand-blue/30 scale-[1.02]'
                    : 'bg-white text-gray-800 border border-blue-50 shadow-sm hover:border-brand-blue/40'
                }`}
              >
                {slot.time}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-5 text-[11px] text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300"></div>
            <span>{t.slot_available}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue"></div>
            <span>{t.slot_selected}</span>
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
          disabled={!selectedTime}
          onClick={() =>
            onContinue({
              day: selectedDay,
              time: selectedTime,
            })
          }
          className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all ${
            selectedTime
              ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-blue shadow-md shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-amber-200/60 text-amber-800/40 cursor-not-allowed'
          }`}
        >
          {t.continue_btn}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { User, Scissors, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function RoleSelectionScreen({ onSelectRole, t }) {
  return (
    <div className="min-h-screen bg-[#E6EDF9] flex flex-col justify-between px-5 py-8 max-w-md mx-auto">
      {/* Top Header */}
      <div className="pt-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-900/10 mb-3">
          <Scissors className="w-8 h-8 text-brand-orange" />
        </div>
        <h1 className="text-2xl font-black text-brand-blue tracking-tight">
          Barber<span className="text-brand-orange">Hub</span>
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Platformadan qanday maqsadda foydalanmoqchisiz?
        </p>
      </div>

      {/* Role Cards Section */}
      <div className="space-y-4 my-auto py-6">
        {/* 1. Client Card */}
        <div
          onClick={() => onSelectRole('client')}
          className="bg-white rounded-3xl p-5 shadow-sm border-2 border-transparent hover:border-brand-blue/30 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <User className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-brand-blue">
                  Men mijozman
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                O'zimga eng yaqin sartaroshlarni topish, narxlarni ko'rish va navbatga yozilish.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tezkor, bepul va qulay band qilish</span>
          </div>
        </div>

        {/* 2. Barber Card */}
        <div
          onClick={() => onSelectRole('barber')}
          className="bg-white rounded-3xl p-5 shadow-sm border-2 border-transparent hover:border-brand-orange/40 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-brand-blue transition-colors">
              <Scissors className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-brand-blue">
                  Men ustaman / Barbershop
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Sartaroshxonamni umumiy katalogga qo'shish, yangi mijozlar oqimi va navbatlarni boshqarish.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-[11px] font-semibold text-brand-orange">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS boshqaruv paneli + Telegram bildirishnomalar</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-gray-400">
          Tanlovni keyinchalik sozlamalar bo'limidan o'zgartirish mumkin
        </p>
      </div>
    </div>
  );
}

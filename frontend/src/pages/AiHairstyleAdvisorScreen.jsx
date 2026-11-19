import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Share2,
  RotateCcw,
  Star,
  MapPin,
  ChevronRight,
  Info,
  Wand2,
  Check,
  Zap,
  Scissors
} from 'lucide-react';
import { getAiHairstyleAdvice } from '../services/api';

// Namunaviy yuzlar (Agar foydalanuvchi tezda sinab ko'rmoqchi bo'lsa)
const SAMPLE_FACES = [
  {
    id: 'sample-oval',
    name: 'Oval yuz',
    shape: 'oval',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    desc: 'Ideal klassik proporsiya'
  },
  {
    id: 'sample-round',
    name: 'Dumaloq yuz',
    shape: 'round',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    desc: 'Yumshoq yonoq va kontur'
  },
  {
    id: 'sample-square',
    name: 'Kvadrat yuz',
    shape: 'square',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    desc: 'Kuchli, qat\'iy jag\' suyagi'
  }
];

export default function AiHairstyleAdvisorScreen({
  onBack,
  onSelectBarberWithStyle,
  t
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [activeHairstyleTab, setActiveHairstyleTab] = useState(0);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);

  const fileInputRef = useRef(null);

  const scanSteps = [
    "Yuz konturi va piksellari o'rganilmoqda...",
    "Peshona, yonoq va jag' proporsiyalari o'lchanmoqda...",
    "Gemini AI eng mos keladigan 3 ta zamonaviy turmakni tanlamoqda...",
    "Shu turmakni qila oladigan eng sara ustalar tayyorlanmoqda..."
  ];

  // Rasm tanlanganda yoki yuklanganda
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        startAiAnalysis(reader.result, null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Namuna yuz tanlanganda
  const handleSelectSample = (sample) => {
    startAiAnalysis(sample.avatar, sample.shape);
  };

  // AI tahlilini ishga tushirish
  const startAiAnalysis = async (imgData, faceShapeHint) => {
    setSelectedImage(imgData);
    setIsScanning(true);
    setAiResult(null);
    setScanStepIndex(0);

    // Qadamlar animatsiyasi (UX uchun ajoyib effekt)
    const interval = setInterval(() => {
      setScanStepIndex((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await getAiHairstyleAdvice({
        image_base64: imgData,
        face_shape_hint: faceShapeHint
      });

      setTimeout(() => {
        clearInterval(interval);
        setIsScanning(false);
        setAiResult(res);
        setActiveHairstyleTab(0);
      }, 2600);
    } catch (err) {
      clearInterval(interval);
      setIsScanning(false);
      console.error('AI tahlil xatosi:', err);
    }
  };

  // Natijani Telegram orqali do'stlarga ulashish
  const handleShareResult = () => {
    if (!aiResult) return;
    const shareText = `🔥 Men BarberHub AI Sartarosh Maslahatchisidan foydalandim!\n\n` +
      `Mening yuz shaklim: ${aiResult.face_shape_uz}\n` +
      `Menga tavsiya etilgan turmaklar: ${aiResult.hairstyles.map((h) => h.uz_name).join(', ')}.\n\n` +
      `Siz ham o'zingizga mos soch turmagini AI orqali bilib oling! 💈`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/BarberHub_mini_bot')}&text=${encodeURIComponent(shareText)}`;
      window.Telegram.WebApp.openTelegramLink(tgUrl);
    } else if (navigator.share) {
      navigator.share({
        title: 'BarberHub AI Sartarosh Maslahatchisi',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShareSuccessToast(true);
      setTimeout(() => setShareSuccessToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EDF9] pb-24 max-w-md mx-auto">
      {/* Toast */}
      {shareSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center space-x-1.5 animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>Natija nusxalandi! Do'stlaringizga yuboring.</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#003865] via-[#004B86] to-[#0A66C2] text-white px-4 pt-5 pb-6 shadow-md relative overflow-hidden">
        {/* Orqa fondagi yorqin nurlar */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
            <span className="text-[11px] font-black tracking-wide uppercase text-amber-300">
              Gemini AI Vision
            </span>
          </div>

          <div className="w-9" />
        </div>

        <div className="text-center mt-3 relative z-10">
          <h1 className="text-xl font-black tracking-tight flex items-center justify-center space-x-1.5">
            <span>AI Sartarosh Maslahatchisi</span>
          </h1>
          <p className="text-xs text-blue-100 font-medium mt-1 max-w-xs mx-auto">
            Yuz tuzilishingizga 100% mos keladigan 3 xil zamonaviy turmak va uni qila oladigan ustalarni toping
          </p>
        </div>
      </div>

      {/* ASOSIY QISM */}
      <div className="px-4 mt-4">
        {/* 1. SKANERLASH JARAYONI (SCANNING ANIMATION) */}
        {isScanning && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-100 text-center animate-in fade-in">
            <div className="relative w-44 h-44 mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-brand-blue mb-4">
              <img
                src={selectedImage}
                alt="Scanning face"
                className="w-full h-full object-cover filter brightness-95"
              />
              
              {/* Lazer nuri harakati */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse"
                style={{
                  top: `${(scanStepIndex + 1) * 22}%`,
                  transition: 'top 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />

              {/* Grid to'r overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-blue-900/30" />
            </div>

            <div className="flex items-center justify-center space-x-2 text-brand-blue font-black text-sm mb-2">
              <Wand2 className="w-4 h-4 animate-spin text-brand-orange" />
              <span>Yuz tuzilishi tahlil qilinmoqda...</span>
            </div>

            {/* Qadamlar ro'yxati */}
            <div className="space-y-2 mt-4 text-left max-w-xs mx-auto">
              {scanSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 text-xs transition-all ${
                    idx <= scanStepIndex ? 'text-gray-800 font-semibold' : 'text-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    idx < scanStepIndex
                      ? 'bg-emerald-500 text-white'
                      : idx === scanStepIndex
                      ? 'bg-brand-blue text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {idx < scanStepIndex ? '✓' : idx + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. RASM YUKLASH BO'LIMI (Agar hali tahlil qilinmagan bo'lsa) */}
        {!isScanning && !aiResult && (
          <div className="space-y-4">
            {/* Foto yuklash kartasi */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-dashed border-blue-200 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-blue-600 flex items-center justify-center mx-auto text-white shadow-md shadow-blue-900/15 mb-3">
                <Camera className="w-8 h-8 text-brand-orange" />
              </div>

              <h2 className="text-base font-extrabold text-brand-blue">
                Yuz rasmingizni yuklang yoki selfi oling
              </h2>
              <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed max-w-xs mx-auto">
                Gemini AI yuzingiz tuzilishini (oval, dumaloq, kvadrat) aniqlab, ideal 3 ta soch turmagini tavsiya etadi.
              </p>

              <div className="flex flex-col space-y-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl bg-brand-blue text-white font-extrabold text-sm shadow-md hover:bg-brand-blue/90 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4 text-brand-orange" />
                  <span>Kamera / Rasm yuklash</span>
                </button>
              </div>

              {/* Maslahat */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 font-medium">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Aniqroq natija uchun: to'g'riga qarang va yaxshi yorug'likda tushing.</span>
              </div>
            </div>

            {/* Namuna sifatida sinab ko'rish */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-brand-orange" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Yoki namunani tanlab sinab ko'ring:
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {SAMPLE_FACES.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="bg-blue-50/60 hover:bg-blue-100/60 rounded-2xl p-2.5 text-center cursor-pointer active:scale-95 transition-all border border-blue-100 group"
                  >
                    <div className="w-14 h-14 rounded-full mx-auto overflow-hidden shadow-xs border border-white mb-1.5 group-hover:scale-105 transition-transform">
                      <img
                        src={sample.avatar}
                        alt={sample.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-brand-blue block">
                      {sample.name}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium block truncate">
                      {sample.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. AI TAHLIL NATIJALARI (RESULTS VIEW) */}
        {!isScanning && aiResult && (
          <div className="space-y-4 animate-in fade-in">
            {/* Yuz shakli kartasi */}
            <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-3xl p-5 shadow-sm border border-blue-100">
              <div className="flex items-start space-x-3.5">
                {selectedImage && (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-brand-blue/30 shrink-0">
                    <img
                      src={selectedImage}
                      alt="Analyzed face"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue font-black text-[10px] uppercase tracking-wider">
                      Aniqlangan Yuz Shakli
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-brand-blue mt-0.5">
                    {aiResult.face_shape_uz}
                  </h2>
                  <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">
                    {aiResult.analysis_summary}
                  </p>
                </div>
              </div>

              {/* Xususiyatlar */}
              {aiResult.features_uz?.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-1.5">
                  {aiResult.features_uz.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-[11px] text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Turmaklarni tanlash tablari */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center space-x-1">
                  <Scissors className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Sizga mos 3 xil zamonaviy turmak:</span>
                </h3>
                <span className="text-[10px] font-bold text-brand-blue">
                  {activeHairstyleTab + 1} / 3
                </span>
              </div>

              {/* Tabs header */}
              <div className="flex space-x-1.5 bg-white/80 p-1 rounded-2xl border border-blue-100 mb-3 shadow-xs">
                {aiResult.hairstyles?.map((style, idx) => (
                  <button
                    key={style.id}
                    onClick={() => setActiveHairstyleTab(idx)}
                    className={`flex-1 py-2 px-1 text-center rounded-xl text-[11px] font-black transition-all ${
                      activeHairstyleTab === idx
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'text-gray-500 hover:text-brand-blue hover:bg-gray-50'
                    }`}
                  >
                    #{idx + 1} {style.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Faol turmak kartasi */}
              {aiResult.hairstyles?.[activeHairstyleTab] && (() => {
                const style = aiResult.hairstyles[activeHairstyleTab];
                return (
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-blue-100 animate-in fade-in">
                    {/* Rasm qismi */}
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                      <img
                        src={style.image_url}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3 bg-brand-orange text-brand-blue font-black text-[10px] px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">
                        {style.tag}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">
                          Tavsiya etilgan turmak
                        </span>
                        <h4 className="text-lg font-black text-white leading-tight">
                          {style.uz_name}
                        </h4>
                        <span className="text-xs text-gray-300 font-medium">
                          ({style.name})
                        </span>
                      </div>
                    </div>

                    {/* Tafsilotlar */}
                    <div className="p-4 space-y-3.5">
                      {/* Nima uchun sizga mos? */}
                      <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-100/60">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-wide block mb-1">
                          💡 Nima uchun aynan sizga mos?
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {style.why_fit}
                        </p>
                      </div>

                      {/* Styling va parvarish */}
                      <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-100/60">
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide block mb-1">
                          ✂️ Uyda qanday shakl berish (Styling)?
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {style.styling_tip}
                        </p>
                        <div className="mt-2 pt-2 border-t border-amber-200/50 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-semibold">Tavsiya etilgan vosita:</span>
                          <span className="font-extrabold text-amber-900">{style.recommended_product}</span>
                        </div>
                      </div>

                      {/* Shu turmakni qila oladigan ustalar */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-black text-gray-800 flex items-center space-x-1">
                            <span>Yaqin atrofdagi mutaxassis ustalar:</span>
                          </h5>
                          <span className="text-[10px] font-semibold text-gray-400">
                            Reyting bo'yicha
                          </span>
                        </div>

                        <div className="space-y-2">
                          {style.matching_barbers?.map((barber) => (
                            <div
                              key={barber.id}
                              className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={barber.avatar}
                                  alt={barber.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-white shadow-xs"
                                />
                                <div>
                                  <h6 className="font-extrabold text-xs text-gray-900">
                                    {barber.name}
                                  </h6>
                                  <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                                    <span className="flex items-center text-amber-500 font-bold">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                      {barber.rating}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center text-gray-400">
                                      <MapPin className="w-3 h-3 mr-0.5" />
                                      {barber.distance}
                                    </span>
                                    <span>•</span>
                                    <span className="font-black text-brand-blue">
                                      {barber.price?.toLocaleString()} so'm
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => onSelectBarberWithStyle(barber, style)}
                                className="px-3 py-1.5 rounded-xl bg-brand-blue text-white font-extrabold text-[11px] shadow-xs hover:bg-brand-blue/90 active:scale-95 transition-all flex items-center space-x-1"
                              >
                                <span>Navbat</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Tugmalar: Qayta sinash va Ulashish */}
            <div className="flex space-x-2.5 pt-2">
              <button
                onClick={() => {
                  setAiResult(null);
                  setSelectedImage(null);
                }}
                className="flex-1 py-3 px-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs shadow-xs hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Boshqa rasm</span>
              </button>

              <button
                onClick={handleShareResult}
                className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-brand-blue to-blue-700 text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-brand-orange" />
                <span>Do'stlarga ulashish</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
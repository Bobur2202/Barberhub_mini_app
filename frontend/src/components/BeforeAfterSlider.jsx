import React, { useState, useRef, useCallback } from 'react';
import { Scissors, Sparkles } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title,
  styleName,
  description,
  t = {},
  lang = 'uz'
}) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const displayTitle = title || (lang === 'ru' ? 'До и После' : lang === 'en' ? 'Before & After' : 'Oldin va Keyin');
  const displayStyle = styleName || (lang === 'ru' ? 'Трансформация' : lang === 'en' ? 'Transformation' : 'Transformatsiya');

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-blue-50">
      {/* Title & Tag */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange block">
            {displayStyle}
          </span>
          <h4 className="text-xs font-black text-brand-blue">
            {displayTitle}
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          <span>{t.slider_drag_hint || (lang === 'ru' ? 'Потяните' : lang === 'en' ? 'Slide' : "Surib ko'ring")}</span>
          <span>⟷</span>
        </div>
      </div>

      {/* Interactive Slider Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative h-64 w-full select-none overflow-hidden cursor-ew-resize bg-gray-900"
      >
        {/* AFTER IMAGE (Bottom layer) */}
        <img
          src={afterImage}
          alt="After haircut"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
          {t.slider_after || (lang === 'ru' ? 'ПОСЛЕ ✨' : lang === 'en' ? 'AFTER ✨' : 'KEYIN ✨')}
        </div>

        {/* BEFORE IMAGE (Top layer clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Before haircut"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              height: '100%'
            }}
          />
          <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {t.slider_before || (lang === 'ru' ? 'ДО ✂️' : lang === 'en' ? 'BEFORE ✂️' : 'OLDIN ✂️')}
          </div>
        </div>

        {/* DRAGGABLE DIVIDER LINE */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          {/* Circular Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-brand-blue shadow-lg border-2 border-brand-orange flex items-center justify-center pointer-events-none">
            <span className="text-[12px] font-black">⟷</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="p-3 bg-gray-50/70 border-t border-gray-100 text-[11px] text-gray-600 leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}
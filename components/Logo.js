"use client";

import React from "react";

export default function Logo({ size = "md", showText = false, textClassName = "" }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  const iconSizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-3">
      {/* Icon Badge */}
      <div
        className={`${iconSizeClass} rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#0891b2] to-[#0e7490] p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center shrink-0 relative overflow-hidden group`}
      >
        {/* Subtle glossy sheen */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/15 to-white/30 pointer-events-none rounded-2xl" />

        <svg
          className="w-3/5 h-3/5 text-white drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="srToothGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>
            <linearGradient id="srSmileGrad" x1="8" y1="17" x2="24" y2="17" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0891B2" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Molar Tooth Crown Shape (Modern, Rounded, Anatomical & Elegant) */}
          <path
            d="M8.2 6.5C10.5 5.5 13.5 6.2 16 7.8C18.5 6.2 21.5 5.5 23.8 6.5C26.5 7.7 27.5 11 26.5 15C25.3 19.8 23.5 24 21.2 26.5C19.7 28.1 17.8 26.5 16.8 24C16.4 23 15.6 23 15.2 24C14.2 26.5 12.3 28.1 10.8 26.5C8.5 24 6.7 19.8 5.5 15C4.5 11 5.5 7.7 8.2 6.5Z"
            fill="url(#srToothGrad)"
            stroke="white"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Radiant Smile Arc (Senyum Rekah) */}
          <path
            d="M10 14.5C11.8 18 20.2 18 22 14.5"
            stroke="url(#srSmileGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Central Gleam / Sparkle accent */}
          <circle cx="21" cy="9.5" r="1.2" fill="#38BDF8" />
        </svg>
      </div>

      {showText && (
        <div className={textClassName}>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
            Senyum Rekah
          </span>
          <span className="text-[10px] tracking-wider uppercase font-bold text-cyan-600 block">
            Klinik Gigi
          </span>
        </div>
      )}
    </div>
  );
}

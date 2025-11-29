"use client";
import React from 'react';

export default function AIGauge({ value, label, subtitle }: { value: number; label?: string; subtitle?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = 60;
  const circumference = Math.PI * radius; // half circle
  const progress = (pct / 100) * circumference;

  return (
    <div className="relative w-full flex flex-col items-center">
      <svg width={radius*2} height={radius+40} viewBox={`0 0 ${radius*2} ${radius+40}`}>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d9ff" />
            <stop offset="100%" stopColor="#7928ca" />
          </linearGradient>
        </defs>
        <path d={`M ${radius*2-10} ${radius} A ${radius} ${radius} 0 0 0 10 ${radius}`} fill="none" stroke="#1f2937" strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${radius*2-10} ${radius} A ${radius} ${radius} 0 0 0 10 ${radius}`} fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`} />
        <circle cx={radius} cy={radius} r={22} fill="#0f172a" />
        <text x={radius} y={radius+6} textAnchor="middle" fill="#60a5fa" fontSize="16">☺</text>
      </svg>
      <div className="-mt-4 text-center">
        <div className="text-2xl font-bold text-white">{label ?? `${pct}%`}</div>
        {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export type GradientPreset =
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'purple'
  | 'slate'
  | 'green';

interface PremiumCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  gradient?: GradientPreset;
  trend?: string;
  trendUp?: boolean;
  href?: string;
  className?: string;
}

const gradientClasses: Record<GradientPreset, { bg: string; shadow: string }> = {
  violet: {
    bg: 'from-violet-600 to-indigo-700',
    shadow: 'shadow-violet-500/20',
  },
  emerald: {
    bg: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
  },
  amber: {
    bg: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/20',
  },
  rose: {
    bg: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/20',
  },
  cyan: {
    bg: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20',
  },
  purple: {
    bg: 'from-purple-500 to-violet-600',
    shadow: 'shadow-purple-500/20',
  },
  slate: {
    bg: 'from-slate-600 to-slate-800',
    shadow: 'shadow-slate-500/20',
  },
  green: {
    bg: 'from-green-500 to-emerald-600',
    shadow: 'shadow-green-500/20',
  },
};

export default function PremiumCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'violet',
  trend,
  trendUp = true,
  href,
  className = '',
}: PremiumCardProps) {
  const config = gradientClasses[gradient] || gradientClasses.violet;

  // Split title if it contains parenthesized English text e.g. "کل حجاج و زائرین (TOTAL HUJJAJ)"
  const titleMatch = typeof title === 'string' ? title.match(/^(.*?)\s*\((.*?)\)$/) : null;
  const urduPart = titleMatch ? titleMatch[1].trim() : title;
  const engPart = titleMatch ? titleMatch[2].trim() : null;
  const hasUrdu = /[\u0600-\u06FF]/.test(urduPart);

  const content = (
    <div
      style={{
        transform: 'none',
        rotate: '0deg',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
        textAlign: 'right',
        gap: '8px',
      }}
      className={`w-full h-full min-h-[160px] relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${config.bg} shadow-lg ${config.shadow} border border-white/10 flex flex-col gap-2 ${className}`}
      dir="rtl"
    >
      {/* 1. Title at top: flex row between title and icon */}
      <div className="flex items-start justify-between gap-3 w-full" dir="rtl">
        <div className="text-right min-w-0 flex-1">
          <p
            className="font-urdu text-[16px] sm:text-[17px] font-bold text-white text-right leading-tight not-italic m-0"
            dir="rtl"
            style={{ fontStyle: 'normal' }}
          >
            {urduPart}
          </p>
          {engPart && (
            <p
              className="font-english text-[10px] text-white/80 font-medium tracking-wide uppercase mt-0.5 text-right"
              dir="ltr"
            >
              ({engPart})
            </p>
          )}
        </div>
        <div className="bg-white/20 p-2 rounded-xl flex items-center justify-center text-white shrink-0">
          {React.isValidElement(Icon) ? (
            Icon
          ) : Icon ? (
            <Icon className="w-5 h-5 text-white" />
          ) : null}
        </div>
      </div>

      {/* 2. Big number in middle: font-size 28px, not overlapping */}
      <div className="w-full text-right my-auto py-1">
        <span
          className="font-english text-white font-black tracking-tight inline-block text-right leading-none"
          style={{ fontSize: '28px', lineHeight: '1.2' }}
          dir="ltr"
        >
          {value}
        </span>
      </div>

      {/* 3. Subtitle below */}
      {subtitle && (
        <p
          className="font-urdu text-white/80 text-xs text-right leading-normal not-italic m-0"
          dir="rtl"
          style={{ fontStyle: 'normal' }}
        >
          {subtitle}
        </p>
      )}

      {/* 4. Trend / Badge at bottom (inside card, not absolute over text) */}
      {trend && (
        <div
          className="pt-2 mt-auto border-t border-white/10 flex items-center justify-between text-[11px] text-white/90"
          dir="rtl"
        >
          <span className="flex items-center gap-1.5 font-medium">
            {trendUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-white shrink-0" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
            )}
            {trend}
          </span>
          <ArrowUpRight className="w-3 h-3 opacity-70 shrink-0" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full" style={{ transform: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}


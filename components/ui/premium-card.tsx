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
      style={{ transform: 'none', rotate: '0deg' }}
      className={`w-full h-full min-h-[165px] md:min-h-[175px] relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${config.bg} shadow-lg ${config.shadow} border border-white/10 flex flex-col justify-between ${className}`}
    >
      <div className="h-full flex flex-col justify-between transform-none" style={{ transform: 'none' }}>
        {/* TOP CONTENT: TITLE + ICON */}
        <div className="flex justify-between items-start gap-3 transform-none" style={{ transform: 'none' }}>
          <div className="transform-none min-w-0" style={{ transform: 'none' }}>
            <p
              className="font-urdu text-[17px] leading-[1.6] transform-none rotate-0 not-italic text-white"
              dir="rtl"
              style={{ transform: 'none', fontStyle: 'normal' }}
            >
              {urduPart}
            </p>
            {engPart && (
              <p
                className="font-english text-[11px] opacity-80 tracking-wide transform-none uppercase text-white/80"
                dir="ltr"
                style={{ transform: 'none' }}
              >
                ({engPart})
              </p>
            )}
          </div>
          <div
            className="bg-white/20 p-2.5 rounded-xl transform-none flex items-center justify-center text-white shrink-0"
            style={{ transform: 'none' }}
          >
            {React.isValidElement(Icon) ? (
              Icon
            ) : Icon ? (
              <Icon className="w-5 h-5 text-white" />
            ) : null}
          </div>
        </div>

        {/* BOTTOM CONTENT: NUMBER + SUBTITLE + TREND */}
        <div className="mt-auto pt-2 transform-none" style={{ transform: 'none' }}>
          <p
            className="font-english text-[26px] font-bold mt-2 transform-none text-white block leading-tight tracking-tight"
            dir="ltr"
            style={{ transform: 'none' }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="font-urdu text-white/80 text-xs mt-1 transform-none not-italic leading-relaxed"
              dir="rtl"
              style={{ transform: 'none' }}
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className="relative z-10 pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/85"
              dir="auto"
              style={{ transform: 'none' }}
            >
              <span className="flex items-center gap-1.5 font-medium leading-normal">
                {trendUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
                )}
                {trend}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70 shrink-0" />
            </div>
          )}
        </div>
      </div>
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


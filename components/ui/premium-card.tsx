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
      className={`w-full relative overflow-hidden rounded-2xl p-5 min-h-[140px] text-white bg-gradient-to-br ${config.bg} shadow-lg ${config.shadow} border border-white/10 flex flex-col justify-between ${className}`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-2" style={{ transform: 'none' }}>
          <div
            className={`flex flex-col min-w-0 ${hasUrdu ? 'text-right' : 'text-left'}`}
            dir={hasUrdu ? 'rtl' : 'ltr'}
            style={{ transform: 'none' }}
          >
            <span
              className={`${hasUrdu ? 'font-urdu text-[15px]' : 'font-sans text-sm font-bold'} font-medium leading-[1.8] text-white tracking-normal break-words`}
            >
              {urduPart}
            </span>
            {engPart && (
              <span
                className="font-sans text-[11px] font-semibold uppercase tracking-wider text-white/70 mt-0.5"
                dir="ltr"
              >
                ({engPart})
              </span>
            )}
          </div>
          <div
            className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner flex-shrink-0"
            style={{ transform: 'none' }}
          >
            {React.isValidElement(Icon) ? (
              Icon
            ) : Icon ? (
              <Icon className="w-4 h-4 text-white" />
            ) : null}
          </div>
        </div>

        <div className="mt-2 text-left" dir="ltr" style={{ transform: 'none' }}>
          <span className="text-2xl font-bold tracking-tight text-white block">
            {value}
          </span>
          {subtitle && (
            <p className="text-white/80 text-[11px] sm:text-xs mt-1 font-medium leading-relaxed" dir="auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {trend && (
        <div
          className="relative z-10 pt-2.5 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/85"
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
  );

  if (href) {
    return (
      <Link href={href} className="block" style={{ transform: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}


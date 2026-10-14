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

  const content = (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 min-h-[110px] text-white bg-gradient-to-br ${config.bg} shadow-lg ${config.shadow} border border-white/10 group hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      {/* 10% Opacity Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
          backgroundSize: '12px 12px',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide truncate max-w-[80%]">
            {title}
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner flex-shrink-0">
            {React.isValidElement(Icon) ? (
              Icon
            ) : Icon ? (
              <Icon className="w-4 h-4 text-white" />
            ) : null}
          </div>
        </div>

        <div>
          <span className="text-xl font-bold tracking-tight text-white block">
            {value}
          </span>
          {subtitle && (
            <p className="text-white/80 text-[11px] mt-0.5 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {trend && (
        <div className="relative z-10 pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
          <span className="flex items-center gap-1 font-medium">
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3 text-white" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-white/80" />
            )}
            {trend}
          </span>
          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

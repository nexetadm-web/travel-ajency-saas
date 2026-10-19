'use client';

import React from 'react';
import PremiumCard, { GradientPreset } from './ui/premium-card';

export interface StatCardProps {
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

export default function StatCard(props: StatCardProps) {
  return <PremiumCard {...props} />;
}

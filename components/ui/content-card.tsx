'use client';

import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  headerBorder?: boolean;
}

export default function ContentCard({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
}: ContentCardProps) {
  return (
    <div
      className={`w-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 ${
            headerBorder ? 'border-b border-gray-100' : ''
          }`}
        >
          <div>
            {title && (
              <h2 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  maxWidth?: string; // e.g. '600px', '750px', '900px'
  headerExtra?: React.ReactNode;
  zIndex?: number;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  onSubmit,
  maxWidth = '600px',
  headerExtra,
  zIndex = 9999,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex,
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: flex-shrink: 0, sticky top, with X close button */}
        <div
          className="border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 bg-white sticky top-0"
          style={{
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'white',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold transition shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            {headerExtra}
          </div>

          <div className="min-w-0 text-right" dir="rtl">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Modal Form / Body & Footer */}
        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Modal Body: flex: 1, overflow-y: auto, padding: 20px */}
            <div
              className="flex-1 overflow-y-auto space-y-4"
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                padding: '20px',
              }}
            >
              {children}
            </div>

            {/* Modal Footer: flex-shrink: 0, sticky bottom, always visible */}
            {footer && (
              <div
                className="border-t border-gray-100 px-6 py-3.5 flex items-center justify-end gap-3 shrink-0 bg-gray-50/90 sticky bottom-0"
                style={{
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 10,
                  background: '#f8fafc',
                }}
              >
                {footer}
              </div>
            )}
          </form>
        ) : (
          <>
            {/* Modal Body: flex: 1, overflow-y: auto, padding: 20px */}
            <div
              className="flex-1 overflow-y-auto space-y-4"
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                padding: '20px',
              }}
            >
              {children}
            </div>

            {/* Modal Footer: flex-shrink: 0, sticky bottom, always visible */}
            {footer && (
              <div
                className="border-t border-gray-100 px-6 py-3.5 flex items-center justify-end gap-3 shrink-0 bg-gray-50/90 sticky bottom-0"
                style={{
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 10,
                  background: '#f8fafc',
                }}
              >
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

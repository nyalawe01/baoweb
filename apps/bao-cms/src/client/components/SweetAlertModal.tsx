import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, X } from 'lucide-react';

export interface SweetAlertOptions {
  type: 'loading' | 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  websiteUrl?: string;
  websiteLabel?: string;
  confirmText?: string;
  confirmLabel?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

export function SweetAlertModal({
  alert,
  onClose,
}: {
  alert: SweetAlertOptions | null;
  onClose: () => void;
}) {
  if (!alert) return null;

  const isLoading = alert.type === 'loading';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-[#E6A500] p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex justify-center pt-2">
          {alert.type === 'loading' && (
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#E6A500]/20 border-t-[#E6A500] animate-spin" />
              <Loader2 className="w-8 h-8 text-[#E6A500] animate-spin absolute" />
            </div>
          )}
          {alert.type === 'success' && (
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500/30 flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 stroke-[2.5]" />
            </div>
          )}
          {alert.type === 'error' && (
            <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-500/30 flex items-center justify-center animate-in zoom-in-50 duration-300">
              <AlertCircle className="w-12 h-12 text-red-600 stroke-[2.5]" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-black tracking-tight">{alert.title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{alert.message}</p>
          {alert.details && (
            <div className="mt-3 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-600 text-left overflow-x-auto">
              {alert.details}
            </div>
          )}
        </div>

        {alert.type === 'loading' && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#E6A500] h-1.5 rounded-full animate-pulse w-3/4 mx-auto" />
          </div>
        )}

        {!isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            {alert.websiteUrl && (
              <a
                href={alert.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <span>{alert.websiteLabel || 'View on Website ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => {
                if (alert.onConfirm) alert.onConfirm();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E6A500] hover:bg-[#d49700] text-black font-extrabold text-xs transition shadow-xs cursor-pointer"
            >
              {alert.confirmText || 'Done / Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


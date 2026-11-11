import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

/**
 * Broadcasts a live update signal to any open tabs/windows of the website.
 */
export function broadcastLivePublish(info?: { module?: string; key?: string }) {
  try {
    const channel = new BroadcastChannel('bao_live_sync');
    channel.postMessage({
      type: 'CONTENT_UPDATED',
      module: info?.module || 'cms',
      key: info?.key,
      timestamp: Date.now(),
    });
    channel.close();
  } catch {
    // BroadcastChannel unsupported or blocked in iframe
  }

  try {
    localStorage.setItem(
      'bao_live_content_timestamp',
      JSON.stringify({
        module: info?.module || 'cms',
        key: info?.key,
        timestamp: Date.now(),
      })
    );
  } catch {
    // localStorage blocked
  }
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Visual badge displaying the real-time auto-save & auto-publish status to the user.
 */
export function AutoSaveStatusBadge({
  status,
  lastSaved,
  className = '',
}: {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  className?: string;
}) {
  const formatTime = (d: Date | null) => {
    if (!d) return 'Just now';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (status === 'saving') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs transition animate-pulse ${className}`}
        title="Automatically saving and publishing your edits to the live website..."
      >
        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        <span>Saving & publishing live...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs transition ${className}`}
        title="Failed to auto-save to database. Check network connection."
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Auto-save failed</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs transition ${className}`}
      title="All changes are automatically saved and published to the live website."
    >
      <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
      <span>
        Auto-published live {lastSaved ? `(${formatTime(lastSaved)})` : '(Active)'}
      </span>
    </div>
  );
}

/**
 * Reusable hook to debouncely auto-save & publish state changes to Supabase and the live website.
 */
export function useAutoSaveAndPublish({
  saveFn,
  isDirty,
  debounceMs = 1200,
  moduleName,
}: {
  saveFn: () => Promise<void>;
  isDirty: boolean;
  debounceMs?: number;
  moduleName?: string;
}) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;
  const timerRef = useRef<any>(null);

  const executeSave = useCallback(async () => {
    setStatus('saving');
    try {
      await saveFnRef.current();
      broadcastLivePublish({ module: moduleName });
      setStatus('saved');
      setLastSaved(new Date());
    } catch (err) {
      console.error('[AutoSave Error]', err);
      setStatus('error');
    }
  }, [moduleName]);

  useEffect(() => {
    if (!isDirty) return;

    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      executeSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, debounceMs, executeSave]);

  return {
    status,
    lastSaved,
    triggerImmediateSave: executeSave,
  };
}


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
export function AutoSaveStatusBadge(_props?: {
  status?: AutoSaveStatus;
  lastSaved?: Date | null;
  className?: string;
}) {
  return null;
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


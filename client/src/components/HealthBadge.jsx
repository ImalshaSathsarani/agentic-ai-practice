import React, { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../services/api';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';

export default function HealthBadge() {
  const [health, setHealth] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getHealth();
      setHealth(data);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const formatUptime = (seconds) => {
    if (typeof seconds !== 'number') return '0s';
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      data-testid="health-badge"
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm bg-white/90 backdrop-blur"
      style={{
        borderColor: isError ? '#fecdd3' : '#bbf7d0',
      }}
    >
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        {isError ? (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
        ) : isLoading && !health ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        ) : (
          <>
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </>
        )}
      </div>

      <div data-testid="health-status" className="flex items-center gap-1.5 text-slate-700">
        {isError ? (
          <span className="text-rose-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Backend Offline
          </span>
        ) : isLoading && !health ? (
          <span className="text-amber-600 font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Connecting...
          </span>
        ) : (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            Healthy &middot; <span className="text-slate-500 font-normal">Uptime {formatUptime(health?.uptime)}</span>
          </span>
        )}
      </div>
    </div>
  );
}

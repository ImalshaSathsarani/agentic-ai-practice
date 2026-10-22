import React from 'react';
import HealthBadge from './HealthBadge';
import { KanbanSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">TaskPulse</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Kanban &amp; Real-time System Health Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <HealthBadge />
        </div>
      </div>
    </header>
  );
}

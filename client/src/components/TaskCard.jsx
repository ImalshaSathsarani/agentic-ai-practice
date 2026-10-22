import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Trash2, Clock, CheckCircle2, AlertCircle, CircleDot } from 'lucide-react';

const PRIORITY_CONFIG = {
  high: {
    label: 'High Priority',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  medium: {
    label: 'Medium Priority',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  low: {
    label: 'Low Priority',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};

export default function TaskCard({ task, onUpdateStatus, onDeleteTask }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const getNextStatus = () => {
    if (task.status === 'todo') return { next: 'in-progress', label: 'Start Progress' };
    if (task.status === 'in-progress') return { next: 'done', label: 'Mark Complete' };
    return { next: 'todo', label: 'Reopen' };
  };

  const getPrevStatus = () => {
    if (task.status === 'done') return { prev: 'in-progress', label: 'To In Progress' };
    if (task.status === 'in-progress') return { prev: 'todo', label: 'To To Do' };
    return null;
  };

  const { next: nextStatus, label: nextLabel } = getNextStatus();
  const prevInfo = getPrevStatus();

  const handleAdvance = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(task.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStepBack = async () => {
    if (!prevInfo) return;
    try {
      setIsUpdating(true);
      await onUpdateStatus(task.id, prevInfo.prev);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteTask(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      data-testid="task-card"
      id={`task-card-${task.id}`}
      className="group bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition-all duration-150 flex flex-col justify-between"
    >
      <div data-testid={`task-card-${task.id}`} className="space-y-3">
        {/* Card Header: Priority & Delete */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
            {priorityInfo.label}
          </span>

          <button
            type="button"
            data-testid="delete-task-btn"
            id={`delete-task-${task.id}`}
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 disabled:opacity-40 transition cursor-pointer"
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            <span data-testid={`delete-task-${task.id}`} className="inline-flex items-center">
              <Trash2 className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Task Title */}
        <h4 className="text-sm font-medium text-slate-900 leading-snug break-words">
          {task.title}
        </h4>

        {/* Timestamp */}
        {task.createdAt && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Created {formatDate(task.createdAt)}</span>
          </div>
        )}
      </div>

      {/* Card Actions: Move buttons */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {prevInfo ? (
          <button
            type="button"
            onClick={handleStepBack}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
            title={prevInfo.label}
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          data-testid="move-task-btn"
          id={`move-task-${task.id}`}
          onClick={handleAdvance}
          disabled={isUpdating || isDeleting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 disabled:opacity-40 transition cursor-pointer shadow-xs ml-auto"
          title={`Move task to ${nextStatus}`}
        >
          <span
            data-testid={`move-task-${task.id}`}
            className="inline-flex items-center gap-1"
          >
            <span>{nextLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    </div>
  );
}

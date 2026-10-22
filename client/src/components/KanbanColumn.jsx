import React from 'react';
import TaskCard from './TaskCard';
import { Circle, Clock3, CheckCircle2 } from 'lucide-react';

const COLUMN_META = {
  todo: {
    title: 'To Do',
    icon: Circle,
    headerBg: 'bg-slate-100/80',
    badgeClass: 'bg-slate-200 text-slate-700',
    borderClass: 'border-slate-200',
    dotClass: 'bg-slate-400',
  },
  'in-progress': {
    title: 'In Progress',
    icon: Clock3,
    headerBg: 'bg-amber-50/80',
    badgeClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  done: {
    title: 'Done',
    icon: CheckCircle2,
    headerBg: 'bg-emerald-50/80',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    borderClass: 'border-emerald-200/80',
    dotClass: 'bg-emerald-500',
  },
};

export default function KanbanColumn({
  status,
  tasks,
  onUpdateStatus,
  onDeleteTask,
}) {
  const meta = COLUMN_META[status] || {
    title: status,
    icon: Circle,
    headerBg: 'bg-slate-100',
    badgeClass: 'bg-slate-200 text-slate-700',
    borderClass: 'border-slate-200',
    dotClass: 'bg-slate-400',
  };

  const Icon = meta.icon;

  return (
    <div
      data-testid={`column-${status}`}
      className="flex-1 flex flex-col bg-slate-100/60 rounded-2xl border border-slate-200/80 p-4 min-h-[500px]"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-slate-500" />
            {meta.title}
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badgeClass}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-slate-300/80 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
            <p>No tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={onUpdateStatus}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

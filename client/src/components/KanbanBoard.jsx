import React, { useMemo } from 'react';
import KanbanColumn from './KanbanColumn';

const COLUMNS = ['todo', 'in-progress', 'done'];

export default function KanbanBoard({ tasks, onUpdateStatus, onDeleteTask }) {
  const groupedTasks = useMemo(() => {
    const groups = {
      todo: [],
      'in-progress': [],
      done: [],
    };

    for (const task of tasks) {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        // Fallback for unknown status into todo
        groups.todo.push(task);
      }
    }

    return groups;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {COLUMNS.map((columnId) => (
        <KanbanColumn
          key={columnId}
          status={columnId}
          tasks={groupedTasks[columnId] || []}
          onUpdateStatus={onUpdateStatus}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}

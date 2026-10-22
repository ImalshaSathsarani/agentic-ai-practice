import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function TaskForm({ onAddTask, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Task title cannot be empty');
      return;
    }
    setErrorMessage('');

    try {
      await onAddTask({ title: trimmedTitle, priority });
      setTitle('');
      setPriority('medium');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add task');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 transition-all"
    >
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            data-testid="task-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="What needs to be done? Enter task title..."
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 transition"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            data-testid="task-priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 transition cursor-pointer text-slate-700"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <button
          type="submit"
          data-testid="add-task-btn"
          disabled={isSubmitting || !title.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Add Task</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-2 text-xs text-rose-600 font-medium">{errorMessage}</p>
      )}
    </form>
  );
}

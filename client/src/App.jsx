import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import KanbanBoard from './components/KanbanBoard';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import { AlertCircle, RefreshCw, Layers, CheckSquare, Clock } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async ({ title, priority }) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newTask = await createTask({ title, priority });
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setError(null);
      const updated = await updateTask(id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setError(null);
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Board</h2>
            <p className="text-sm text-slate-500">Track and manage tasks across your development workflow</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs text-slate-600">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span><strong>{stats.total}</strong> Total</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600"><strong>{stats.todo}</strong> To Do</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600"><strong>{stats.inProgress}</strong> Active</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600"><strong>{stats.done}</strong> Done</span>
            </div>

            <button
              type="button"
              onClick={fetchTasks}
              disabled={isLoading}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Refresh task list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-semibold hover:underline text-rose-600"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Task Creation Form */}
        <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />

        {/* Kanban Board with Columns */}
        {isLoading && tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading Kanban board...</p>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          TaskPulse &middot; Multi-Agent Orchestrated Kanban &amp; System Health Platform
        </div>
      </footer>
    </div>
  );
}

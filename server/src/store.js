import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

class TaskStore {
  constructor() {
    this.tasks = [];
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.tasks = JSON.parse(raw);
        if (!Array.isArray(this.tasks)) {
          this.tasks = [];
        }
      } else {
        this.tasks = [];
        this.persist();
      }
    } catch (err) {
      console.error('Failed to initialize task store from disk, using in-memory store:', err.message);
      this.tasks = [];
    }
  }

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.tasks, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist tasks to disk:', err.message);
    }
  }

  getAll() {
    return [...this.tasks];
  }

  getById(id) {
    return this.tasks.find((task) => task.id === id) || null;
  }

  create({ title, priority = 'medium' }) {
    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      priority,
      status: 'todo',
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    this.persist();
    return newTask;
  }

  update(id, updates) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return null;
    }

    const currentTask = this.tasks[taskIndex];
    const updatedTask = {
      ...currentTask,
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.priority !== undefined ? { priority: updates.priority } : {})
    };

    this.tasks[taskIndex] = updatedTask;
    this.persist();
    return updatedTask;
  }

  delete(id) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return false;
    }

    this.tasks.splice(taskIndex, 1);
    this.persist();
    return true;
  }

  clear() {
    this.tasks = [];
    this.persist();
  }
}

export const taskStore = new TaskStore();

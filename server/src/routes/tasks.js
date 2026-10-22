import express from 'express';
import { taskStore } from '../store.js';
import { AppError } from '../middleware/error.js';

const router = express.Router();

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['todo', 'in-progress', 'done'];

// GET /api/tasks
router.get('/tasks', (req, res) => {
  const tasks = taskStore.getAll();
  res.status(200).json(tasks);
});

// POST /api/tasks
router.post('/tasks', (req, res, next) => {
  const { title, priority } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Task title is required and cannot be empty', 400));
  }

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    return next(new AppError(`Priority is required and must be one of: ${VALID_PRIORITIES.join(', ')}`, 400));
  }

  const created = taskStore.create({
    title: title.trim(),
    priority
  });

  res.status(201).json(created);
});

// PATCH /api/tasks/:id
router.patch('/tasks/:id', (req, res, next) => {
  const { id } = req.params;
  const existing = taskStore.getById(id);

  if (!existing) {
    return next(new AppError(`Task with id '${id}' not found`, 404));
  }

  const { title, status, priority } = req.body || {};

  if (title === undefined && status === undefined && priority === undefined) {
    return next(new AppError('At least one field (title, status, priority) must be provided for update', 400));
  }

  const updates = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return next(new AppError('Task title must be a non-empty string', 400));
    }
    updates.title = title.trim();
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return next(new AppError(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`, 400));
    }
    updates.status = status;
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return next(new AppError(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}`, 400));
    }
    updates.priority = priority;
  }

  const updated = taskStore.update(id, updates);
  res.status(200).json(updated);
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', (req, res, next) => {
  const { id } = req.params;
  const deleted = taskStore.delete(id);

  if (!deleted) {
    return next(new AppError(`Task with id '${id}' not found`, 404));
  }

  res.status(204).end();
});

export default router;

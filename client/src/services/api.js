const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Fetch health status of the backend server.
 * @returns {Promise<{ status: string, uptime: number, timestamp: string }>}
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    let errorMsg = `Health check failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * Fetch all tasks from the backend.
 * @returns {Promise<Array<{ id: string, title: string, priority: string, status: string, createdAt: string }>>}
 */
export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    let errorMsg = `Failed to fetch tasks with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * Create a new task.
 * @param {{ title: string, priority: 'low' | 'medium' | 'high' }} payload
 * @returns {Promise<{ id: string, title: string, priority: string, status: string, createdAt: string }>}
 */
export async function createTask({ title, priority = 'medium' }) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, priority }),
  });
  if (!response.ok) {
    let errorMsg = `Failed to create task with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * Update an existing task's status, priority, or title.
 * @param {string} id
 * @param {{ status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high', title?: string }} updates
 * @returns {Promise<{ id: string, title: string, priority: string, status: string, createdAt: string }>>}
 */
export async function updateTask(id, updates) {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    let errorMsg = `Failed to update task with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * Delete a task by ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let errorMsg = `Failed to delete task with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return true;
}

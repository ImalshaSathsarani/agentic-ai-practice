import { test, expect } from '@playwright/test';

test.describe('API Contract & Integration Suite', () => {
  const BASE_URL = 'http://localhost:4000';

  test.describe('Health Endpoint - GET /api/health', () => {
    test('should return 200 OK with valid health status, uptime, and ISO timestamp', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}/api/health`);
      const latency = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body = await response.json();
      expect(body).toHaveProperty('status', 'healthy');
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
      expect(body).toHaveProperty('timestamp');
      
      const parsedDate = new Date(body.timestamp);
      expect(parsedDate.getTime()).not.toBeNaN();
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  test.describe('Tasks Endpoint - GET /api/tasks', () => {
    test('should return 200 OK and an array of task objects matching schema', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/tasks`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const tasks = await response.json();
      expect(Array.isArray(tasks)).toBe(true);

      for (const task of tasks) {
        expect(task).toHaveProperty('id');
        expect(typeof task.id).toBe('string');
        expect(task).toHaveProperty('title');
        expect(typeof task.title).toBe('string');
        expect(['low', 'medium', 'high']).toContain(task.priority);
        expect(['todo', 'in-progress', 'done']).toContain(task.status);
        expect(task).toHaveProperty('createdAt');
        expect(new Date(task.createdAt).getTime()).not.toBeNaN();
      }
    });
  });

  test.describe('Task Creation - POST /api/tasks', () => {
    test('should create a task with default status "todo" and return 201 Created', async ({ request }) => {
      const payload = {
        title: 'Playwright Automated Contract Task',
        priority: 'high',
      };

      const response = await request.post(`${BASE_URL}/api/tasks`, {
        data: payload,
      });

      expect(response.status()).toBe(201);
      const created = await response.json();

      expect(created).toHaveProperty('id');
      expect(typeof created.id).toBe('string');
      expect(created.title).toBe(payload.title);
      expect(created.priority).toBe('high');
      expect(created.status).toBe('todo');
      expect(created).toHaveProperty('createdAt');
      expect(new Date(created.createdAt).getTime()).not.toBeNaN();

      // Clean up created task
      await request.delete(`${BASE_URL}/api/tasks/${created.id}`);
    });

    test('should return 400 Bad Request when title is missing', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/tasks`, {
        data: { priority: 'low' },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.statusCode).toBe(400);
    });

    test('should return 400 Bad Request when title is blank whitespace', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/tasks`, {
        data: { title: '   ', priority: 'medium' },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toMatch(/title.*required|cannot be empty/i);
      expect(body.statusCode).toBe(400);
    });

    test('should return 400 Bad Request when priority is invalid', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/tasks`, {
        data: { title: 'Invalid Priority Task', priority: 'urgent' },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toMatch(/priority.*must be one of/i);
      expect(body.statusCode).toBe(400);
    });

    test('should return 400 Bad Request when body is empty', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/tasks`, {
        data: {},
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.statusCode).toBe(400);
    });
  });

  test.describe('Task Update - PATCH /api/tasks/:id', () => {
    let testTaskId;

    test.beforeEach(async ({ request }) => {
      const res = await request.post(`${BASE_URL}/api/tasks`, {
        data: { title: 'Task to be Updated', priority: 'medium' },
      });
      const data = await res.json();
      testTaskId = data.id;
    });

    test.afterEach(async ({ request }) => {
      if (testTaskId) {
        await request.delete(`${BASE_URL}/api/tasks/${testTaskId}`);
      }
    });

    test('should update task status to "in-progress" and return 200 OK', async ({ request }) => {
      const res = await request.patch(`${BASE_URL}/api/tasks/${testTaskId}`, {
        data: { status: 'in-progress' },
      });

      expect(res.status()).toBe(200);
      const updated = await res.json();
      expect(updated.id).toBe(testTaskId);
      expect(updated.status).toBe('in-progress');
      expect(updated.title).toBe('Task to be Updated');
    });

    test('should update task status to "done" and priority to "low"', async ({ request }) => {
      const res = await request.patch(`${BASE_URL}/api/tasks/${testTaskId}`, {
        data: { status: 'done', priority: 'low' },
      });

      expect(res.status()).toBe(200);
      const updated = await res.json();
      expect(updated.status).toBe('done');
      expect(updated.priority).toBe('low');
    });

    test('should return 400 Bad Request when updating with invalid status', async ({ request }) => {
      const res = await request.patch(`${BASE_URL}/api/tasks/${testTaskId}`, {
        data: { status: 'archived' },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.statusCode).toBe(400);
      expect(body.error).toMatch(/invalid status/i);
    });

    test('should return 400 Bad Request when updating with empty body', async ({ request }) => {
      const res = await request.patch(`${BASE_URL}/api/tasks/${testTaskId}`, {
        data: {},
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.statusCode).toBe(400);
    });

    test('should return 404 Not Found when updating non-existent task id', async ({ request }) => {
      const res = await request.patch(`${BASE_URL}/api/tasks/non-existent-uuid-9999`, {
        data: { status: 'done' },
      });

      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.statusCode).toBe(404);
      expect(body.error).toContain('not found');
    });
  });

  test.describe('Task Deletion - DELETE /api/tasks/:id', () => {
    test('should delete task and return 204 No Content, then 404 on subsequent requests', async ({ request }) => {
      // 1. Create a task specifically for deletion
      const createRes = await request.post(`${BASE_URL}/api/tasks`, {
        data: { title: 'Task to Delete', priority: 'low' },
      });
      const created = await createRes.json();
      const idToDelete = created.id;

      // 2. Delete it
      const deleteRes = await request.delete(`${BASE_URL}/api/tasks/${idToDelete}`);
      expect(deleteRes.status()).toBe(204);

      // 3. Confirm 404 on subsequent DELETE
      const secondDeleteRes = await request.delete(`${BASE_URL}/api/tasks/${idToDelete}`);
      expect(secondDeleteRes.status()).toBe(404);

      // 4. Confirm 404 on subsequent PATCH
      const patchRes = await request.patch(`${BASE_URL}/api/tasks/${idToDelete}`, {
        data: { status: 'done' },
      });
      expect(patchRes.status()).toBe(404);

      // 5. Confirm not in GET /api/tasks
      const getRes = await request.get(`${BASE_URL}/api/tasks`);
      const allTasks = await getRes.json();
      const found = allTasks.find((t) => t.id === idToDelete);
      expect(found).toBeUndefined();
    });

    test('should return 404 when deleting a non-existent task ID', async ({ request }) => {
      const deleteRes = await request.delete(`${BASE_URL}/api/tasks/definitely-not-a-task-id`);
      expect(deleteRes.status()).toBe(404);
      const body = await deleteRes.json();
      expect(body.statusCode).toBe(404);
    });
  });
});

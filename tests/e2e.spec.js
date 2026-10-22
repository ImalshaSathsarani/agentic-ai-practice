import { test, expect } from '@playwright/test';

test.describe('TaskPulse Browser E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to frontend app
    await page.goto('/');
    // Wait for the app root to be mounted and ready
    await page.waitForLoadState('networkidle');
  });

  test('E2E-01: Header & Live Health Badge displays healthy status and uptime', async ({ page }) => {
    const healthBadge = page.locator('[data-testid="health-badge"]');
    await expect(healthBadge).toBeVisible({ timeout: 10000 });

    const healthStatus = page.locator('[data-testid="health-status"]');
    await expect(healthStatus).toBeVisible();

    // Verify it connects to backend and reflects Healthy status
    await expect(healthStatus).toContainText(/Healthy/i, { timeout: 10000 });
    await expect(healthStatus).toContainText(/Uptime/i);
  });

  test('E2E-02: Kanban Board renders all three standard workflow columns', async ({ page }) => {
    const todoColumn = page.locator('[data-testid="column-todo"]');
    const inProgressColumn = page.locator('[data-testid="column-in-progress"]');
    const doneColumn = page.locator('[data-testid="column-done"]');

    await expect(todoColumn).toBeVisible();
    await expect(todoColumn).toContainText('To Do');

    await expect(inProgressColumn).toBeVisible();
    await expect(inProgressColumn).toContainText('In Progress');

    await expect(doneColumn).toBeVisible();
    await expect(doneColumn).toContainText('Done');
  });

  test('E2E-03: Task Creation Flow creates task in To Do column with priority', async ({ page }) => {
    const uniqueTitle = `E2E Automated Task ${Date.now()}`;

    const titleInput = page.locator('[data-testid="task-title-input"]');
    const prioritySelect = page.locator('[data-testid="task-priority-select"]');
    const submitBtn = page.locator('[data-testid="add-task-btn"]');

    // Verify initial disabled state when empty
    await expect(titleInput).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Fill task title and choose High priority
    await titleInput.fill(uniqueTitle);
    await prioritySelect.selectOption('high');
    await expect(submitBtn).toBeEnabled();

    // Submit
    await submitBtn.click();

    // Card should appear in Todo column
    const todoColumn = page.locator('[data-testid="column-todo"]');
    const taskCard = todoColumn.locator('[data-testid="task-card"]', { hasText: uniqueTitle });
    await expect(taskCard).toBeVisible({ timeout: 5000 });
    await expect(taskCard).toContainText('High Priority');

    // Cleanup: Delete the newly created task
    const deleteBtn = taskCard.locator('[data-testid="delete-task-btn"]');
    await deleteBtn.click();
    await expect(taskCard).not.toBeVisible({ timeout: 5000 });
  });

  test('E2E-04: Full Task Lifecycle - Create, Move through columns (Todo -> In Progress -> Done), and Delete', async ({ page }) => {
    const lifecycleTitle = `Lifecycle Task ${Date.now()}`;

    // 1. Create task
    const titleInput = page.locator('[data-testid="task-title-input"]');
    const prioritySelect = page.locator('[data-testid="task-priority-select"]');
    const submitBtn = page.locator('[data-testid="add-task-btn"]');

    await titleInput.fill(lifecycleTitle);
    await prioritySelect.selectOption('medium');
    await submitBtn.click();

    // Verify in "To Do"
    const todoCol = page.locator('[data-testid="column-todo"]');
    const inProgressCol = page.locator('[data-testid="column-in-progress"]');
    const doneCol = page.locator('[data-testid="column-done"]');

    const todoCard = todoCol.locator('[data-testid="task-card"]', { hasText: lifecycleTitle });
    await expect(todoCard).toBeVisible({ timeout: 5000 });
    await expect(todoCard).toContainText('Medium Priority');

    // 2. Move To Do -> In Progress
    const moveFromTodoBtn = todoCard.locator('[data-testid="move-task-btn"]');
    await moveFromTodoBtn.click();

    const inProgressCard = inProgressCol.locator('[data-testid="task-card"]', { hasText: lifecycleTitle });
    await expect(inProgressCard).toBeVisible({ timeout: 5000 });
    await expect(todoCard).not.toBeVisible();

    // 3. Move In Progress -> Done
    const moveFromProgressBtn = inProgressCard.locator('[data-testid="move-task-btn"]');
    await moveFromProgressBtn.click();

    const doneCard = doneCol.locator('[data-testid="task-card"]', { hasText: lifecycleTitle });
    await expect(doneCard).toBeVisible({ timeout: 5000 });
    await expect(inProgressCard).not.toBeVisible();

    // 4. Delete task from Done
    const deleteBtn = doneCard.locator('[data-testid="delete-task-btn"]');
    await deleteBtn.click();

    // Verify card is removed from all columns
    await expect(doneCard).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="task-card"]', { hasText: lifecycleTitle })).toHaveCount(0);
  });
});

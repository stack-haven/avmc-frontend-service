import type { Page } from '@playwright/test';

import { expect, test } from '@playwright/test';

async function login(page: Page, username = 'admin') {
  await page.goto('/auth/login');

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill('123456');

  const captcha = page.locator('div[name="captcha"]');
  const action = page.locator('div[name="captcha-action"]');
  await expect(captcha).toBeVisible();
  await expect(action).toBeVisible();

  const captchaBox = await captcha.boundingBox();
  const actionBox = await action.boundingBox();
  if (!captchaBox || !actionBox) {
    throw new Error('Slider captcha is not measurable');
  }

  const startX = actionBox.x + actionBox.width / 2;
  const startY = actionBox.y + actionBox.height / 2;
  const targetX = captchaBox.x + captchaBox.width - actionBox.width / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(targetX, startY, { steps: 20 });
  await page.mouse.up();

  await page.getByRole('button', { name: 'login' }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/);
}

async function verifyPage(page: Page, path: string, expectedText: string) {
  await page.goto(path);
  await expect(page.getByText('加载菜单中...')).toBeHidden({
    timeout: 30_000,
  });
  await expect(page.getByText(expectedText, { exact: true }).first()).toBeVisible(
    { timeout: 30_000 },
  );
}

test('platform governance pages load real backend data', async ({ page }) => {
  test.slow();
  await login(page);

  await verifyPage(page, '/system/tenant', '演示平台租户');
  await verifyPage(
    page,
    '/system/menu-permission-group',
    '演示完整管理权限组',
  );
  await verifyPage(page, '/system/role', 'mock_super_admin');
  await verifyPage(page, '/system/user', 'admin');
  await verifyPage(page, '/system/parameter', 'system.page_size');
  await verifyPage(
    page,
    '/system/async-task',
    'system.task_retention_cleanup',
  );
});

test('ordinary tenant role only sees package and role permissions', async ({
  page,
}) => {
  await login(page, 'jack');

  await verifyPage(page, '/system/user', 'jack');
  await verifyPage(page, '/system/role', 'mock_operator_role');
  await expect(
    page.getByRole('menuitem', { name: '租户管理' }),
  ).toHaveCount(0);
});

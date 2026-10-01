import { test, expect } from '@playwright/test'

import { LoginPage } from '../pages/LoginPage'

test('TC06 - Verify unauthenticated user is redirected to login and returned to the originally requested protected page after authentication', async ({ page }) => {

    // Arrange: initialize the Login page object
    const loginPage = new LoginPage(page)

    //attempt to access a protected Admin page without authentication
    await page.goto('/web/index.php/admin/jobCategory', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    })

    // Assert: unauthenticated user is redirected to the Login page
    await expect(page).toHaveURL(/\/auth\/login/)

    // Assert: Login page is displayed
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()

    // authenticate using valid credentials
    await loginPage.login('Admin', 'admin123')

    // Assert: application returns to the originally requested protected page
    await expect(page).toHaveURL(/\/admin\/jobCategory/, { timeout: 30000 })

    // Assert: verify the protected module and page context
    const topBarBreadcrumb = page.locator('.oxd-topbar-header-breadcrumb')

    await expect(topBarBreadcrumb.locator('.oxd-topbar-header-breadcrumb-module')).toHaveText('Admin')

    await expect(topBarBreadcrumb.locator('.oxd-topbar-header-breadcrumb-level')).toHaveText('Job')

    // Assert: verify the originally requested page is displayed
    await expect(page.locator('.orangehrm-main-title')).toHaveText('Job Categories')
})
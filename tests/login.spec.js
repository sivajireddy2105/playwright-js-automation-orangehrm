import { test, expect } from '@playwright/test'

import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test('TC01 - Verify valid user can login, access Dashboard and logout', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    // Navigate to the login page
    await page.goto('/')

    // Perform login action
    await loginPage.login('Admin', 'admin123')

    // Verify that the dashboard heading is visible after successful login
    expect(await dashboardPage.dashboardHeading).toBeVisible()

    // Perform logout action
    await dashboardPage.logout()

    // Verify that the user is redirected back to the login page after logout
    await expect(loginPage.loginButton).toBeVisible()
})
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'


test('TC01 - Verify valid user can login, access Dashboard and logout', async ({ page }) => {

    // Create the login page object for authentication actions.
    const loginPage = new LoginPage(page)

    // Create the dashboard page object for dashboard validation and logout.
    const dashboardPage = new DashboardPage(page)

    // Open the application login route defined by the Playwright base URL.
    await page.goto('/')

    // Authenticate with the known valid OrangeHRM demo credentials.
    await loginPage.login('Admin', 'admin123')

    // Confirm that successful authentication exposes the dashboard heading.
    expect(await dashboardPage.dashboardHeading).toBeVisible()

    // Open the user menu and end the authenticated session.
    await dashboardPage.logout()

    // Confirm that the login button is visible again after logout.
    await expect(loginPage.loginButton).toBeVisible()
})
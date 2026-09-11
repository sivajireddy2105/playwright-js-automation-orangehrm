import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

// This scenario verifies the happy path for a valid user: sign in, confirm dashboard access, and log out successfully.
test('TC01 - Verify valid user can login, access Dashboard and logout', async ({ page }) => {

    // Arrange: create the page objects used to interact with the auth and dashboard flows.
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    // Act: open the application and log in with known valid credentials.
    await page.goto('/')
    await loginPage.login('Admin', 'admin123')

    // Assert: validate that the dashboard is visible after successful authentication.
    await expect(dashboardPage.dashboardHeading).toBeVisible()

    // Act: sign out through the user menu.
    await dashboardPage.logout()

    // Assert: confirm the login form is available again after logout.
    await expect(loginPage.loginButton).toBeVisible()
})
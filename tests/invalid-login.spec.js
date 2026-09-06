import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'


test('TC02 - Verify that the application rejects invalid authentication credentials and the user remains unauthenticated.', async ({ page }) => {

    // Create the login page object using the test's browser page.
    const loginPage = new LoginPage(page)

    // Open the application login route defined by the Playwright base URL.
    await page.goto('/')

    // Submit credentials that should be rejected by OrangeHRM.
    await loginPage.login('Admin', 'Admin1234')

    // Wait until OrangeHRM renders the invalid-credentials message.
    await loginPage.invalidCredentialsError.waitFor({ state: 'visible' })

    // Confirm that the invalid-credentials message is visible to the user.
    await expect(loginPage.invalidCredentialsError).toBeVisible()
})
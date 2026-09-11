import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

// This scenario confirms the application blocks invalid credentials and shows the expected error feedback.
test('TC02 - Verify that the application rejects invalid authentication credentials and the user remains unauthenticated.', async ({ page }) => {

    // Arrange: initialize the login page object used for the negative-auth test.
    const loginPage = new LoginPage(page)

    // Act: open the login page and submit invalid credentials.
    await page.goto('/')
    await loginPage.login('Admin', 'Admin1234')

    // Assert: wait for and confirm the invalid-credentials message appears.
    await loginPage.invalidCredentialsError.waitFor({ state: 'visible' })
    await expect(loginPage.invalidCredentialsError).toBeVisible()
})
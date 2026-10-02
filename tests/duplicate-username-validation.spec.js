import { test, expect } from '@playwright/test'

import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { PIMPage } from '../pages/PIMPage'

test('TC08 - Verify duplicate username is rejected during employee account creation', async ({ page }) => {

    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    const pimPage = new PIMPage(page)

    const firstEmployeeFirstName = 'Milo'
    const firstEmployeeLastName = `User${Date.now().toString().slice(-4)}`
    const existingUsername = `dup_user_${Date.now().toString().slice(-6)}`
    const password = 'Test@12345'

    const secondEmployeeFirstName = 'Nemo'
    const secondEmployeeLastName = `Duplicate${Date.now().toString().slice(-4)}`

    await page.goto('/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    })

    await loginPage.login('Admin', 'admin123')

    await expect(page).toHaveURL(/\/dashboard\/index/, { timeout: 30000 })
    await expect(dashboardPage.dashboardHeading).toBeVisible({ timeout: 30000 })

    // --------------------------------------------------
    // Create first employee with a valid login account
    // --------------------------------------------------
    await pimPage.navigateToPIM()
    await pimPage.navigateToAddEmployee()

    await pimPage.firstName.fill(firstEmployeeFirstName)
    await pimPage.lastName.fill(firstEmployeeLastName)

    await pimPage.enableCreateLoginDetails()
    await pimPage.verifyLoginDetailsDefaults()

    await pimPage.enterLoginDetails(existingUsername, password, password)

    await pimPage.saveNewEmployee()


    // Return to Employee List before creating Employee #2
    await pimPage.navigateToEmployeeList()


    // --------------------------------------------------
    // Create second employee using the same existing username
    // --------------------------------------------------
    await pimPage.navigateToAddEmployee()

    await pimPage.firstName.fill(secondEmployeeFirstName)
    await pimPage.lastName.fill(secondEmployeeLastName)

    await pimPage.enableCreateLoginDetails()
    await pimPage.verifyLoginDetailsDefaults()

    await pimPage.enterLoginDetails(existingUsername, password, password)

    // Verify that OrangeHRM rejects the duplicate username
    await pimPage.verifyUsernameAlreadyExists()

    await pimPage.saveButton.click()
})
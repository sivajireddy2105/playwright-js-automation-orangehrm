import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { PIMPage } from '../pages/PIMPage'


test('TC03 - Verify user can search and retrieve an existing employee', async ({ page }) => {

    // Create the login page object for authentication actions.
    const loginPage = new LoginPage(page)

    // Create the dashboard page object for post-login validation.
    const dashboardPage = new DashboardPage(page)

    // Create the PIM page object for employee navigation and search.
    const pimPage = new PIMPage(page)

    // Define the keyword entered into the employee search field.
    const searchKeyword = 'Teja'

    // Define the full employee name expected in the search results.
    const employeeName = 'Teja QA Tester'

    // Define the employee ID used to disambiguate matching names.
    const employeeID = '0400'

    // Open the application login route defined by the Playwright base URL.
    await page.goto('/')

    // Authenticate with the known valid OrangeHRM demo credentials.
    await loginPage.login('Admin', 'admin123')

    // Confirm that authentication completed and the dashboard is visible.
    await expect(dashboardPage.dashboardHeading).toBeVisible()

    // Open the Personnel Information Management section.
    await pimPage.navigateToPIM()

    // Confirm that navigation reached the PIM page.
    await expect(pimPage.PIMHeading).toHaveText('PIM')

    // Submit the employee-name keyword and wait for result rows.
    await pimPage.searchEmployee(searchKeyword)

    // Locate the requested employee using the name and disambiguating ID.
    const employeeRow = await pimPage.findEmployee(
        employeeName,
        employeeID
    )

    // Confirm that the search returned a matching employee row.
    expect(employeeRow).not.toBeNull()

    // Confirm that the matching employee row is visible in the table.
    await expect(employeeRow).toBeVisible()
})
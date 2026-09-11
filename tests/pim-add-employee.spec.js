import { test, expect } from '@playwright/test'

import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { PIMPage } from '../pages/PIMPage'

// This scenario validates the OrangeHRM employee-creation journey from login to final record verification.
test('TC03 - Verify user can create a new employee and retrieve the created record', async ({ page }) => {

    // Arrange: initialize the page objects needed for authentication and employee management.
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    const pimPage = new PIMPage(page)

    // Use dynamic values so the test does not collide with existing employee records in the system.
    const firstName = 'Reddy'
    const middleName = 'QA'
    const lastName = `Tester${Date.now()}`

    const employeeDetailsName = `${firstName} ${lastName}`
    const employeeListName = `${firstName} ${middleName} ${lastName}`

    // Act: open the application and sign in with admin credentials.
    await page.goto('/')
    await loginPage.login('Admin', 'admin123')

    // Assert: confirm the user has reached the dashboard after login.
    await expect(dashboardPage.dashboardHeading).toBeVisible()

    // Act: navigate to the PIM module and open the add-employee form.
    await pimPage.navigateToPIM()
    await expect(pimPage.pimHeading).toHaveText('PIM')
    await pimPage.navigateToAddEmployee()
    await pimPage.addNewEmployee(firstName, middleName, lastName)

    // Assert: verify the employee detail page shows the newly created person.
    await expect(pimPage.employeeFullName).toHaveText(employeeDetailsName)
    const generatedEmployeeId = await pimPage.getEmployeeId()

    // Act: return to the employee listing page and search for the created record.
    await pimPage.navigateToEmployeeList()
    await pimPage.searchEmployee(firstName)

    // Assert: confirm the record is present in the table using both name and employee ID for accuracy.
    const newlyAddedEmployeeRow = await pimPage.findEmployee(employeeListName, generatedEmployeeId)

    expect(newlyAddedEmployeeRow).not.toBeNull()
    await expect(newlyAddedEmployeeRow).toBeVisible()
})
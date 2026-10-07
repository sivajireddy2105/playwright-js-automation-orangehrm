import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { PIMPage } from '../pages/PIMPage'
import { UserManagementPage } from '../pages/UserManagementPage'
import { generateAccessibilityReport, logAccessibilityResults } from '../utils/accessibilityReporter'

test('TC09 - Run accessibility scan on Login page', async ({ page }, testInfo) => {

    const loginPage = new LoginPage(page)


    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    await expect(loginPage.usernameInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()

    const accessibilityScan = await new AxeBuilder({ page }).analyze()

    generateAccessibilityReport(accessibilityScan, `TC09-login-page-accessibility-${testInfo.project.name}.html`)

    logAccessibilityResults(accessibilityScan, 'Login Page')
})

test('TC10 - Run accessibility scan on Dashboard page', async ({ page }, testInfo) => {

    const loginPage = new LoginPage(page)

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    await loginPage.login('Admin', 'admin123')

    await expect(page).toHaveURL(/\/dashboard\/index/, { timeout: 30000 })

    const accessibilityScan = await new AxeBuilder({ page }).analyze()

    generateAccessibilityReport(accessibilityScan, `TC10-dashboard-page-accessibility-${testInfo.project.name}.html`)

    logAccessibilityResults(accessibilityScan, 'Dashboard Page')
})


test('TC11 - Run accessibility scan on Employee List page', async ({ page }, testInfo) => {

    const loginPage = new LoginPage(page)
    const pimPage = new PIMPage(page)

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    await loginPage.login('Admin', 'admin123')

    await pimPage.navigateToPIM()
    await pimPage.navigateToEmployeeList()

    await expect(pimPage.employeeListLink).toBeVisible()
    await expect(pimPage.employeeTable).toBeVisible()

    const accessibilityScan = await new AxeBuilder({ page }).analyze()

    generateAccessibilityReport(accessibilityScan, `TC11-employee-list-page-accessibility-${testInfo.project.name}.html`)

    logAccessibilityResults(accessibilityScan, 'Employee List Page')
})


test('TC12 - Run accessibility scan on System Users page', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    const userManagementPage = new UserManagementPage(page)

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    await loginPage.login('Admin', 'admin123')

    await dashboardPage.navigateToAdmin()
    await userManagementPage.verifySystemUsersPage()

    const accessibilityScan = await new AxeBuilder({ page }).analyze()

    generateAccessibilityReport(accessibilityScan, `TC12-system-users-page-accessibility-${testInfo.project.name}.html`)

    logAccessibilityResults(accessibilityScan, 'System Users Page')
})


test('TC13 - Run accessibility scan on Add User page', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    const userManagementPage = new UserManagementPage(page)

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    await loginPage.login('Admin', 'admin123')

    await dashboardPage.navigateToAdmin()
    await userManagementPage.verifySystemUsersPage()
    await userManagementPage.openAddUserPage()

    const accessibilityScan = await new AxeBuilder({ page }).analyze()

    generateAccessibilityReport(accessibilityScan, `TC13-add-user-page-accessibility-${testInfo.project.name}.html`)

    logAccessibilityResults(accessibilityScan, 'Add User Page')
})
import { test, expect } from "@playwright/test"
import { LoginPage } from "../pages/LoginPage"
import { LeavePage } from "../pages/LeavePage"

test('TC04 - Explore Leave module', async ({ page }) => {

    // Initialize page objects
    const loginPage = new LoginPage(page)
    const leavePage = new LeavePage(page)

    // Leave dates use OrangeHRM's yyyy-dd-mm format
    const fromDate = '2026-17-09'
    const toDate = '2026-18-09'
    const leaveTypeOption = 'CAN - Personal'

    // Open the application
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Authenticate with valid credentials
    await loginPage.login('Admin', 'admin123')

    // Confirm successful navigation to Dashboard
    await expect(page).toHaveURL(/dashboard/)

    // Navigate to Leave > Apply Leave
    await leavePage.navigateToLeave()

    await leavePage.navigateToApplyLeave()


    // Verify whether the current user has an eligible leave type
    const canApplyLeave = await leavePage.isLeaveApplicationAvailable()

    // Skip the application flow when no leave balance is available
    if (!canApplyLeave) {
        console.log('No leave types currently have available balance. Skipping leave application.')
        return
    }

    // Select the leave type and wait for its balance to load
    await leavePage.selectLeaveType(leaveTypeOption)

    // Enter the reason for the leave request
    await leavePage.enterComments('Leave request for personal work')

    // Submit the leave request and handle overlapping dates if encountered
    await leavePage.applyLeave(fromDate, toDate)
})
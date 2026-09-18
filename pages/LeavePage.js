import { expect } from "@playwright/test";

export class LeavePage {
    constructor(page) {

        this.page = page

        // Navigation
        this.leaveMenu = page.getByRole('link', { name: 'Leave', exact: true })
        this.leaveHeading = page.locator('h6:has-text("Leave")')

        // Apply Leave form
        this.applyLeaveLink = page.getByRole('link', { name: 'Apply', exact: true })
        this.leaveTypeDropdown = page.locator('.oxd-select-text-input')


        this.fromDate = page.getByPlaceholder('yyyy-dd-mm', { exact: true })
        this.toDate = page.getByPlaceholder('yyyy-dd-mm', { exact: true })
        this.commentsBox = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Comments' })
            .locator('textarea')

        this.applyButton = page.getByRole('button', { name: ' Apply ', exact: true })

        // Used to extract dates from existing overlapping leave requests
        this.dateCells = this.page.locator(
            '.oxd-table-body .oxd-table-card .oxd-table-cell:first-child')

        // Indicates that the current user cannot submit a leave request
        this.noLeaveBalanceMessage = page.getByText('No Leave Types with Leave Balance', { exact: true })

        // Used to confirm that the Apply Leave page has loaded
        this.applyLeaveForm = page.getByRole('heading', { name: 'Apply Leave', exact: true })
        this.formLoader = page.locator('.oxd-form-loader')
    }

    async navigateToLeave() {

        await this.leaveMenu.click()

        await expect(this.leaveHeading).toBeVisible()
    }

    async navigateToApplyLeave() {

        await this.applyLeaveLink.click()

        await expect(this.page.getByRole('heading',
            { name: 'Apply Leave', exact: true })).toBeVisible()
    }

    async selectLeaveType(leaveType) {

        await this.leaveTypeDropdown.dblclick()

        await expect(this.page.getByText(leaveType, { exact: true })).toBeVisible()

        await this.page.getByText(leaveType, { exact: true }).click()

        await expect(this.leaveTypeDropdown).toHaveText(leaveType)

        // Check leave balance before submitting
        const leaveBalance = this.page.locator('.orangehrm-leave-balance-text')

        await expect(leaveBalance).toBeVisible()

        await expect(leaveBalance).not.toHaveText('0.00 Day(s)', { timeout: 10000 })
    }

    async enterFromDate(date) {

        await expect(this.fromDate.first()).toBeVisible()

        await this.fromDate.first().fill(date)

        await expect(this.fromDate.first()).toHaveValue(date)
    }

    async enterToDate(date) {

        await expect(this.toDate.last()).toBeVisible()

        await this.toDate.last().click()

        await this.toDate.last().press('Control+A')
        await this.toDate.last().press('Backspace')

        await expect(this.toDate.last()).toBeEmpty()

        await this.toDate.last().type(date)

        await expect(this.toDate.last()).toHaveValue(date)
    }

    async enterComments(comment) {

        await expect(this.commentsBox).toBeVisible()

        await this.commentsBox.fill(comment)

        await expect(this.commentsBox).toHaveValue(comment)
    }

    async applyLeave(fromDate, toDate, maxAttempts = 5) {

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {

            console.log(
                `Attempt ${attempt}: ${fromDate} → ${toDate}`
            )

            await this.enterFromDate(fromDate)
            await this.enterToDate(toDate)

            await this.applyButton.click()

            const successToastMessage = this.page.getByText(
                'Successfully Saved',
                { exact: true }
            )

            const overlapHeading = this.page.getByRole(
                'heading',
                {
                    name: 'Overlapping Leave Request(s) Found',
                    exact: true
                }
            )

            try {
                await expect(successToastMessage).toBeVisible({ timeout: 5000 })

                console.log(
                    `Leave submitted successfully: ${fromDate} → ${toDate}`
                )

                return

            } catch {
                await expect(overlapHeading).toBeVisible({ timeout: 5000 })
            }

            // Leave dates overlap an existing request
            const latestConflictingDate =
                await this.getLatestConflictingDate()

            console.log(
                `Latest conflicting date: ${latestConflictingDate}`
            )

            fromDate = this.getNextDate(latestConflictingDate)
            toDate = fromDate
        }

        throw new Error(
            `Leave could not be submitted after ${maxAttempts} attempts.`
        )
    }

    async getLatestConflictingDate() {

        const dates = await this.dateCells.allTextContents()

        console.log('Conflicting leave dates:', dates)


        if (dates.length === 0) {
            throw new Error(
                'Overlap was detected, but no conflicting leave dates were found.'
            )
        }


        const parsedDates = dates.map(date => {
            const [year, day, month] = date.trim().split('-').map(Number)

            return new Date(year, month - 1, day)
        })

        return new Date(
            Math.max(...parsedDates.map(date => date.getTime()))
        )
    }

    getNextDate(date) {

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const year = nextDate.getFullYear()
        const month = String(nextDate.getMonth() + 1).padStart(2, '0')
        const day = String(nextDate.getDate()).padStart(2, '0')

        return `${year}-${day}-${month}`
    }


    async isLeaveApplicationAvailable() {
        // Confirm that the Apply Leave page has loaded
        await expect(this.applyLeaveForm).toBeVisible()

        // Wait for the Apply Leave form to finish loading
        await expect(this.formLoader).toBeHidden()

        // No leave balance means the application cannot proceed
        if (await this.noLeaveBalanceMessage.isVisible()) {
            return false
        }

        // Confirm that the leave type dropdown is available
        await expect(this.leaveTypeDropdown).toBeVisible()

        // Open the dropdown to inspect the available leave types
        await this.leaveTypeDropdown.click()

        const leaveOptions = this.page.locator('.oxd-select-option')

        // Wait until the dropdown options are rendered
        await expect(leaveOptions.first()).toBeVisible()

        const options = await leaveOptions.allTextContents()

        // Close the dropdown without selecting anything
        await this.page.keyboard.press('Escape')

        // Ignore the placeholder option
        const availableLeaveTypes = options.filter(
            option => option.trim() !== '-- Select --'
        )

        return availableLeaveTypes.length > 0
    }
}
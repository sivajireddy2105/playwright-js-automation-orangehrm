import { expect } from '@playwright/test'

export class UserManagementPage {
    constructor(page) {
        this.page = page

        // =========================
        // System Users page
        // =========================

        // Single topbar header container
        // System users page displays: Admin / User Management
        this.topBarHeader = page.locator('span.oxd-topbar-header-breadcrumb')

        this.systemUsersHeading = page.getByRole('heading', { name: /System Users/i, exact: true })

        this.addButton = page.getByRole('button', { name: /Add/i, exact: true })

        // =========================
        // Add User page
        // =========================

        this.addUserHeading = page.getByRole('heading', { name: /Add User/i, exact: true })

        // User role
        this.userRoleDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'User Role' })
            .locator('.oxd-select-text-input')

        // Employee name
        this.employeeNameInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Name' })
            .locator('input')

        // Status 
        this.statusDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Status' })
            .locator('.oxd-select-text-input')

        // Username
        this.usernameInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Username' })
            .locator('input')

        // Password 
        this.passwordInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Password' })
            .locator('input').first()

        // Confirm Password
        this.confirmPasswordInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Confirm Password' })
            .locator('input').last()

        // Save button
        this.saveButton = page.getByRole('button', { name: /Save/i, exact: true })


        // System users search
        this.searchUsernameInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Username' })
            .locator('input')

        this.searchButton = page.getByRole('button', { name: /Search/i, exact: true })

        // User records
        this.userTable = page.locator('.oxd-table')
        this.userRows = this.userTable.locator('.oxd-table-body .oxd-table-card')
    }


    // =========================
    // System Users page
    // =========================
    async verifySystemUsersPage() {

        await expect(this.topBarHeader).toHaveText(/Admin\s*User Management/)

        await expect(this.systemUsersHeading).toBeVisible()
    }

    // Verify add users page
    async openAddUserPage() {

        await this.addButton.click()

        // Add User page header is only "Admin"
        await expect(this.topBarHeader).toHaveText('Admin')

        await expect(this.addUserHeading).toBeVisible()
    }


    // 
    async addSystemUser({ employeeName, username, password }) {

        // User role
        await this.userRoleDropdown.click()
        await this.page.getByRole('option', { name: /Admin/i, exact: true }).click()

        // Employee name
        await this.employeeNameInput.fill(employeeName)

        const employeeSugesstion = await this.page.getByRole('option',
            { name: employeeName, exact: true })

        await expect(employeeSugesstion).toBeVisible()
        await employeeSugesstion.click()

        // Status
        await this.statusDropdown.click()
        await this.page.getByRole('option',
            { name: /Enabled/i, exact: true }).click()

        // Username
        await this.usernameInput.fill(username)

        // Password
        await this.passwordInput.fill(password)

        // Confirm password
        await this.confirmPasswordInput.fill(password)

        // Save
        await this.saveButton.click()

        // Save -> System users page
        await expect(this.page).toHaveURL(/admin\/viewSystemUsers/)

        const loadingSpinner = this.page.locator('.oxd-loading-spinner')
        await expect(loadingSpinner).toBeHidden()

        // Wait until the page is actually stable
        await expect(this.searchUsernameInput).toBeVisible()
    }

    async SearchAndverifySystemUser(username, employeename) {

        // Search using the unique username
        await this.searchUsernameInput.fill(username)
        await expect(this.searchUsernameInput).toHaveValue(username)

        await this.searchButton.click()

        // Retrieving the matched user row
        await expect(this.userRows).toHaveCount(1)

        const userRow = this.userRows.first()


        // Verify the retrieved record
        await expect(userRow).toBeVisible()
        await expect(userRow).toContainText(username)
        await expect(userRow).toContainText('Admin')
        await expect(userRow).toContainText(employeename)
        await expect(userRow).toContainText('Enabled')

        return userRow
    }
}
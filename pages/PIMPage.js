import { expect } from "@playwright/test"

export class PIMPage {

    // This page object covers the OrangeHRM PIM area: navigation, employee search, and employee creation.
    constructor(page) {
        this.page = page

        // PIM module navigation and page-state locators.
        this.pimMenu = page.getByRole('link', { name: 'PIM', exact: true })
        this.pimHeading = page.locator('span.oxd-topbar-header-breadcrumb')

        this.employeeListLink = page.getByRole('link', { name: 'Employee List', exact: true })

        // Employee list and search locators used to locate records after creation.
        this.searchEmployeeId = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .locator('input')
        this.searchButton = page.getByRole('button', { name: 'Search' })
        this.employeeTable = page.locator('.oxd-table')
        this.employeeRows = this.employeeTable.locator('.oxd-table-body .oxd-table-card')

        // Add employee form locators used when creating a new record.
        this.addEmployeeButton = page.locator('//button[@class="oxd-button oxd-button--medium oxd-button--secondary"]')
        this.firstName = page.getByPlaceholder('First Name')
        this.middleName = page.getByPlaceholder('Middle Name')
        this.lastName = page.getByPlaceholder('Last Name')
        this.saveButton = page.getByRole('button', { name: ' Save ', exact: true })
        this.loadingSpinner = page.locator('.oxd-loading-spinner')

        // Employee id collides with the existing id
        this.employeeIdError = this.page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .getByText('Employee Id already exists')

        // Employee detail page locators used to confirm the record was saved correctly.
        this.employeeFullName = page.locator('div.orangehrm-edit-employee-name')
        this.employeeId = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .locator('input')


        // PIM page table element locators
        this.editIcon = page.locator('button:has(i.bi-pencil-fill)')
        this.deleteIcon = page.locator('button:has(i.bi-trash)')

        // Confirmation dialog box after deleting the employee on PIM page
        this.confirmDeleteButton = page.getByRole('button', {
            name: 'Yes, Delete'
        })
    }

    // Open the PIM module from the left navigation.
    async navigateToPIM() {
        await this.pimMenu.click()

        await expect(this.pimHeading).toHaveText('PIM', {
            timeout: 30000
        })
    }


    // Open the employee details page by clicking the retrieved employee row.
    async editEmployee(row) {

        await row.locator(this.editIcon).click()

        await expect(this.page).toHaveURL(
            /\/pim\/viewPersonalDetails\/empNumber\/\d+/,
            { timeout: 30000 }
        )

        await expect(this.loadingSpinner).toBeHidden({
            timeout: 30000
        })

        // Wait for the employee details page to load
        await expect(this.firstName).toBeVisible({ timeout: 20000 })
        await expect(this.lastName).toBeVisible({ timeout: 20000 })
    }


    // Delete the employee represented by the retrieved employee row.
    async deleteEmployee(row) {
        await row.locator(this.deleteIcon).click()

        await expect(this.confirmDeleteButton).toBeVisible({ timeout: 30000 })

        await expect(this.confirmDeleteButton).toBeEnabled({
            timeout: 30000
        })

        await this.confirmDeleteButton.click()
    }


    // Search for an employee by ID and verify that no matching record exists.
    async verifyEmployeeDeleted(employeeId) {
        await expect(this.searchEmployeeId).toBeVisible({ timeout: 20000 })

        await this.searchEmployeeId.fill(employeeId)

        await expect(this.searchEmployeeId).toHaveValue(employeeId)

        await this.searchButton.click()

        await expect(this.employeeRows).toHaveCount(0)
    }


    // Open the add employee form and wait for the first input field to be ready.
    async navigateToAddEmployee() {
        await this.addEmployeeButton.click()
        await expect(this.firstName).toBeVisible()
    }

    // Fill the employee personal information and submit the form to create the record.
    async addNewEmployee(firstName, middleName, lastName) {

        await this.firstName.fill(firstName)
        await this.middleName.fill(middleName)
        await this.lastName.fill(lastName)

        await this.saveButton.click()

        // Wait for the duplicate Employee ID validation, if any
        if (await this.employeeIdError.isVisible({ timeout: 3000 }).catch(() => false)) {
            const uniqueEmployeeId = String(
                Math.floor(100000 + Math.random() * 900000)
            )

            await this.employeeId.fill(uniqueEmployeeId)
            await expect(this.employeeId).toHaveValue(uniqueEmployeeId)

            await this.saveButton.click()
        }


        // Wait for Save operation to complete.
        await expect(this.loadingSpinner).toBeHidden({ timeout: 30000 })

        // Confirm the saved employee details
        await expect(this.employeeFullName).toBeVisible({ timeout: 30000 })
        await expect(this.firstName).toHaveValue(firstName, { timeout: 30000 })
        await expect(this.middleName).toHaveValue(middleName, { timeout: 30000 })
        await expect(this.lastName).toHaveValue(lastName, { timeout: 30000 })

        // OrangeHRM generates the Employee ID after saving
        await expect(this.employeeId).toHaveValue(/\S+/, { timeout: 30000 })
    }

    // Retrieve the employee ID assigned by the system after saving the form.
    async getEmployeeId() {

        await expect(this.employeeId).toHaveValue(/\S+/)
        return await this.employeeId.inputValue()
    }


    // Update any combination of employee name fields provided by the test.
    async updateEmployeeDetails({ firstName, middleName, lastName } = {}) {
        if (firstName != undefined) {
            await this.firstName.click()
            await this.firstName.press('Control+A')
            await this.firstName.press('Backspace')
            await expect(this.firstName).toHaveValue('')
            await this.firstName.fill(firstName)
            await expect(this.firstName).toHaveValue(firstName)
        }

        if (middleName != undefined) {
            await this.middleName.click()
            await this.middleName.press('Control+A')
            await this.middleName.press('Backspace')
            await expect(this.middleName).toHaveValue('')
            await this.middleName.fill(middleName)
            await expect(this.middleName).toHaveValue(middleName)
        }

        if (lastName != undefined) {
            await this.lastName.click()
            await this.lastName.press('Control+A')
            await this.lastName.press('Backspace')
            await expect(this.lastName).toHaveValue('')
            await this.lastName.fill(lastName)
            await expect(this.lastName).toHaveValue(lastName)
        }
    }


    // Save the updated employee information in employee details page
    async saveEmployeeDetails() {
        const updatedFirstName = await this.firstName.inputValue()
        const updatedMiddleName = await this.middleName.inputValue()
        const updatedLastName = await this.lastName.inputValue()

        await this.saveButton.first().click()

        await expect(this.loadingSpinner).toBeHidden({
            timeout: 30000
        })

        await expect(this.firstName).toHaveValue(updatedFirstName, {
            timeout: 30000
        })

        await expect(this.middleName).toHaveValue(updatedMiddleName, {
            timeout: 30000
        })

        await expect(this.lastName).toHaveValue(updatedLastName, {
            timeout: 30000
        })
    }

    // Return to the employee list page so the newly created person can be searched and validated.
    async navigateToEmployeeList() {
        await this.employeeListLink.click()

        await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList/, { timeout: 30000 })

        await expect(this.loadingSpinner).toBeHidden({ timeout: 30000 })

        // Wait for the PIM page and its employee-search controls
        // to actually become available.
        await expect(this.searchEmployeeId).toBeVisible({ timeout: 30000 })

        await expect(this.employeeTable).toBeVisible({ timeout: 30000 })
    }

    // Search with the Employee Id after the employee information changes
    async searchEmployeeById(employeeId) {
        await expect(this.searchEmployeeId).toBeVisible({ timeout: 30000 })

        await this.searchEmployeeId.fill(employeeId)
        await expect(this.searchEmployeeId).toHaveValue(employeeId)

        await this.searchButton.click()

        await expect(this.loadingSpinner).toBeHidden({
            timeout: 30000
        })

        const matchingEmployeeRow = this.employeeRows.filter({
            has: this.page.locator('.oxd-table-cell').filter({
                hasText: employeeId
            })
        })

        await expect(matchingEmployeeRow).toHaveCount(1, {
            timeout: 30000
        })

        await expect(matchingEmployeeRow).toContainText(employeeId)

        return matchingEmployeeRow
    }

    // Match the visible employee row against the expected employee ID after employee info changes
    async findEmployeeById(employeeId) {

        const row = this.employeeRows.filter({
            has: this.page.locator('.oxd-table-cell', { hasText: employeeId })
        })

        await expect(row).toHaveCount(1, { timeout: 30000 })

        await expect(row).toContainText(employeeId)

        return row
    }
}
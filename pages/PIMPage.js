import { expect } from "@playwright/test"

export class PIMPage {

    // This page object covers the OrangeHRM PIM area: navigation, employee search, and employee creation.
    constructor(page) {
        this.page = page

        // PIM module navigation and page-state locators.
        this.pimMenu = page.getByRole('link', { name: 'PIM', exact: true })
        this.pimHeading = page.locator('span.oxd-topbar-header-breadcrumb')

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
    }


    // Open the employee details page by clicking the retrieved employee row.
    async editEmployee(row) {

        await row.locator(this.editIcon).click()

        // Wait for the employee details page to load
        await this.employeeFullName.waitFor({ state: 'visible' })
    }


    // Delete the employee represented by the retrieved employee row.
    async deleteEmployee(row) {
        await row.locator(this.deleteIcon).click()

        await expect(this.confirmDeleteButton).toBeVisible()

        await this.confirmDeleteButton.click()
    }


    // Search for an employee by ID and verify that no matching record exists.
    async verifyEmployeDeleted(employeeId) {
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

        await this.employeeFullName.waitFor({ state: 'visible' })
    }

    // Retrieve the employee ID assigned by the system after saving the form.
    async getEmployeeId() {
        // await this.employeeId.waitFor({ state: 'visible' })

        await expect(this.employeeId).toHaveValue(/\S+/)
        return await this.employeeId.inputValue()
    }


    // Update any combination of employee name fields provided by the test.
    async updateEmployeeDetails({ firstName, middleName, lastName } = {}) {

        if (firstName != undefined) {
            await this.firstName.fill(firstName)
        }

        if (middleName != undefined) {
            await this.middleName.fill(middleName)
        }

        if (lastName != undefined) {
            await this.lastName.fill(lastName)
        }
    }


    // Save the updated employee information in employee details page
    async saveEmployeeDetails() {

        await this.saveButton.first().click()

        await this.employeeFullName.waitFor({ state: 'visible' })
    }

    // Return to the employee list page so the newly created person can be searched and validated.
    async navigateToEmployeeList() {
        await this.pimMenu.click()
        await this.pimHeading.waitFor()
    }

    // Search with the Employee Id after the employee information changes
    async searchEmployeeById(employeeId) {

        await this.searchEmployeeId.fill(employeeId)
        await expect(this.searchEmployeeId).toHaveValue(employeeId)

        await this.searchButton.click()

        await expect(this.employeeRows).toHaveCount(1)
    }

    // Match the visible employee row against the expected employee ID after employee info changes
    async findEmployeeById(employeeId) {

        await this.employeeRows.first().waitFor({ state: 'visible' })

        const rows = this.employeeRows

        for (let i = 0; i < await rows.count(); i++) {

            const row = rows.nth(i)
            const employeeIdCell = row.locator('.oxd-table-cell').nth(1)

            if ((await employeeIdCell.innerText()).trim() === employeeId) {
                return row
            }
        }
        return null
    }
}
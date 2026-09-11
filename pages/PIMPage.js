export class PIMPage {

    // This page object covers the OrangeHRM PIM area: navigation, employee search, and employee creation.
    constructor(page) {
        this.page = page

        // PIM module navigation and page-state locators.
        this.pimMenu = page.getByRole('link', { name: 'PIM', exact: true })
        this.pimHeading = page.locator('span.oxd-topbar-header-breadcrumb')

        // Employee list and search locators used to locate records after creation.
        this.searchEmployeeName = page.getByPlaceholder('Type for hints...')
        this.searchButton = page.getByRole('button', { name: 'Search' })
        this.employeeTable = page.locator('.oxd-table')
        this.employeeRows = this.employeeTable.locator('.oxd-table-card')

        // Add employee form locators used when creating a new record.
        this.addEmployeeButton = page.locator('//button[@class="oxd-button oxd-button--medium oxd-button--secondary"]')
        this.addFirstName = page.getByPlaceholder('First Name')
        this.addMiddleName = page.getByPlaceholder('Middle Name')
        this.addLastName = page.getByPlaceholder('Last Name')
        this.addSaveButton = page.getByRole('button', { name: ' Save ', exact: true })

        // Employee detail page locators used to confirm the record was saved correctly.
        this.employeeFullName = page.locator('div.orangehrm-edit-employee-name')
        this.employeeId = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .locator('input')
    }

    // Open the PIM module from the left navigation.
    async navigateToPIM() {
        await this.pimMenu.click()
    }

    // Search the employee list using the first name to find the created record.
    async searchEmployee(searchKeyword) {
        await this.searchEmployeeName.first().fill(searchKeyword)
        await this.searchButton.click()
        await this.employeeRows.first().waitFor()
    }

    // Match the visible employee row against the expected name and use employee ID as a second validation check.
    async findEmployee(employeeName, employeeID = null) {
        const rows = this.employeeRows
        const matchingRows = []

        const expectedName = employeeName
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()

        for (let i = 0; i < await rows.count(); i++) {
            const row = rows.nth(i)
            const cells = row.locator('.oxd-table-cell')

            const actualEmployeeID = (await cells.nth(1).innerText()).trim()
            const actualFirstMiddleName = (await cells.nth(2).innerText()).trim()
            const lastName = (await cells.nth(3).innerText()).trim()

            const actualEmployeeName = `${actualFirstMiddleName} ${lastName}`
                .trim()
                .replace(/\s+/g, ' ')
                .toLowerCase()

            if (actualEmployeeName === expectedName) {
                matchingRows.push({
                    row,
                    employeeID: actualEmployeeID
                })
            }
        }

        if (matchingRows.length === 0) {
            return null
        }

        if (!employeeID) {
            if (matchingRows.length === 1) {
                return matchingRows[0].row
            }

            throw new Error(
                `Multiple employees found for "${employeeName}". Employee ID is required.`
            )
        }

        const matchingEmployee = matchingRows.find(employee => employee.employeeID === employeeID)
        return matchingEmployee ? matchingEmployee.row : null
    }

    // Open the add employee form and wait for the first input field to be ready.
    async navigateToAddEmployee() {
        await this.addEmployeeButton.click()
        await this.addFirstName.waitFor({ state: 'visible' })
    }

    // Fill the employee personal information and submit the form to create the record.
    async addNewEmployee(firstName, middleName, lastName) {
        await this.addFirstName.fill(firstName)
        await this.addMiddleName.fill(middleName)
        await this.addLastName.fill(lastName)
        await this.addSaveButton.click()

        await this.employeeFullName.waitFor({ state: 'visible' })
    }

    // Retrieve the employee ID assigned by the system after saving the form.
    async getEmployeeId() {
        await this.employeeId.waitFor({ state: 'visible' })
        return await this.employeeId.inputValue()
    }

    // Return to the employee list page so the newly created person can be searched and validated.
    async navigateToEmployeeList() {
        await this.pimMenu.click()
        await this.pimHeading.waitFor()
    }
}
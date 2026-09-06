export class PIMPage {

    // Initialize navigation, search, and result-table locators.
    constructor(page) {

        // Keep a reference to the browser page used by this page object.
        this.page = page

        // Locate the exact PIM item in the main navigation menu.
        this.PIMMenu = page.getByText('PIM', { exact: true })

        // Locate the breadcrumb heading that identifies the PIM page.
        this.PIMHeading = page.locator('span.oxd-topbar-header-breadcrumb')

        // Locate the employee-name autocomplete field used by the search form.
        this.searchEmployeeName = page.getByPlaceholder('Type for hints...')

        // Locate the button that submits the employee search.
        this.searchButton = page.getByRole('button', { name: 'Search' })

        // Locate the table containing the employee search results.
        this.employeeTable = page.locator('.oxd-table')

        // Locate each result row within the employee table.
        this.employeeRows = this.employeeTable.locator('.oxd-table-card')
    }

    // Open the PIM section from the application navigation.
    async navigateToPIM() {

        // Click the PIM navigation item.
        await this.PIMMenu.click()
    }

    // Submit the supplied keyword and wait until at least one result row is rendered.
    async searchEmployee(searchKeyword) {

        // Use the first matching autocomplete field and enter the search keyword.
        await this.searchEmployeeName.first().fill(searchKeyword)

        // Submit the employee search request.
        await this.searchButton.click()

        // Wait for the first result row so later row operations have rendered content.
        await this.employeeRows.first().waitFor()
    }

    // Match by normalized name and optionally disambiguate duplicate names by employee ID.
    async findEmployee(employeeName, employeeID = null) {

        // Reuse the locator for all rows returned by the employee search.
        const rows = this.employeeRows

        // Store rows whose normalized names match the requested employee.
        const matchingRows = []

        // Normalize the expected name to make matching insensitive to extra spaces and case.
        const expectedName = employeeName
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()

        // Inspect every returned employee row.
        for (let i = 0; i < await rows.count(); i++) {

            // Select the current row being inspected.
            const row = rows.nth(i)

            // Locate the cells that contain the current employee's values.
            const cells = row.locator('.oxd-table-cell')

            // Read and normalize the employee ID from the second table cell.
            const actualEmployeeID =
                (await cells.nth(1).innerText()).trim()

            // Read and normalize the employee first name from the third table cell.
            const firstName =
                (await cells.nth(2).innerText()).trim()

            // Read and normalize the employee last name from the fourth table cell.
            const lastName =
                (await cells.nth(3).innerText()).trim()

            // Build a normalized full name from the first-name and last-name cells.
            const actualEmployeeName = `${firstName} ${lastName}`
                .trim()
                .replace(/\s+/g, ' ')
                .toLowerCase()

            // Record the row and ID when the employee name matches the requested name.
            if (actualEmployeeName === expectedName) {

                // Preserve both the row locator and ID for possible duplicate-name resolution.
                matchingRows.push({
                    row,
                    employeeID: actualEmployeeID
                })
            }
        }

        // Return null when the search produced no matching employee.
        if (matchingRows.length === 0) {

            return null

        }

        // Return the only match immediately when no duplicate name exists.
        if (matchingRows.length === 1) {

            return matchingRows[0].row

        }

        // Require an ID when the name alone cannot uniquely identify an employee.
        if (!employeeID) {

            // Report the missing disambiguating value to the calling test.
            throw new Error(
                `Multiple employees found for "${employeeName}". Employee ID is required.`
            )
        }

        // Compare the supplied ID with each duplicate-name match.
        for (const employee of matchingRows) {

            // Return the row whose employee ID matches the requested ID.
            if (employee.employeeID === employeeID) {

                return employee.row
            }
        }

        // Return null when the name matched but the supplied ID did not.
        return null
    }
}
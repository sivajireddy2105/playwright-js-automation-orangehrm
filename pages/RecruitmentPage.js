import { expect } from "@playwright/test";

export class RecruitmentPage {

    constructor(page) {

        this.page = page

        // Recruitment page
        this.topBarHeader = page.locator('span.oxd-topbar-header-breadcrumb')

        this.vacanciesLink = page.getByRole('link', { name: /Vacancies/i, exact: true })

        // Vacancies page
        this.addVacancyButton = page.getByRole('button', { name: /Add/i })

        this.vacancyRows = page.locator('.oxd-table-body .oxd-table-card')

        // Add / Edit vacancy page
        this.vacancyHeading = page.getByRole('heading',
            { name: /Add Vacancy|Edit Vacancy/i, exact: true })

        this.vacancyNameInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Vacancy Name' })
            .locator('input')

        this.jobTitleDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Job Title' })
            .locator('.oxd-select-text')

        this.descriptionInput = page.getByPlaceholder('Type description here')

        this.hiringManagerInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Hiring Manager' })
            .locator('input')

        this.numberOfPositionsInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Number of Positions' })
            .locator('input')

        this.saveButton = page.getByRole('button', { name: /Save/i, exact: true })
    }

    async verifyRecruitmentPage() {

        await expect(this.topBarHeader).toHaveText('Recruitment')
    }

    async navigateToVacncies() {

        await this.vacanciesLink.click()

        await expect(this.page).toHaveURL(/recruitment\/viewJobVacancy/)

        // Wait for the Vacancies page to actually render
        await expect(this.addVacancyButton).toBeVisible()
    }

    async openAddVacancyPage() {

        await this.addVacancyButton.click()

        await expect(this.vacancyHeading).toHaveText('Add Vacancy')
    }

    async addVacancy({ vacancyName, jobTitle, description, hiringManager, numberOfPositions }) {

        await this.vacancyNameInput.fill(vacancyName)

        await this.jobTitleDropdown.click()

        await this.page.getByRole('option', { name: jobTitle, exact: true }).click()

        await this.descriptionInput.fill(description)

        await this.hiringManagerInput.fill(hiringManager)


        const hiringManagerSuggestion = this.page.getByRole('option',
            { name: hiringManager, exact: true }
        )

        await expect(hiringManagerSuggestion).toBeVisible()
        await hiringManagerSuggestion.click()

        await this.numberOfPositionsInput.fill(numberOfPositions.toString())

        await this.saveButton.click()

        // First confirm that Save actually completed the transition
        await expect(this.page).toHaveURL(/recruitment\/addJobVacancy\/\d+/, {timeout: 30000})

        // Wait for the page to transition from Add Vacancy to Edit Vacancy
        await expect(this.vacancyHeading).toHaveText('Edit Vacancy', { timeout: 15000 })

        // Wait for the saved record to actually populate
        await expect(this.vacancyNameInput).toHaveValue(vacancyName)

    }

    async verifyVacancyDetails({
        vacancyName, jobTitle, description, hiringManager, numberOfPositions }) {

        await expect(this.vacancyNameInput).toHaveValue(vacancyName)
        await expect(this.jobTitleDropdown).toHaveText(jobTitle)
        await expect(this.descriptionInput).toHaveValue(description)
        await expect(this.hiringManagerInput).toHaveValue(hiringManager)
        await expect(this.numberOfPositionsInput).toHaveValue(numberOfPositions.toString())

    }

    async navigateBackToVacancies() {

        await this.vacanciesLink.click()

        await expect(this.page).toHaveURL(/recruitment\/viewJobVacancy/)
    }

    async verifyVacancyInList(vacancyName, hiringManager) {

        const vacancyRow = this.vacancyRows.filter({
            hasText: vacancyName
        })

        await expect(vacancyRow).toHaveCount(1)
        await expect(vacancyRow).toBeVisible()
        await expect(vacancyRow).toContainText(vacancyName)
        await expect(vacancyRow).toContainText(hiringManager)

        return vacancyRow
    }
}
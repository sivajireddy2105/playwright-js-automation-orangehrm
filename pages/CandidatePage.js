import { expect } from "@playwright/test";

export class CandidatePage {

    constructor(page) {

        this.page = page

        // Candidates Link item in the sub-navigation bar
        this.candidatesLink = page.getByRole('link', { name: /Candidates/i, exact: true })

        // Candidates page
        this.candidatesHeading = page.getByRole('heading', { name: /Candidates/i, exact: true })

        this.addCandidateButton = page.getByRole('button', { name: /Add/i, exact: true })

        // Add candidate page
        this.addCandidateHeading = page.getByRole('heading', { name: /Add Candidate/i, exact: true })

        this.firstNameInput = page.locator('input[name="firstName"]')
        this.middleNameInput = page.locator('input[name="middleName"]')
        this.lastNameInput = page.locator('input[name="lastName"]')

        this.vacancyDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Vacancy' })
            .locator('.oxd-select-text')

        this.emailInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Email' })
            .locator('input')

        this.resumeInput = page.locator('input[type="file"].oxd-file-input')

        this.consentCheckbox = page.locator("//i[@class='oxd-icon bi-check oxd-checkbox-input-icon']")

        this.saveButton = page.getByRole('button', { name: /Save/i, exact: true })

        // Application stage
        this.applicationStageHeading = page.getByRole('heading',
            { name: /Application Stage/i, exact: true }
        )
    }


    async navigateToCandidates() {

        await expect(this.candidatesLink).toBeVisible()

        await this.candidatesLink.click()

        await expect(this.candidatesHeading).toBeVisible()
    }


    async openAddCandidatePage() {

        await expect(this.addCandidateButton).toBeVisible()

        await this.addCandidateButton.click()

        await expect(this.addCandidateHeading).toBeVisible()
    }


    async addCandidate({
        firstName, middleName, lastName, vacancy, email, resumeUpload
    }) {

        await this.firstNameInput.fill(firstName)
        await this.middleNameInput.fill(middleName)
        await this.lastNameInput.fill(lastName)

        await this.vacancyDropdown.click()

        const vacancyOption = this.page.getByRole('option',
            { name: vacancy, exact: true }
        )

        await expect(vacancyOption).toBeVisible()
        await vacancyOption.click()

        await this.emailInput.fill(email)

        await this.resumeInput.setInputFiles(resumeUpload)

        await this.consentCheckbox.check()
        await expect(this.consentCheckbox).toBeChecked()

        await this.saveButton.click()

        await expect(this.applicationStageHeading).toBeVisible({ timeout: 30000 })
    }


    async verifyApplicationStage({
        candidateName, vacancy, hiringManager, status
    }) {
        
        await expect(this.applicationStageHeading).toBeVisible()

        const summaryValues = this.page.locator('p.oxd-text--p')

        await expect(
            summaryValues.filter({ hasText: candidateName })
        ).toHaveText(candidateName)

        await expect(
            summaryValues.filter({ hasText: vacancy })
        ).toHaveText(vacancy)

        await expect(
            summaryValues.filter({ hasText: hiringManager })
        ).toHaveText(hiringManager)

        await expect(
            this.page.getByText(`Status: ${status}`, { exact: true })
        ).toBeVisible()
    }


    async navigateBackToCandidates() {

        await expect(this.candidatesLink).toBeVisible()

        await this.candidatesLink.click()

        await expect(this.candidatesHeading).toBeVisible()
    }


    async verifyCandidateInList({
        candidateName, vacancy, hiringManager, status
    }) {

        const candidateRow = this.page
            .locator('.oxd-table-body .oxd-table-card')
            .filter({ hasText: candidateName })

        await expect(candidateRow).toHaveCount(1)
        await expect(candidateRow).toBeVisible()

        await expect(candidateRow).toContainText(candidateName)
        await expect(candidateRow).toContainText(vacancy)
        await expect(candidateRow).toContainText(hiringManager)
        await expect(candidateRow).toContainText(status)

        return candidateRow
    }
}
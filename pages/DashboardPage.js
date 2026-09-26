export class DashboardPage {

    // This page object represents the authenticated dashboard, where the user can confirm access and log out.
    constructor(page) {
        this.page = page

        // The dashboard heading confirms the user successfully signed in.
        this.dashboardHeading = page.locator('span.oxd-topbar-header-breadcrumb')

        // Admin module navigation
        this.adminMenu = page.getByRole('link', { name: 'Admin', exact: true })

        // Profile-menu selectors used for logout and account actions.
        this.userMenu = page.locator('i.oxd-userdropdown-icon')
        this.logoutLink = page.getByRole('menuitem', { name: 'Logout' })

        // Recruitment menu
        this.recruitmentMenu = page.getByRole('link', { name: /Recruitment/i, exact: true })
    }


    // Navigate to the Admin module 
    async navigateToAdmin() {
        await this.adminMenu.click()
    }

    // Navigate to the recruitment module
    async navigateToRecruitment() {

        await Promise.all([
            this.page.waitForURL(/recruitment\/viewCandidates/),
            this.recruitmentMenu.click()
        ])
    }


    // Open the account menu and sign out from the authenticated session.
    async logout() {
        await this.userMenu.click()
        await this.logoutLink.click()
    }
}
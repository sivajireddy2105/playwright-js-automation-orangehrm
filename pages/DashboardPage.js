export class DashboardPage {

    // This page object represents the authenticated dashboard, where the user can confirm access and log out.
    constructor(page) {
        this.page = page

        // The dashboard heading confirms the user successfully signed in.
        this.dashboardHeading = page.locator('span.oxd-topbar-header-breadcrumb')

        // Profile-menu selectors used for logout and account actions.
        this.userMenu = page.locator('i.oxd-userdropdown-icon')
        this.logoutLink = page.getByRole('menuitem', { name: 'Logout' })
    }

    // Open the account menu and sign out from the authenticated session.
    async logout() {
        await this.userMenu.click()
        await this.logoutLink.click()
    }
}
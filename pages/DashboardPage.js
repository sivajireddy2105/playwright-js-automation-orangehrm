export class DashboardPage {

    // Initialize dashboard locators using the shared Playwright page instance.
    constructor(page) {

        // Keep a reference to the browser page for future page-object actions.
        this.page = page

        // Locate the breadcrumb that identifies the currently displayed dashboard.
        this.dashboardHeading = page.locator('span.oxd-topbar-header-breadcrumb')

        // Locate the icon that opens the logged-in user's account menu.
        this.userMenu = page.locator('i.oxd-userdropdown-icon')

        // Locate the logout command inside the opened account menu.
        this.logoutLink = page.getByRole('menuitem', { name: 'Logout' })
    }

    // Open the user account menu before selecting its logout option.
    async logout() {

        // Open the account menu so its menu items become available.
        await this.userMenu.click()

        // Select Logout to end the current authenticated session.
        await this.logoutLink.click()
    }
}
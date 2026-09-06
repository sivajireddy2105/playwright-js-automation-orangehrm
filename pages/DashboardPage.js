export class DashboardPage {
    constructor(page) {
        this.page = page
        this.dashboardHeading = page.locator('span.oxd-topbar-header-breadcrumb')
        this.userMenu = page.locator('i.oxd-userdropdown-icon')
        this.logoutLink = page.getByRole('menuitem', { name: 'Logout' })
    }

    // Method to perform logout action
    async logout(){
        await this.userMenu.click()
        await this.logoutLink.click()
    }
}
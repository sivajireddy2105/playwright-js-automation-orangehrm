export class LoginPage {

    // This page object represents the OrangeHRM login screen and centralizes all auth-related selectors.
    constructor(page) {
        this.page = page

        // Login form selectors used for the sign-in flow.
        this.usernameInput = page.getByRole('textbox', { name: 'Username' })
        this.passwordInput = page.getByRole('textbox', { name: 'Password' })
        this.loginButton = page.getByRole('button', { name: ' Login ' })
        this.invalidCredentialsError = page.getByText('Invalid credentials', { exact: true })
    }

    // Fill the username and password and submit the form to authenticate the user.
    async login(username, password) {
        await this.usernameInput.fill(username)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
    }
}
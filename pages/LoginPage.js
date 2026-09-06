export class LoginPage {

    // Initialize login controls and validation-message locators.
    constructor(page) {

        // Keep a reference to the browser page for this page object.
        this.page = page

        // Locate the username input by its accessible role and label.
        this.usernameInput = page.getByRole('textbox', { name: 'Username' })

        // Locate the password input by its accessible role and label.
        this.passwordInput = page.getByRole('textbox', { name: 'Password' })

        // Locate the button that submits the login form.
        this.loginButton = page.getByRole('button', { name: ' Login ' })

        // Locate the exact error message shown for invalid credentials.
        this.invalidCredentialsError = page.getByText('Invalid credentials', { exact: true })
    }


    // Accept credentials as arguments so tests can reuse the same login workflow.
    async login(username, password) {

        // Enter the supplied username into the login form.
        await this.usernameInput.fill(username)

        // Enter the supplied password into the login form.
        await this.passwordInput.fill(password)

        // Submit the login form after both fields have been populated.
        await this.loginButton.click()
    }
}
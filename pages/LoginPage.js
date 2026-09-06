export class LoginPage{
    constructor(page){
        this.page = page
        this.usernameInput = page.getByRole('textbox', {name: 'Username'})
        this.passwordInput = page.getByRole('textbox', {name: 'Password'})
        this.loginButton = page.getByRole('button', {name: ' Login '})
        this.invalidCredentialsError = page.getByText('Invalid credentials', {exact: true})
    }


    // Method to perform login action
    async login(username, password){
        await this.usernameInput.fill(username)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
    }
}
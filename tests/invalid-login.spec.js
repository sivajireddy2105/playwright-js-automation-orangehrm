import {test, expect} from '@playwright/test'

import {LoginPage} from '../pages/LoginPage'

test('TC02 - Verify that the application rejects invalid authentication credentials and the user remains unauthenticated.', async({page})=>{
    const loginPage = new LoginPage(page)
    
    await page.goto('/')

    await loginPage.login('Admin', 'Admin1234')

    await loginPage.invalidCredentialsError.waitFor({state: 'visible'})
    expect(await loginPage.invalidCredentialsError).toBeVisible()

    await page.pause()
})
import { expect, Page } from '@playwright/test';
import { PageObject, Click } from '../lib/Page';
import { ENV } from '../config';
import testData from '../testdata/auth-users.json';
import logger from '../lib/logger';

/**
 * AuthPage — Page Object for the SwagLabs login page.
 * 
 * Inherits:
 * - Methods for interacting with UI elements from PageObject
 * - Search, click, input, parsing list utilities
 * 
 * Adds:
 * - Login operations
 * - Error state checking
 */
export class AuthPage extends PageObject {
    private selectors = testData.elements.authPageSelectors;

    constructor(page: Page) {
        super(page);
    }

    /**
     * Open the login page.
     */
    async open() {
        logger.info(`Navigating to the login page: ${ENV.BASE_URL}`);
        await this.navigateTo(ENV.BASE_URL);
    }

    /**
     * Login by username and password.
     * @param username - username
     * @param password - password
     */
    async login(username: string, password: string) {
        await this.open();
        await this.fillInput(this.selectors.inputSelectors.usernameInput, username);
        await this.fillInput(this.selectors.inputSelectors.passwordInput, password);
        await this.clickButton('Login', this.selectors.buttonSelectors.loginButton, Click.Yes);
    }

    /**
     * Check the display of an error message.
     * @param expectedText - part of the text that should contain the error element
     */
    async expectErrorMessage(expectedText: string) {
        const errorLocator = this.page.locator(this.selectors.errorMessageSelectors.errorMessage);
        await errorLocator.waitFor({ state: 'visible' });
        await logger.debug(`Checking the error text: should contain "${expectedText}"`);
        await expect(errorLocator).toContainText(expectedText);
    }

    /**
     * Get a list of users from the screen.
     */
    async getUsersList(): Promise<string[]> {
        return this.getListFromContainer('[data-test="login-credentials"]', ['Accepted usernames']);
    }

    /**
     * Get a list of passwords from the screen.
     */
    async getPasswordsList(): Promise<string[]> {
        return this.getListFromContainer('[data-test="login-password"]', ['Password for all users']);
    }

    /**
     * Check the title logo.
     */
    async checkTitleLogo(expectedTitle: string) {
        await expect(this.page.locator('.login_logo')).toHaveText(expectedTitle);
    }
}

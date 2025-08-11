import { Page } from '@playwright/test';
import { ENV } from '../config'; // Assuming there's a config file for configuration

/**
 * AbstractPage serves as a base class for other page objects to inherit from.
 * It contains the common functionality for interacting with web pages.
 */
export abstract class AbstractPage {
    protected page: Page;

    /**
     * Initializes the page object with a Playwright page instance.
     * @param page - Playwright Page instance for interacting with the browser.
     */
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a specific URL.
     * @param url - URL to open.
     */
    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
    }
}

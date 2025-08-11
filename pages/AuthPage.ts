import { PageObject } from "../lib/Page";
import { Page, expect, Locator } from '@playwright/test'; // Import Playwright's Page class

export class AuthPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }
}

/**
 * @file Page.ts
 * @description Universal actions for Page Object in Playwright.
 */

import { Locator, Page, expect } from '@playwright/test';
import { AbstractPage } from './AbstractPage';
import logger from './logger';

export enum Click {
    Yes = 'Yes',
    No = 'No'
}

/**
 * PageObject — base class for specific pages.
 * Inherits from AbstractPage and adds:
 * - working with buttons
 * - working with input fields
 * - parsing headers
 * - utilities for waiting for elements
 */
export class PageObject extends AbstractPage {
    private debugMode = process.env.DEBUG_HIGHLIGHT === 'true';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Click on a button with text verification.
     * @param textButton - expected text of the button.
     * @param locator - CSS selector of the button.
     * @param click - perform the click action (default is Click.Yes).
     */
    async clickButton(textButton: string, locator: string, click: Click = Click.Yes) {
        const button = this.page.locator(locator, { hasText: textButton });
        await expect(button).toHaveText(textButton);
        await expect(button).toBeVisible();
        if (this.debugMode) await this.highlight(button);
        if (click === Click.Yes) await button.click();
    }

    /**
     * Fills an input field with text and, optionally, presses a key.
     * @param locator - selector of the input field.
     * @param value - value to be entered.
     * @param press - key to press after input (default is 'Enter').
     */
    async fillInput(locator: string, value: string, press: string = 'Enter') {
        const input = this.page.locator(locator);
        await input.fill(value);
        await expect(input).toHaveValue(value);
        if (press) await input.press(press);
    }

    /**
     * Gets an array of H4-headers in the specified container (ignoring <dialog>).
     * @param containerSelector - selector of the container for search.
     */
    async getAllH4TitlesInPage(containerSelector: string): Promise<string[]> {
        const dialogTitles: string[] = [];
        for (const dialog of await this.page.locator('dialog').elementHandles()) {
            const h4Tags = await dialog.$$('h4');
            for (const h4 of h4Tags) {
                const title = await h4.textContent();
                if (title) dialogTitles.push(title.trim());
            }
        }
        logger.debug(`H4 в диалогах: ${JSON.stringify(dialogTitles)}`);

        const classTitles: string[] = [];
        for (const h4Tag of await this.page.locator(`${containerSelector} h4`).all()) {
            const title = await h4Tag.textContent();
            if (title) {
                classTitles.push(title.trim());
                if (this.debugMode) await this.highlight(h4Tag);
            }
        }
        const filteredTitles = classTitles.filter(t => !dialogTitles.includes(t));
        logger.debug(`H4 в контейнере: ${JSON.stringify(filteredTitles)}`);
        return filteredTitles;
    }

    /**
     * Checks if a button with the given label is visible.
     * @param buttonSelector - selector of the button.
     * @param label - text of the button.
     * @param dialogContext - optional selector of the dialog for the search area.
     */
    async isButtonVisible(buttonSelector: string, label: string, dialogContext: string = ''): Promise<boolean> {
        try {
            const scopedSelector = dialogContext ? `${dialogContext} ${buttonSelector}` : buttonSelector;
            const button = this.page.locator(scopedSelector, { hasText: new RegExp(`^\\s*${label}\\s*$`) });
            if (this.debugMode) await this.highlight(button);
            await button.waitFor({ state: 'attached' });
            await expect(button).toBeVisible();
            return true;
        } catch (error) {
            logger.error(`Кнопка "${label}" не найдена или невидима: ${error}`);
            return false;
        }
    }

    /**
     * Returns an array of strings from a container with <br> (e.g., a list of users).
     * @param containerSelector - selector of the container.
     * @param exclude - array of phrases to exclude from the result.
     */
    async getListFromContainer(containerSelector: string, exclude: string[] = []): Promise<string[]> {
        await this.page.waitForSelector(containerSelector, { state: 'visible' });
        const text = await this.page.locator(containerSelector).innerText();
        return text.split('\n').map(l => l.trim()).filter(l => l && !exclude.some(ex => l.startsWith(ex)));
    }

    /**
     * Scrolls the page to the specified locator.
     */
    async scrollTo(locator: string) {
        const element = this.page.locator(locator);
        await element.scrollIntoViewIfNeeded();
        if (this.debugMode) await this.highlight(element);
    }

    /**
     * Highlighting an element (for debugMode).
     */
    private async highlight(locator: Locator) {
        try {
            await locator.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
        } catch (err) {
            logger.warn(`Не удалось подсветить элемент: ${err}`);
        }
    }
}

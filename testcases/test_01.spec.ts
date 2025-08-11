import { test, expect, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import logger from '../lib/logger';
import { AuthPage } from '../lib/AuthPage';
import { ENV } from '../config';
import testData from '../testdata/auth-users.json';

export const runTEST_01 = (isSingleTest: boolean, iterations: number) => {
    logger.info('=== Starting authentication test suite ===');

    const selectors = testData.elements.authPageSelectors;

    // --- TEST 1: Checking the UI on the login page ---
    test('UI checks on login page', async ({ page }) => {
        const authPage = new AuthPage(page);
        await authPage.navigateTo(ENV.BASE_URL);

        const { elements } = testData;

        await allure.step('Check title logo', async () => {
            await expect(page.locator('.login_logo')).toHaveText(elements.titleLogo);
        });

        await allure.step('Check H4 titles', async () => {
            const h4Titles = await authPage.getAllH4TitlesInPage('.login_container');
            expect(h4Titles.map(t => t.trim())).toEqual(elements.titlesH4.map(t => t.trim()));
        });

        await allure.step('Check list of users', async () => {
            const users = await authPage.getListFromContainer('[data-test="login-credentials"]', ['Accepted usernames']);
            expect(users).toEqual(elements.listOfUsers);
        });

        await allure.step('Check list of passwords', async () => {
            const pwds = await authPage.getListFromContainer('[data-test="login-password"]', ['Password for all users']);
            expect(pwds).toEqual(elements.listOfPasswords);
        });

        await allure.step('Check buttons', async () => {
            for (const btn of elements.buttons) {
                expect(await authPage.isButtonVisible(btn.class, btn.label)).toBeTruthy();
            }
        });
    });

    // --- TEST 2: Login for all users ---
    for (const user of testData.users) {
        test(`Login test: ${user.username || 'empty credentials'}`, async ({ page }) => {
            const authPage = new AuthPage(page);
            await authPage.login(user.username, user.password);

            if (user.username === 'locked_out_user' || !user.username || !user.password) {
                await expect(page.locator(selectors.errorMessageSelectors.errorMessage)).toBeVisible();
                await expect(page.locator(selectors.errorMessageSelectors.errorMessage)).toContainText('Epic sadface');
            } else {
                await expect(page).toHaveURL(/.*\/inventory\.html/);
            }
        });
    }

    // --- TEST 3: Special cases ---
    const specialChecks = {
        problem_user: async (page: Page) => {
            await expect(page.locator('.inventory_item_img').first()).toBeVisible();
        },
        performance_glitch_user: async (page: Page) => {
            await expect(page).toHaveURL(/.*\/inventory\.html/, { timeout: ENV.TIMEOUT });
        },
        error_user: async (page: Page) => {
            await expect(page.locator('.inventory_list')).toBeVisible();
        },
        visual_user: async (page: Page) => {
            await expect(page.locator('.inventory_list')).toBeVisible();
            await expect(page.locator('.shopping_cart_link')).toBeVisible();
        }
    };

    for (const [username, checkFn] of Object.entries(specialChecks)) {
        test(`Special case check: ${username}`, async ({ page }) => {
            const authPage = new AuthPage(page);
            await authPage.login(username, 'secret_sauce');
            await expect(page).toHaveURL(/.*\/inventory\.html/);
            await checkFn(page);
        });
    }

    logger.info('=== Authentication test suite completed ===');
};

test.afterAll(async () => {
    logger.end();
});

process.on('beforeExit', () => logger.end());
process.on('exit', () => logger.end());

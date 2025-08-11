/**
 * @file config.ts
 * @date 2025-08-06
 * @purpose To define environment variables (ENV) used throughout the test framework.
 *
 *  Module requirements:
 *     npm install playwright
 *     npm install winston
 *     npm install winston-daily-rotate-file
 *     npm install --save-dev allure-playwright
 */

export const ENV = {
    BASE_URL: process.env.BASE_URL || "https://www.saucedemo.com/",
    TIMEOUT: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 5000,
    HEADLESS: process.env.HEADLESS !== "false",
    TEST_SUITE: 'test_01',
    TEST_DIR: '.',
    DEBUG: true,
};


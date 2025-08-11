import { ENV } from './config'; // Import the selected suite from configuration
import { testSuites } from './testSuiteConfig'; // Import all test suites
import { test } from '@playwright/test'; // Import Playwright's test module
import logger from './lib/logger'; // Import logger for proper cleanup

// Define the type for the keys of testSuites
type TestSuiteKeys = keyof typeof testSuites;

// Ensure selectedSuite is typed as one of the keys of testSuites
const selectedSuite: TestSuiteKeys = ENV.TEST_SUITE as TestSuiteKeys; // Type assertion

// Use the selected suite directly
const suite = testSuites[selectedSuite];

// Create a test.describe block for the selected test suite, including the suite description
test.describe.serial(`Test Suite: ${selectedSuite} - ${suite.description}`, () => {
    // Run the test suite only once
    suite.tests.forEach(({ test: testFunc, description }) => {
        if (typeof testFunc === 'function') {
            try {
                // Run the test function only once
                testFunc(false, 1);
            } catch (error) {
                console.error(`Error in test function for suite "${selectedSuite}":`, error);
            }
        } else {
            console.error(`Test function for suite "${selectedSuite}" is not a valid function.`);
        }
    });

    // Add cleanup after all tests
    test.afterAll(async () => {
        // Properly close the logger
        logger.end();
    });
});


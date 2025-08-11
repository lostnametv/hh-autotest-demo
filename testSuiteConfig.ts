import { runTEST_01 } from './testcases/test_01.spec';

export const testSuites = {
    test_01: {
        description: "Test Suite 01",
        tests: [
            {
                test: runTEST_01,
                description: "Running test: Login verification"
            }
        ]
    }
}
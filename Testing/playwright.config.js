// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests', // Playwright will look for tests in this directory
  // Global timeout for all tests (including setup)
  timeout: 5 * 60 * 1000, // 5 minutes (300000ms) - Adjust as needed

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // This baseURL is a fallback. For API tests, we'll override it in the project.
    // For UI tests, it would point to your frontend.
    baseURL: 'http://localhost:3000', // Default, but overridden by 'API' project for these tests

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    // Added for local development/testing to ignore self-signed certificate errors if any
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    // IMPORTANT: Commenting out default browser projects for now.
    // This ensures only the 'API' project runs your loginSignup.spec.js tests.
    // Uncomment these if you add UI tests later.
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Dedicated project for API tests
    {
      name: 'API', // A descriptive name for your API test project
      // This 'testMatch' ensures ONLY loginSignup.spec.js runs under this project.
      //testMatch: /.*loginSignup\.spec\.js/,
      testMatch: /.*(?:loginSignup|cart|order)\.spec\.js/,
      use: {
        // Override the baseURL specifically for this API project to point to your backend API
        baseURL: 'http://localhost:4000/api',
        // Ensure 'request' fixture is available for API tests
        // This is implicitly available when using 'request' in your test files
      },
      // Configure webServer specifically for this API project to start the backend
      webServer: {
        command: 'node app.js', // Run backend directly, bypassing nodemon
        url: 'http://localhost:4000/api/auth/signup', // Wait for a known backend API endpoint to be ready
        timeout: 180 * 1000, // Increased timeout for server startup
        reuseExistingServer: !process.env.CI,
        cwd: '../backend', // Path to your backend directory
        stdout: 'pipe', // Capture stdout for debugging
        stderr: 'pipe', // Capture stderr for debugging
      },
    },
  ],

  // If you had frontend UI tests that needed the frontend server, you'd put its webServer here
  // or in a separate 'Frontend UI' project. For now, since we're focusing on API tests,
  // we'll only manage the backend server via the 'API' project's webServer.
  // Example for frontend if needed later:
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:3000',
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  //   cwd: '../frontend',
  //   stdout: 'pipe',
  //   stderr: 'pipe',
  // },
});

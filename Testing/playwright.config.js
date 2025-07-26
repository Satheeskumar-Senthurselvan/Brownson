// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 5 * 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'API',
      testMatch: /.*(?:loginSignup|cart|order|adminProduct)\.spec\.js/,
      use: {
        baseURL: 'http://localhost:4000/api',
      },
      webServer: {
        command: 'node app.js',
        url: 'http://localhost:4000/api/auth/signup',
        timeout: 180 * 1000,
        reuseExistingServer: !process.env.CI,
        cwd: '../backend',
        stdout: 'pipe',
        stderr: 'pipe',
      },
    },
  ],
});
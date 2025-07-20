# Brownson End-to-End Testing Suite (Playwright)

This directory houses the comprehensive end-to-end (E2E) test suite for the Brownson E-commerce & Production Management System, built using Playwright. These tests simulate real user interactions to ensure the entire application (frontend and backend combined) functions as expected.

## Purpose

The E2E test suite aims to:
* Verify critical user flows (e.g., user registration, login, product Browse, adding to cart, checkout).
* Ensure integration points between the frontend and backend are working correctly.
* Catch regressions and prevent new bugs from being introduced.
* Provide confidence in the overall stability and reliability of the application.

## Technologies Used

* **Playwright**: Our powerful framework for reliable and fast E2E testing across Chromium, Firefox, and WebKit browsers.
* **`@playwright/test`**: The testing library that provides the `test` and `expect` APIs.

## Test Structure

Test files are organized logically within this `Testing/` directory. Each `.spec.js` (or `.spec.ts`) file typically contains tests for a specific feature or module.

For example:
* `Testing/auth.spec.js`: Tests for user registration and login.
* `Testing/product.spec.js`: Tests for viewing product listings and details.
* `Testing/cart.spec.js`: Tests for adding items to the cart and managing cart contents.
* `Testing/order.spec.js`: Tests for the order creation and retrieval process.

## Running Tests

**IMPORTANT:** Before running any E2E tests, ensure your **Backend API** and **Frontend Application** servers are both running locally. Playwright interacts with your live application.

1.  **Ensure your Backend (`http://localhost:4000`) and Frontend (`http://localhost:3000`) are running.**
2.  **Navigate to the root of your `Brownson` project** in a separate terminal:
    ```bash
    cd /path/to/your/Brownson/
    ```
3.  **Execute the test suite:**
    ```bash
    npx playwright test
    ```
    This command will launch the configured browsers (Chromium, Firefox, WebKit by default) and run all your end-to-end tests.

**Useful Test Commands:**

* **Run tests on a specific browser:**
    ```bash
    npx playwright test --project=chromium
    ```
* **Run a specific test file:**
    ```bash
    npx playwright test Testing/auth.spec.js
    ```
* **Run tests in UI mode (for debugging and development):**
    ```bash
    npx playwright test --ui
    ```
    This opens an interactive UI where you can step through tests, inspect elements, and re-run specific tests.

## Viewing Test Reports

After tests complete, Playwright automatically generates a detailed HTML report.

1.  **Open the report in your browser:**
    ```bash
    npx playwright show-report
    ```
    This will launch your default web browser and display a comprehensive report of your test run, including passed/failed tests, durations, and helpful debugging artifacts like screenshots and traces for failures.

## Writing New Tests

* Create new test files with the `.spec.js` (or `.spec.ts`) extension within the `Testing/` directory.
* Utilize the Playwright API (e.g., `page.goto()`, `page.click()`, `expect()`) to simulate user interactions and assert application behavior.
* Refer to the [official Playwright documentation](https://playwright.dev/docs/intro) for detailed API reference and best practices.

## Contributing to Testing

If you're contributing new features, please also include corresponding E2E tests to ensure new functionalities are covered and existing ones remain stable.
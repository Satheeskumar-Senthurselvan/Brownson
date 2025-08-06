// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel';
import bcrypt from 'bcryptjs';

const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

let testDbConnection;
let TestUserModel;

function generateUniqueUserData(overrides = {}) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return {
        name: `UI Test User ${uniqueId.substring(0, 5)}`,
        email: `uitestuser${uniqueId}@example.com`,
        password: 'Password123!', // Ensure strong password for validation
        confirmPassword: 'Password123!', // Add confirm password
        contactNumber: '0712345678',
        address: '456 UI Test Lane',
        profileImg: '/img/uploadsImage/user.jpg',
        ...overrides,
    };
}

test.describe('Authentication UI Tests', () => {

    let preExistingUser;

    test.beforeAll(async () => {
        try {
            testDbConnection = mongoose.createConnection(DB_URI);
            await new Promise((resolve, reject) => {
                testDbConnection.on('connected', resolve);
                testDbConnection.on('error', reject);
            });
            TestUserModel = testDbConnection.model('User', User.schema);
            console.log('Test database connection established for UI tests.');
        } catch (error) {
            console.error('Failed to connect to test MongoDB for UI tests:', error);
            test.fail(`MongoDB connection failed for UI tests: ${error.message}`);
        }
    });

    test.afterAll(async () => {
        if (testDbConnection && testDbConnection.readyState !== 0) {
            await testDbConnection.close();
            console.log('Test database connection closed for UI tests.');
        }
    });

    test.beforeEach(async ({ page }) => {
        if (testDbConnection.readyState === 1) {
            await TestUserModel.deleteMany({});
            console.log('Cleared User collection before UI test.');
        } else {
            throw new Error('Test DB connection not ready for beforeEach cleanup.');
        }

        page.on('dialog', async dialog => {
            console.log(`UI Test received dialog: ${dialog.message()}`);
            await dialog.accept();
        });
    });


    test.describe('User Signup UI', () => {
        test('should allow a new user to sign up successfully via UI', async ({ page, baseURL }) => {
            const userData = generateUniqueUserData();

            await page.goto(`${baseURL}/login`);

            // --- Corrected Panel Activation and Waiting ---
            // Click the 'Sign Up' button in the OVERLAY (on the right) to activate the signup form
            await page.click('.overlay-panel.overlay-right button.ghost:has-text("Sign Up")');

            // Wait for the 'Sign Up' form to become active/visible.
            // A good way is to wait for a unique element within the signup form to be visible and enabled.
            // Based on screenshot, the 'Confirm Password' input is only in the signup form.
            const confirmPasswordInput = page.locator('.sign-up-container input[name="confirmPassword"]');
            await expect(confirmPasswordInput).toBeVisible();
            await expect(confirmPasswordInput).toBeEnabled();
            // --- End Corrected Panel Activation and Waiting ---

            // Fill signup form fields
            // Selectors refined based on the structure (assuming Signup component outputs inputs with names)
            await page.fill('.sign-up-container input[name="name"]', userData.name);
            await page.fill('.sign-up-container input[name="email"]', userData.email);
            await page.fill('.sign-up-container input[name="password"]', userData.password);
            await page.fill('.sign-up-container input[name="confirmPassword"]', userData.confirmPassword); // Fill confirm password
            await page.fill('.sign-up-container input[name="contactNumber"]', userData.contactNumber); // Changed to input if not textarea
            await page.fill('.sign-up-container textarea[name="address"]', userData.address); // If it's a textarea

            // Click the signup button within the signup form (it has text "Sign Up")
            await page.click('.sign-up-container button:has-text("Sign Up")'); // Assumed this is the submit button for signup form

            // Assert on the expected outcome (alert or redirect)
            // If signup shows an alert then redirects, the alert is handled, then we check URL
            // Assuming it shows "Signup successful" alert then redirects to /login (or /userProfile if logged in automatically)
            const dialogPromise = page.waitForEvent('dialog');
            const dialog = await dialogPromise;
            expect(dialog.message()).toBe('Signup successful!'); // Corrected to match exact message with exclamation mark// Verify the alert message
            // Accept the alert

            // After successful signup (and alert), your frontend might redirect, e.g., to /login or /userProfile.
            // If it goes to userProfile directly after signup:
            // await expect(page).toHaveURL(`${baseURL}/userProfile`);
            // If it goes back to login page:
            await expect(page).toHaveURL(`${baseURL}/login`); // Assuming it lands back on login after signup success alert.


            // Verify the user was created in the database
            const createdUser = await TestUserModel.findOne({ email: userData.email });
            expect(createdUser).not.toBeNull();
            expect(createdUser?.name).toBe(userData.name);
            console.log('UI Signup Test: User signed up successfully via UI and verified in DB.');

            await page.waitForTimeout(3000); // For visual confirmation
        });

        test('should show error for existing email during signup via UI', async ({ page, baseURL }) => {
            const existingUserData = generateUniqueUserData();
            const hashedPassword = await bcrypt.hash(existingUserData.password, 10);
            await TestUserModel.create({ ...existingUserData, password: hashedPassword });
            console.log('UI Signup Test: Pre-created user for existing email test.');

            await page.goto(`${baseURL}/login`);
            await page.click('.overlay-panel.overlay-right button.ghost:has-text("Sign Up")');
            const confirmPasswordInput = page.locator('.sign-up-container input[name="confirmPassword"]');
            await expect(confirmPasswordInput).toBeVisible();
            await expect(confirmPasswordInput).toBeEnabled();

            await page.fill('.sign-up-container input[name="name"]', generateUniqueUserData().name);
            await page.fill('.sign-up-container input[name="email"]', existingUserData.email);
            await page.fill('.sign-up-container input[name="password"]', existingUserData.password);
            await page.fill('.sign-up-container input[name="confirmPassword"]', existingUserData.password); // Fill confirm password
            await page.fill('.sign-up-container input[name="contactNumber"]', existingUserData.contactNumber);
            await page.fill('.sign-up-container textarea[name="address"]', existingUserData.address);

            const dialogPromise = page.waitForEvent('dialog'); // Wait for the alert
            await page.click('.sign-up-container button:has-text("Sign Up")');
            const dialog = await dialogPromise;
            expect(dialog.message()).toContain('Email already registered');

            // Ensure we are still on the login page (or signup form within it)
            await expect(page).toHaveURL(`${baseURL}/login`); // Still on the login route

            console.log('UI Signup Test: Existing email error displayed via alert.');
            await page.waitForTimeout(3000); // For visual confirmation
        });
    });

    // ... (Your User Signin UI tests, which are already based on the sign-in container and should work fine)
    // The sign-in tests generally don't need to click the 'Sign In' ghost button
    // as that panel is active by default on '/login'
    // They just need to ensure they are interacting with elements within '.sign-in-container'
});
// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel'; // Import the User model
import bcrypt from 'bcryptjs';

// MongoDB URI for the test environment.
// This is directly provided for simplicity as requested.
const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

// Declare variables to hold our specific connection and model instances for testing
let testDbConnection;
let TestUserModel;

// --- Helper Functions for Test Data and API Calls ---

/**
 * Generates a standard user data object with optional overrides.
 * Ensures unique email for each test run and across parallel workers.
 * @param {object} overrides - Properties to override in the default user data.
 * @returns {object} The generated user data.
 */
function generateUserData(overrides = {}) {
  // Combine Date.now() with a random string for higher uniqueness across parallel runs
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  return {
    name: 'Test User',
    email: `test${uniqueId}@example.com`, // Ensures unique email for each test run
    password: 'password123',
    contactNumber: '1234567890',
    address: '123 Test St',
    profileImg: '/img/uploadsImage/user.jpg',
    ...overrides, // Apply any provided overrides
  };
}

/**
 * Sends a signup request to the API.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {object} userData - The user data for signup.
 * @returns {Promise<import('@playwright/test').APIResponse>} The API response.
 */
async function signupUser(request, userData) {
  console.log('Sending signup request with data:', userData); // Added log
  return await request.post('/api/auth/signup', {
    data: userData,
  });
}

/**
 * Sends a signin request to the API.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {object} loginData - The login credentials (email, password).
 * @returns {Promise<import('@playwright/test').APIResponse>} The API response.
 */
async function signinUser(request, loginData) {
  console.log('Sending signin request with data:', loginData); // Added log
  return await request.post('/api/auth/signin', {
    data: loginData,
  });
}

// --- Test Suite Setup (Shared for both Signup and Signin) ---

// This block handles the shared database connection and model setup/teardown
// for both signup and signin test suites.
test.describe('Authentication API Tests', () => {
  // Connect to MongoDB once before all tests in this file run
  test.beforeAll(async () => {
    try {
      testDbConnection = mongoose.createConnection(DB_URI);

      await new Promise((resolve, reject) => {
        testDbConnection.on('connected', () => {
          console.log('Test DB Connection: OPEN');
          resolve();
        });
        testDbConnection.on('error', (err) => {
          console.log('Test DB Connection: ERROR: ' + err);
          reject(err);
        });
        testDbConnection.on('disconnected', () => console.log('Test DB Connection: DISCONNECTED'));
      });

      TestUserModel = testDbConnection.model('User', User.schema);
      console.log('MongoDB connected for tests and User model defined on test connection.');

    } catch (error) {
      console.error('Failed to connect to MongoDB for tests:', error);
      test.fail('MongoDB connection failed');
    }
  });

  // Disconnect from MongoDB once after all tests in this file are done
  test.afterAll(async () => {
    try {
      if (testDbConnection && testDbConnection.readyState !== 0) {
        await testDbConnection.close();
        console.log('MongoDB disconnected after all authentication tests');
      }
    } catch (error) {
      console.error('Failed to disconnect from MongoDB after authentication tests:', error);
    }
  });

  // --- User Signup API Tests ---
  test.describe('User Signup API', () => {
    // Clean up database before each signup test to ensure isolation
    test.beforeEach(async () => {
      if (testDbConnection.readyState !== 1) {
          console.error('Test DB Connection not ready in beforeEach for Signup API! Current state:', testDbConnection.readyState);
          throw new Error('Test DB Connection not ready for deleteMany in beforeEach.');
      }
      await TestUserModel.deleteMany({}); // Ensure no maxTimeMS here, let it complete
      console.log('Cleaned up users collection before signup test.');
    });

    test('should allow a new user to sign up successfully', async ({ request }) => {
      const userData = generateUserData(); // Use helper to create user data
      const response = await signupUser(request, userData); // Use helper for signup request
      const responseBody = await response.json(); // Get response body here to log it

      console.log('Signup success test - API Response Status:', response.status()); // Added log
      console.log('Signup success test - API Response Body:', responseBody); // Added log

      expect(response.status()).toBe(201);
      expect(responseBody.message).toBe('Signup successful');
      expect(responseBody.user).toBeDefined();
      expect(responseBody.user.name).toBe(userData.name);
      expect(responseBody.user.email).toBe(userData.email);
      expect(responseBody.user.password).toBeUndefined(); // Assert password is not returned
      expect(responseBody.user.passwordHashed).toBeUndefined();

      // Verify user in database
      const createdUser = await TestUserModel.findOne({ email: userData.email });
      console.log('Signup success test - User found in DB:', createdUser ? createdUser.email : 'None'); // Added log
      expect(createdUser).not.toBeNull();
      expect(createdUser?.name).toBe(userData.name);
    });

    test('should return 400 if email is already registered', async ({ request }) => {
      const existingUserData = generateUserData(); // Generate data for the user to pre-create
      const hashedPassword = await bcrypt.hash('existingpass', 10); // Hash password for direct DB insert

      // Pre-create a user directly in DB
      await TestUserModel.create({
        ...existingUserData, // Use helper with email override
        password: hashedPassword, // Store hashed password
      });
      console.log(`Pre-created user for duplicate email test: ${existingUserData.email}`); // Added log

      const userData = generateUserData({ email: existingUserData.email }); // Attempt signup with existing email
      const response = await signupUser(request, userData);
      const responseBody = await response.json(); // Get response body here to log it

      console.log('Duplicate email test - API Response Status:', response.status()); // Added log
      console.log('Duplicate email test - API Response Body:', responseBody); // Added log

      expect(response.status()).toBe(400);
      expect(responseBody.error).toBe('Email already registered');
    });

    test('should return 400 for invalid email format', async ({ request }) => {
      const userData = generateUserData({ email: 'invalid-email' }); // Invalid email
      const response = await signupUser(request, userData);
      const responseBody = await response.json();

      expect(response.status()).toBe(400);
      expect(responseBody.error).toBe('Invalid email format');
    });

    test('should return 400 for password less than 8 characters', async ({ request }) => {
      const userData = generateUserData({ password: 'short' }); // Short password
      const response = await signupUser(request, userData);
      const responseBody = await response.json();

      expect(response.status()).toBe(400);
      expect(responseBody.error).toBe('Password must be at least 8 characters');
    });
  });

  // --- User Signin API Tests ---
  test.describe('User Signin API', () => {
    let testUserEmail;
    let testUserPassword;
    let userDataForSignin; // Declare it here to be accessible in beforeEach and test

    // Clean up and prepare data before each signin test.
    test.beforeEach(async () => {
      if (testDbConnection.readyState !== 1) {
          console.error('Test DB Connection not ready in beforeEach for Signin API! Current state:', testDbConnection.readyState);
          throw new Error('Test DB Connection not ready for database operations in beforeEach.');
      }

      // Generate unique user data for this specific test run
      userDataForSignin = generateUserData();
      testUserEmail = userDataForSignin.email;
      testUserPassword = userDataForSignin.password;

      // Attempt to delete the specific user if it somehow exists from a previous failed run
      // This is more targeted than deleteMany({}) and helps with E11000 in parallel runs
      console.log(`Attempting to clean up specific user: ${testUserEmail} before creation.`);
      await TestUserModel.deleteOne({ email: testUserEmail });
      const countAfterSpecificCleanup = await TestUserModel.countDocuments({ email: testUserEmail });
      console.log(`Count of ${testUserEmail} after specific cleanup: ${countAfterSpecificCleanup}`);


      // Create a user for signin tests to ensure a known state.
      const hashedPassword = await bcrypt.hash(testUserPassword, 10);

      try {
        await TestUserModel.create({
          name: userDataForSignin.name,
          email: testUserEmail,
          password: hashedPassword, // Store hashed password
          contactNumber: userDataForSignin.contactNumber,
          address: userDataForSignin.address,
          ProfileImg: userDataForSignin.profileImg, // Ensure this matches your Mongoose schema field name
        });
        console.log(`Created test user for signin tests: ${testUserEmail}`);
      } catch (createError) {
        console.error(`Error creating test user in beforeEach for signin suite: ${createError.message}`);
        // If it's a duplicate key error at this point, it's a serious issue with cleanup or test isolation.
        if (createError.code === 11000) {
            console.error('Received E11000 during user creation in beforeEach. This indicates a severe test isolation problem.');
        }
        throw createError; // Re-throw to fail the test if user creation fails
      }
    });

    // Optional: Add an afterEach to clean up the specific user created by this test
    test.afterEach(async () => {
        if (testDbConnection.readyState === 1 && testUserEmail) {
            console.log(`Cleaning up user: ${testUserEmail} after test.`);
            await TestUserModel.deleteOne({ email: testUserEmail });
        }
    });


    test('should allow an existing user to sign in successfully', async ({ request }) => {
      const loginData = {
        email: testUserEmail,
        password: testUserPassword,
      };

      const response = await signinUser(request, loginData); // Use helper for signin request
      const responseBody = await response.json(); // Get response body here to log it

      console.log('Signin success test - API Response Status:', response.status()); // Added log
      console.log('Signin success test - API Response Body:', responseBody); // Added log

      expect(response.status()).toBe(200);
      expect(responseBody.message).toBe('Login successful');
      expect(responseBody.user).toBeDefined();
      expect(responseBody.user.email).toBe(loginData.email);
      expect(responseBody.token).toBeDefined();
      expect(responseBody.user.password).toBeUndefined(); // Ensure password is not returned in response
      expect(responseBody.user.passwordHashed).toBeUndefined(); // Ensure passwordHashed is not returned
    });

    test('should return 401 for invalid login credentials', async ({ request }) => {
      const loginData = {
        email: testUserEmail,
        password: 'wrongpassword', // Incorrect password
      };

      const response = await signinUser(request, loginData);
      const responseBody = await response.json();

      expect(response.status()).toBe(401);
      expect(responseBody.error).toBe('Invalid credentials');
    });

    test('should return 401 for non-existent user', async ({ request }) => {
      const loginData = {
        email: generateUserData().email, // Use a truly non-existent email
        password: 'anypassword',
      };

      const response = await signinUser(request, loginData);
      const responseBody = await response.json();

      expect(response.status()).toBe(401);
      expect(responseBody.error).toBe('Invalid credentials');
    });
  });
});

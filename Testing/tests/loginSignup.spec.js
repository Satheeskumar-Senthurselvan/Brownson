// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel';
import bcrypt from 'bcryptjs';

const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

let testDbConnection;
let TestUserModel;

function generateUserData(overrides = {}) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return {
        name: 'Test User',
        email: `test${uniqueId}@example.com`,
        password: 'password123',
        contactNumber: '1234567890',
        address: '123 Test St',
        profileImg: '/img/uploadsImage/user.jpg',
        ...overrides,
    };
}

async function signupUser(request, userData) {
    return await request.post('/api/auth/signup', {
        data: userData,
    });
}

async function signinUser(request, loginData) {
    return await request.post('/api/auth/signin', {
        data: loginData,
    });
}

test.describe('Authentication API Tests', () => {
    test.beforeAll(async () => {
        try {
            testDbConnection = mongoose.createConnection(DB_URI);

            await new Promise((resolve, reject) => {
                testDbConnection.on('connected', () => {
                    resolve();
                });
                testDbConnection.on('error', (err) => {
                    reject(err);
                });
                testDbConnection.on('disconnected', () => {});
            });

            TestUserModel = testDbConnection.model('User', User.schema);

        } catch (error) {
            test.fail('MongoDB connection failed');
        }
    });

    test.afterAll(async () => {
        try {
            if (testDbConnection && testDbConnection.readyState !== 0) {
                await testDbConnection.close();
            }
        } catch (error) {}
    });

    test.describe('User Signup API', () => {
        test.beforeEach(async () => {
            if (testDbConnection.readyState !== 1) {
                throw new Error('Test DB Connection not ready for deleteMany in beforeEach.');
            }
            await TestUserModel.deleteMany({});
        });

        test('should allow a new user to sign up successfully', async ({ request }) => {
            const userData = generateUserData();
            const response = await signupUser(request, userData);
            const responseBody = await response.json();

            expect(response.status()).toBe(201);
            expect(responseBody.message).toBe('Signup successful');
            expect(responseBody.user).toBeDefined();
            expect(responseBody.user.name).toBe(userData.name);
            expect(responseBody.user.email).toBe(userData.email);
            expect(responseBody.user.password).toBeUndefined();
            expect(responseBody.user.passwordHashed).toBeUndefined();

            const createdUser = await TestUserModel.findOne({ email: userData.email });
            expect(createdUser).not.toBeNull();
            expect(createdUser?.name).toBe(userData.name);
        });

        test('should return 400 if email is already registered', async ({ request }) => {
            const existingUserData = generateUserData();
            const hashedPassword = await bcrypt.hash('existingpass', 10);

            await TestUserModel.create({
                ...existingUserData,
                password: hashedPassword,
            });

            const userData = generateUserData({ email: existingUserData.email });
            const response = await signupUser(request, userData);
            const responseBody = await response.json();

            expect(response.status()).toBe(400);
            expect(responseBody.error).toBe('Email already registered');
        });

        test('should return 400 for invalid email format', async ({ request }) => {
            const userData = generateUserData({ email: 'invalid-email' });
            const response = await signupUser(request, userData);
            const responseBody = await response.json();

            expect(response.status()).toBe(400);
            expect(responseBody.error).toBe('Invalid email format');
        });

        test('should return 400 for password less than 8 characters', async ({ request }) => {
            const userData = generateUserData({ password: 'short' });
            const response = await signupUser(request, userData);
            const responseBody = await response.json();

            expect(response.status()).toBe(400);
            expect(responseBody.error).toBe('Password must be at least 8 characters');
        });
    });

    test.describe('User Signin API', () => {
        let testUserEmail;
        let testUserPassword;
        let userDataForSignin;

        test.beforeEach(async () => {
            if (testDbConnection.readyState !== 1) {
                throw new Error('Test DB Connection not ready for database operations in beforeEach.');
            }

            userDataForSignin = generateUserData();
            testUserEmail = userDataForSignin.email;
            testUserPassword = userDataForSignin.password;

            await TestUserModel.deleteOne({ email: testUserEmail });

            const hashedPassword = await bcrypt.hash(testUserPassword, 10);

            try {
                await TestUserModel.create({
                    name: userDataForSignin.name,
                    email: testUserEmail,
                    password: hashedPassword,
                    contactNumber: userDataForSignin.contactNumber,
                    address: userDataForSignin.address,
                    ProfileImg: userDataForSignin.profileImg,
                });
            } catch (createError) {
                if (createError.code === 11000) {
                    throw new Error('Received E11000 during user creation in beforeEach. This indicates a severe test isolation problem.');
                }
                throw createError;
            }
        });

        test.afterEach(async () => {
            if (testDbConnection.readyState === 1 && testUserEmail) {
                await TestUserModel.deleteOne({ email: testUserEmail });
            }
        });

        test('should allow an existing user to sign in successfully', async ({ request }) => {
            const loginData = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const response = await signinUser(request, loginData);
            const responseBody = await response.json();

            expect(response.status()).toBe(200);
            expect(responseBody.message).toBe('Login successful');
            expect(responseBody.user).toBeDefined();
            expect(responseBody.user.email).toBe(loginData.email);
            expect(responseBody.token).toBeDefined();
            expect(responseBody.user.password).toBeUndefined();
            expect(responseBody.user.passwordHashed).toBeUndefined();
        });

        test('should return 401 for invalid login credentials', async ({ request }) => {
            const loginData = {
                email: testUserEmail,
                password: 'wrongpassword',
            };

            const response = await signinUser(request, loginData);
            const responseBody = await response.json();

            expect(response.status()).toBe(401);
            expect(responseBody.error).toBe('Invalid credentials');
        });

        test('should return 401 for non-existent user', async ({ request }) => {
            const loginData = {
                email: generateUserData().email,
                password: 'anypassword',
            };

            const response = await signinUser(request, loginData);
            const responseBody = await response.json();

            expect(response.status()).toBe(401);
            expect(responseBody.error).toBe('Invalid credentials');
        });
    });
});
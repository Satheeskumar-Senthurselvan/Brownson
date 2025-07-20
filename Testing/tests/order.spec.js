// tests/order.spec.js
// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel.js'; // Adjust path if different
import Product from '../../Backend/Models/productModel.js'; // Adjust path if different
import Order from '../../Backend/Models/OrderModel.js'; // Adjust path if different
import bcrypt from 'bcryptjs'; // Needed for user creation

// MongoDB URI for the test environment.
const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

// Declare variables to hold our specific connection and model instances for testing
let testDbConnection;
let TestUserModel;
let TestProductModel;
let TestOrderModel;

// --- Helper Functions for Test Data and API Calls (Reused/Adapted from your existing helpers) ---

/**
 * Generates a standard user data object with optional overrides.
 * Ensures unique email for each test run and across parallel workers.
 * @param {object} overrides - Properties to override in the default user data.
 * @returns {object} The generated user data.
 */
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

/**
 * Generates a standard product data object with optional overrides.
 * @param {object} overrides - Properties to override in the default product data.
 * @returns {object} The generated product data.
 */
function generateProductData(overrides = {}) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const categories = [
        'Jellies', 'Custards', 'Food essences', 'Cake ingredients', 'Artificial colors and flavors'
    ];
    const units = ['ml', 'g', 'kg', 'l', 'pcs'];

    return {
        name: `Test Product ${uniqueId}`,
        price: Math.floor(Math.random() * 1000) + 10,
        description: `Description for Product ${uniqueId}`,
        ratings: '0',
        images: [{ image: `http://example.com/image_${uniqueId}.jpg` }],
        category: categories[Math.floor(Math.random() * categories.length)],
        seller: 'Test Seller ' + uniqueId,
        stock: Math.floor(Math.random() * 50) + 1,
        quantity: {
            value: Math.floor(Math.random() * 20) + 1,
            unit: units[Math.floor(Math.random() * units.length)],
        },
        numOfReviews: 0,
        reviews: [],
        ...overrides,
    };
}

/**
 * Creates a user in the DB and logs them in via API to get a token and user ID.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<{accessToken: string, userId: string, email: string, password: string, contactNumber: string, address: string, name: string}>} User details and token.
 */
async function registerAndLoginUser(request, email, password) {
    const userData = generateUserData({ email, password });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await TestUserModel.create({ ...userData, password: hashedPassword });

    console.log(`Helper: Created test user ${email} with ID ${user._id} for token generation.`);

    const loginResponse = await request.post('api/auth/signin', { // Assuming your signin endpoint is /api/auth/signin
        data: { email, password },
    });
    expect(loginResponse.status()).toBe(200);
    const loginResponseBody = await loginResponse.json();
    const token = loginResponseBody.token;
    expect(token).toBeDefined();
    return {
        accessToken: token,
        userId: user._id.toString(),
        email,
        password,
        contactNumber: userData.contactNumber,
        address: userData.address,
        name: userData.name
    };
}

/**
 * Creates a product via API for testing.
 * NOTE: This product creation is typically done by an admin. For the purpose of these order tests,
 * we will create it directly in the DB using the TestProductModel if not via API.
 * The original helper was designed for an admin API route. Let's adjust this for direct DB creation
 * if the actual product creation endpoint requires admin auth not readily available in this context.
 * For now, assuming you have an accessible `/api/cart/add` or similar that a regular user can hit.
 * If this is an admin route, we should create directly in DB.
 * For consistency with the original code, keeping this as API call for now.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} accessToken - Authentication token (could be admin token or user token if user can add products).
 * @returns {Promise<object>} The created product object.
 */
async function createProductAPI(request, accessToken) {
    const productData = generateProductData();
    // Assuming /api/cart/add is for adding to cart, not creating a product in the DB for sale.
    // Let's assume for these tests we directly create the product in the DB.
    // If you have an admin API for product creation, use that.
    const product = await TestProductModel.create(productData);
    console.log(`Helper: Created product directly in DB ID: ${product._id}`);
    return product;
    /*
    // Original approach if there's a user-accessible product creation API:
    const response = await request.post('/api/products/create', { // Adjust if your product creation endpoint is different
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        data: productData,
    });
    expect(response.status()).toBe(201); // Assuming 201 for creation
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('product');
    return responseBody.product;
    */
}

/**
 * Creates an order via API.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} accessToken - Authentication token.
 * @param {object[]} products - Array of product objects {productId, quantity, price, name, image}.
 * @param {number} totalPrice - Total price of the order.
 * @param {string} paymentStatus - Payment status.
 * @param {string} username - User's name for delivery.
 * @param {string} deliveryAddress - Delivery address.
 * @param {string} contactNumber - Contact number.
 * @returns {Promise<object>} The order object from the response.
 */
async function createOrderAPI(request, accessToken, products, totalPrice, paymentStatus, username, deliveryAddress, contactNumber) {
    const response = await request.post('/api/order/create', { // Matches your router.post('/create')
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        data: { products, totalPrice, paymentStatus, username, deliveryAddress, contactNumber }
    });
    expect(response.status()).toBe(201); // Expect 201 Created for successful order
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    expect(responseBody.order).toBeDefined();
    console.log(`Helper: Order created with ID: ${responseBody.order._id}`);
    return responseBody.order;
}


// --- Order API Test Suite ---
test.describe('Order API Tests', () => {
    let userA_info; // { accessToken, userId, email, password, name, address, contactNumber }
    let userB_info; // { accessToken, userId, email, password, name, address, contactNumber }
    let product1; // A product created for ordering
    let userA_order1_id; // ID of an order created by User A during a test

    // Setup: Connect to DB, create users, create product
    test.beforeAll(async ({ request }) => {
        try {
            mongoose.set('bufferCommands', false);
            mongoose.set('bufferTimeoutMS', 30000);

            testDbConnection = mongoose.createConnection(DB_URI);

            await new Promise((resolve, reject) => {
                testDbConnection.on('connected', () => {
                    console.log('Order Test DB Connection: OPEN');
                    resolve();
                });
                testDbConnection.on('error', (err) => {
                    console.log('Order Test DB Connection: ERROR: ' + err);
                    reject(err);
                });
                testDbConnection.on('disconnected', () => console.log('Order Test DB Connection: DISCONNECTED'));
            });

            // Define models on this specific connection
            TestUserModel = testDbConnection.model('User', User.schema);
            TestProductModel = testDbConnection.model('Product', Product.schema);
            TestOrderModel = testDbConnection.model('Order', Order.schema);

            console.log('MongoDB connected for Order tests and models defined on test connection.');

            // Create and login User A
            userA_info = await registerAndLoginUser(request, generateUserData().email, generateUserData().password);
            console.log(`User A (main test user) ID: ${userA_info.userId}`);

            // Create and login User B (for cross-user authorization tests)
            userB_info = await registerAndLoginUser(request, generateUserData().email, generateUserData().password);
            console.log(`User B (other test user) ID: ${userB_info.userId}`);

            // Create a product (needed for order creation) directly in DB
            // Assuming this product would typically be created by an admin and be available.
            product1 = await TestProductModel.create(generateProductData());
            console.log(`Created prerequisite product ID: ${product1._id}`);

        } catch (error) {
            console.error('Order Test Suite: Failed during beforeAll setup:', error);
            test.fail('Order Test Suite setup failed');
        }
    });

    // Cleanup: Delete all test data
    test.afterAll(async () => {
        try {
            if (testDbConnection && testDbConnection.readyState !== 0) {
                // Collect all user IDs that might have been created
                const allUserIds = [userA_info.userId, userB_info.userId];
                // In case a user was created dynamically in a test (e.g., "no-order user"), clean them up as well
                const allTestUsers = await TestUserModel.find({ email: /test.*@example.com/ });
                allTestUsers.forEach(user => allUserIds.push(user._id.toString()));

                await TestUserModel.deleteMany({ _id: { $in: allUserIds } });
                await TestProductModel.deleteOne({ _id: product1._id }); // Delete the product
                await TestOrderModel.deleteMany({ 'user.userId': { $in: allUserIds } }); // Delete orders by user ID

                await testDbConnection.close();
                console.log('MongoDB disconnected after all Order tests and cleaned up data.');
            }
        } catch (error) {
            console.error('Order Test Suite: Failed during afterAll teardown:', error);
        }
    });

    // beforeEach to ensure we have a fresh order for tests that need it
    test.beforeEach(async () => {
        // Ensure userA_order1_id is cleared for each test to avoid interference
        userA_order1_id = null;
    });

    // --- ORDER CREATION TEST CASES ---

    // Order-Create-001: Should allow an authenticated user to create a new order successfully
    test('Order-Create-001: Should allow an authenticated user to create a new order successfully', async ({ request }) => {
        console.log('Running Order-Create-001');
        const orderProducts = [{
            productId: product1._id.toString(),
            quantity: 2,
            price: product1.price,
            name: product1.name,
            image: product1.images[0].image
        }];
        const orderTotal = product1.price * 2;

        const createdOrder = await createOrderAPI(
            request,
            userA_info.accessToken,
            orderProducts,
            orderTotal,
            'Paid',
            userA_info.name,
            userA_info.address,
            userA_info.contactNumber
        );

        expect(createdOrder).toBeDefined();
        expect(createdOrder.user.userId.toString()).toBe(userA_info.userId.toString());
        expect(createdOrder.totalPrice).toBe(orderTotal);
        expect(createdOrder.products.length).toBe(1);
        expect(createdOrder.products[0].productId.toString()).toBe(product1._id.toString());
        expect(createdOrder.paymentStatus).toBe('Paid');

        // Store this ID for subsequent tests that might need it
        userA_order1_id = createdOrder._id.toString();
        console.log(`Order-Create-001: Created order ID: ${userA_order1_id}`);
    });

    // Order-Create-002: Should return 401 if creating an order without authentication
    test('Order-Create-002: Should return 401 if creating an order without authentication', async ({ request }) => {
        console.log('Running Order-Create-002');
        const productForOrder = {
            productId: product1._id.toString(),
            quantity: 1,
            price: product1.price,
            name: product1.name,
            image: product1.images[0].image
        };

        const response = await request.post('/api/order/create', {
            data: {
                products: [productForOrder],
                totalPrice: product1.price,
                paymentStatus: 'Pending',
                username: 'Unauthorized User',
                deliveryAddress: 'No Address',
                contactNumber: '0000000000'
            }
        });

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Invalid or malformed token');
    });

    // --- ORDER RETRIEVAL TEST CASES ---

    // Order-ViewMy-003: should allow an authenticated user to view their own orders successfully
    test('Order-ViewMy-003: should allow an authenticated user to view their own orders successfully', async ({ request }) => {
        console.log('Running Order-ViewMy-003');
        // First, ensure an order exists for user A for this test to pass reliably
        const orderProducts = [{
            productId: product1._id.toString(),
            quantity: 1,
            price: product1.price,
            name: product1.name,
            image: product1.images[0].image
        }];
        const orderTotal = product1.price * 1;
        const createdOrder = await createOrderAPI(
            request, userA_info.accessToken, orderProducts, orderTotal, 'Paid',
            userA_info.name, userA_info.address, userA_info.contactNumber
        );
        userA_order1_id = createdOrder._id.toString(); // Ensure it's set for this test

        const response = await request.get('/api/order/my-orders', {
            headers: {
                'Authorization': `Bearer ${userA_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        expect(responseBody.orders).toBeInstanceOf(Array);
        expect(responseBody.orders.length).toBeGreaterThan(0); // Should have at least the order we created
        const foundOrder = responseBody.orders.find(order => order._id === userA_order1_id);
        expect(foundOrder).toBeDefined();
        expect(foundOrder.user.userId.toString()).toBe(userA_info.userId.toString());
    });

    // Order-ViewMy-004: should return 401 if viewing own orders without authentication
    test('Order-ViewMy-004: should return 401 if viewing own orders without authentication', async ({ request }) => {
        console.log('Running Order-ViewMy-004');
        const response = await request.get('/api/order/my-orders'); // No auth header

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Invalid or malformed token'); // Or similar unauthorized message
    });

    // Order-ViewMy-005: Should return an empty list if user has no orders
    test('Order-ViewMy-005: Should return an empty list if user has no orders', async ({ request }) => {
        console.log('Running Order-ViewMy-005');
        // Create a brand new user who will not place an order for this specific test
        const noOrderUserData = generateUserData();
        const noOrderUser = await registerAndLoginUser(request, noOrderUserData.email, noOrderUserData.password);

        const response = await request.get('/api/order/my-orders', {
            headers: {
                'Authorization': `Bearer ${noOrderUser.accessToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        expect(responseBody.orders).toBeInstanceOf(Array);
        expect(responseBody.orders.length).toBe(0); // Expect an empty array

        // Clean up this specific user after the test
        await TestUserModel.deleteOne({ _id: noOrderUser.userId });
    });

    // Order-ViewByID-006: should allow an authenticated user to view a specific order by ID (their own order)
    test('Order-ViewByID-006: should allow an authenticated user to view a specific order by ID (their own order)', async ({ request }) => {
        console.log('Running Order-ViewByID-006');
        // Ensure an order exists for user A for this test to pass reliably
        const orderProducts = [{
            productId: product1._id.toString(),
            quantity: 1,
            price: product1.price,
            name: product1.name,
            image: product1.images[0].image
        }];
        const orderTotal = product1.price * 1;
        const createdOrder = await createOrderAPI(
            request, userA_info.accessToken, orderProducts, orderTotal, 'Paid',
            userA_info.name, userA_info.address, userA_info.contactNumber
        );
        userA_order1_id = createdOrder._id.toString(); // Ensure it's set for this test

        expect(userA_order1_id).toBeDefined();

        const response = await request.get(`/api/order/${userA_order1_id}`, {
            headers: {
                'Authorization': `Bearer ${userA_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        expect(responseBody.order).toBeDefined();
        expect(responseBody.order._id.toString()).toBe(userA_order1_id);
        expect(responseBody.order.user.userId.toString()).toBe(userA_info.userId.toString()); // Ensure it's the correct user's order
    });

    // Order-ViewByID-007: should return 401 if viewing a specific order without authentication
    test('Order-ViewByID-007: should return 401 if viewing a specific order without authentication', async ({ request }) => {
        console.log('Running Order-ViewByID-007');
        // Ensure an order exists for user A for this test to pass reliably
        // If userA_order1_id is not set from a previous test run, create one here.
        if (!userA_order1_id) {
            const orderProducts = [{
                productId: product1._id.toString(),
                quantity: 1,
                price: product1.price,
                name: product1.name,
                image: product1.images[0].image
            }];
            const orderTotal = product1.price * 1;
            const createdOrder = await createOrderAPI(
                request, userA_info.accessToken, orderProducts, orderTotal, 'Paid',
                userA_info.name, userA_info.address, userA_info.contactNumber
            );
            userA_order1_id = createdOrder._id.toString();
        }

        expect(userA_order1_id).toBeDefined();

        const response = await request.get(`/api/order/${userA_order1_id}`); // No auth header

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Invalid or malformed token');
    });


    // Order-ViewByID-008: should return 403 if user tries to view another user's order
    test('Order-ViewByID-008: should return 403 if user tries to view another user\'s order', async ({ request }) => {
        console.log('Running Order-ViewByID-008');
        // Ensure an order exists for user A for this test to pass reliably
        if (!userA_order1_id) {
            const orderProducts = [{
                productId: product1._id.toString(),
                quantity: 1,
                price: product1.price,
                name: product1.name,
                image: product1.images[0].image
            }];
            const orderTotal = product1.price * 1;
            const createdOrder = await createOrderAPI(
                request, userA_info.accessToken, orderProducts, orderTotal, 'Paid',
                userA_info.name, userA_info.address, userA_info.contactNumber
            );
            userA_order1_id = createdOrder._id.toString();
        }
        expect(userA_order1_id).toBeDefined(); // This is an order belonging to userA_info

        // User B tries to access User A's order
        const response = await request.get(`/api/order/${userA_order1_id}`, {
            headers: {
                'Authorization': `Bearer ${userB_info.accessToken}`, // Authenticate as User B
            },
        });

        expect(response.status()).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.error).toContain('Unauthorized access');
    });

});
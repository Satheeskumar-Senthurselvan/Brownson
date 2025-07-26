// tests/order.spec.js
// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel.js';
import Product from '../../Backend/Models/productModel.js';
import Order from '../../Backend/Models/OrderModel.js';
import bcrypt from 'bcryptjs';

// --- Configuration ---

// MongoDB URI for the test environment.
const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

let testDbConnection;
let TestUserModel;
let TestProductModel;
let TestOrderModel;

// --- Helper Functions ---

/**
 * Generates unique user data for testing.
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
 * Generates unique product data for testing.
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
 * Registers a user and logs them in via API to get a token.
 */
async function registerAndLoginUser(request, email, password) {
    const userData = generateUserData({ email, password });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await TestUserModel.create({ ...userData, password: hashedPassword });

    const loginResponse = await request.post('api/auth/signin', {
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
 * Creates a product directly in the database.
 */
async function createProductDirectlyInDB() {
    const productData = generateProductData();
    const product = await TestProductModel.create(productData);
    return product;
}

/**
 * Creates an order via API, mirroring frontend payload structure.
 */
async function createOrderAPI(request, accessToken, productsArrayForPayload, totalPrice, paymentStatus, username, deliveryAddress, contactNumber) {
    const orderPayload = {
        products: productsArrayForPayload,
        totalPrice,
        paymentStatus,
        username,
        deliveryAddress,
        contactNumber
    };

    const response = await request.post('/api/order/create', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        data: orderPayload
    });
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    expect(responseBody.order).toBeDefined();
    return responseBody.order;
}


// --- Order API Test Suite ---
test.describe('Order API Functional Tests', () => {
    let userA_info;
    let userB_info;
    let product1;
    let userA_order1_id;

    // Setup: Establish DB connection, create necessary test users and a product.
    test.beforeAll(async ({ request }) => {
        try {
            mongoose.set('bufferCommands', false);
            mongoose.set('bufferTimeoutMS', 30000);

            testDbConnection = mongoose.createConnection(DB_URI);

            await new Promise((resolve, reject) => {
                testDbConnection.on('connected', resolve);
                testDbConnection.on('error', reject);
            });

            // Define models on the test connection
            TestUserModel = testDbConnection.model('User', User.schema);
            TestProductModel = testDbConnection.model('Product', Product.schema);
            TestOrderModel = testDbConnection.model('Order', Order.schema);

            userA_info = await registerAndLoginUser(request, generateUserData().email, generateUserData().password);
            userB_info = await registerAndLoginUser(request, generateUserData().email, generateUserData().password);
            product1 = await createProductDirectlyInDB();

        } catch (error) {
            console.error('Order Test Suite: Failed during beforeAll setup:', error);
            test.fail('Order Test Suite setup failed');
        }
    });

    // Teardown: Delete all test-generated data and close the DB connection.
    test.afterAll(async () => {
        try {
            if (testDbConnection && testDbConnection.readyState !== 0) {
                const allUserEmails = [userA_info.email, userB_info.email];
                const allTestUsers = await TestUserModel.find({ email: /test.*@example.com/ });
                allTestUsers.forEach(user => allUserEmails.push(user.email));

                await TestUserModel.deleteMany({ email: { $in: allUserEmails } });
                await TestProductModel.deleteOne({ _id: product1._id });
                await TestOrderModel.deleteMany({ 'user.email': { $in: allUserEmails } });

                await testDbConnection.close();
            }
        } catch (error) {
            console.error('Order Test Suite: Failed during afterAll teardown:', error);
        }
    });

    // Reset order ID before each test to ensure tests are independent.
    test.beforeEach(async () => {
        userA_order1_id = null;
    });

    // --- Order Creation Tests (POST /api/order/create) ---

    test('Order-Create-001: Should allow an authenticated user to create a new order successfully', async ({ request }) => {
        const productsForOrderPayload = [{
            productId: product1._id.toString(),
            productName: product1.name,
            image: product1.images[0].image,
            quantity: 2,
        }];

        const orderTotal = Number(product1.price) * 2;

        const createdOrder = await createOrderAPI(
            request,
            userA_info.accessToken,
            productsForOrderPayload,
            orderTotal,
            'payed',
            userA_info.name,
            userA_info.address,
            userA_info.contactNumber
        );

        expect(createdOrder).toBeDefined();
        expect(createdOrder.user.userId.toString()).toBe(userA_info.userId.toString());
        expect(createdOrder.totalPrice).toBe(orderTotal);
        expect(createdOrder.products.length).toBe(1);
        expect(createdOrder.products[0].productId.toString()).toBe(product1._id.toString());
        expect(createdOrder.paymentStatus).toBe('payed');

        userA_order1_id = createdOrder._id.toString();
    });

    test('Order-Create-002: Should return 401 if creating an order without authentication', async ({ request }) => {
        const productForOrder = {
            productId: product1._id.toString(),
            productName: product1.name,
            image: product1.images[0].image,
            quantity: 1,
        };

        const response = await request.post('/api/order/create', {
            data: {
                products: [productForOrder],
                totalPrice: product1.price,
                paymentStatus: 'cash_on_delivery',
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

    // --- View My Orders Tests (GET /api/order/my-orders) ---

    test('Order-ViewMy-003: Should allow an authenticated user to view their own orders successfully', async ({ request }) => {
        // Ensure an order exists for User A for this test
        const productsForOrderPayload = [{
            productId: product1._id.toString(),
            productName: product1.name,
            image: product1.images[0].image,
            quantity: 1,
        }];
        const orderTotal = product1.price * 1;

        const createdOrder = await createOrderAPI(
            request, userA_info.accessToken, productsForOrderPayload, orderTotal, 'cash_on_delivery',
            userA_info.name, userA_info.address, userA_info.contactNumber
        );
        userA_order1_id = createdOrder._id.toString();

        const response = await request.get('/api/order/my-orders', {
            headers: {
                'Authorization': `Bearer ${userA_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        expect(responseBody.orders).toBeInstanceOf(Array);
        expect(responseBody.orders.length).toBeGreaterThan(0);
        const foundOrder = responseBody.orders.find(order => order._id === userA_order1_id);
        expect(foundOrder).toBeDefined();
        expect(foundOrder.user.userId.toString()).toBe(userA_info.userId.toString());
    });

    test('Order-ViewMy-004: Should return 401 if viewing own orders without authentication', async ({ request }) => {
        const response = await request.get('/api/order/my-orders');

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Invalid or malformed token');
    });

    test('Order-ViewMy-005: Should return an empty list if user has no orders', async ({ request }) => {
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
        expect(responseBody.orders.length).toBe(0);

        await TestUserModel.deleteOne({ _id: noOrderUser.userId });
    });

    // --- View Specific Order by ID Tests (GET /api/order/:id) ---

    test('Order-ViewByID-006: Should allow an authenticated user to view a specific order by ID (their own order)', async ({ request }) => {
        const productsForOrderPayload = [{
            productId: product1._id.toString(),
            productName: product1.name,
            image: product1.images[0].image,
            quantity: 1,
        }];
        const orderTotalFrontendCalculation = product1.price * 1;

        const createdOrder = await createOrderAPI(
            request,
            userA_info.accessToken,
            productsForOrderPayload,
            orderTotalFrontendCalculation,
            'cash_on_delivery',
            userA_info.name,
            userA_info.address,
            userA_info.contactNumber
        );
        userA_order1_id = createdOrder._id.toString();

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
        expect(responseBody.order.user.userId.toString()).toBe(userA_info.userId.toString());
        expect(responseBody.order.totalPrice).toBe(orderTotalFrontendCalculation);
        expect(responseBody.order.products.length).toBe(productsForOrderPayload.length);
        expect(responseBody.order.products[0].productId.toString()).toBe(productsForOrderPayload[0].productId);
    });

    test('Order-ViewByID-007: Should return 401 if viewing a specific order without authentication', async ({ request }) => {
        if (!userA_order1_id) {
            const productsForOrderPayload = [{
                productId: product1._id.toString(),
                productName: product1.name,
                image: product1.images[0].image,
                quantity: 1,
            }];
            const orderTotal = product1.price * 1;
            const createdOrder = await createOrderAPI(
                request, userA_info.accessToken, productsForOrderPayload, orderTotal, 'cash_on_delivery',
                userA_info.name, userA_info.address, userA_info.contactNumber
            );
            userA_order1_id = createdOrder._id.toString();
        }

        expect(userA_order1_id).toBeDefined();

        const response = await request.get(`/api/order/${userA_order1_id}`);

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Invalid or malformed token');
    });

    test('Order-ViewByID-008: Should return 403 if user tries to view another user\'s order', async ({ request }) => {
        if (!userA_order1_id) {
            const productsForOrderPayload = [{
                productId: product1._id.toString(),
                productName: product1.name,
                image: product1.images[0].image,
                quantity: 1,
            }];
            const orderTotal = product1.price * 1;
            const createdOrder = await createOrderAPI(
                request, userA_info.accessToken, productsForOrderPayload, orderTotal, 'cash_on_delivery',
                userA_info.name, userA_info.address, userA_info.contactNumber
            );
            userA_order1_id = createdOrder._id.toString();
        }
        expect(userA_order1_id).toBeDefined();

        const response = await request.get(`/api/order/${userA_order1_id}`, {
            headers: {
                'Authorization': `Bearer ${userB_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.error).toContain('Unauthorized access');
    });
});
// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel';
import Cart from '../../Backend/Models/cart';
import Product from '../../Backend/Models/productModel';
import bcrypt from 'bcryptjs';

const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

let testDbConnection;
let TestUserModel;
let TestCartModel;
let TestProductModel;

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

async function createTestUserAndGetToken(request, email, password) {
    const userData = generateUserData({ email, password });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await TestUserModel.create({ ...userData, password: hashedPassword });

    console.log(`Helper: Created test user ${email} with ID ${user._id} for token generation.`);

    const loginResponse = await request.post('api/auth/signin', {
        data: { email, password },
    });
    expect(loginResponse.status()).toBe(200);
    const loginResponseBody = await loginResponse.json();
    const token = loginResponseBody.token;
    expect(token).toBeDefined();
    return token;
}

export const addToCartAPI = async (request, token, productId, quantity) => {
    return request.post('/api/cart/add', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: { productId, quantity },
    });
};

async function getCartAPI(request, token) {
    console.log('Helper: Getting user cart.');
    return await request.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

async function removeFromCartAPI(request, token, productId) {
    console.log(`Helper: Removing product ${productId} from cart.`);
    return await request.delete(`/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

async function clearCartAPI(request, token) {
    console.log('Helper: Clearing user cart.');
    return await request.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

test.describe('Cart API Tests', () => {
    let authToken;
    let testUserId;
    let dummyProductId1;
    let dummyProductId2;
    let testUserEmail;
    let testUserPassword;

    test.beforeAll(async ({ request }) => {
        try {
            mongoose.set('bufferCommands', false);
            mongoose.set('bufferTimeoutMS', 30000);

            testDbConnection = mongoose.createConnection(DB_URI);

            await new Promise((resolve, reject) => {
                testDbConnection.on('connected', () => {
                    console.log('Cart Test DB Connection: OPEN');
                    resolve();
                });
                testDbConnection.on('error', (err) => {
                    console.log('Cart Test DB Connection: ERROR: ' + err);
                    reject(err);
                });
                testDbConnection.on('disconnected', () => console.log('Cart Test DB Connection: DISCONNECTED'));
            });

            TestUserModel = testDbConnection.model('User', User.schema);
            TestCartModel = testDbConnection.model('Cart', Cart.schema);
            TestProductModel = testDbConnection.model('Product', Product.schema);
            console.log('MongoDB connected for Cart tests and models defined on test connection.');

            const userData = generateUserData();
            testUserEmail = userData.email;
            testUserPassword = userData.password;
            authToken = await createTestUserAndGetToken(request, testUserEmail, testUserPassword);

            const user = await TestUserModel.findOne({ email: testUserEmail });
            testUserId = user._id;

            const product1 = await TestProductModel.create(generateProductData());
            dummyProductId1 = product1._id.toString();

            const product2 = await TestProductModel.create(generateProductData());
            dummyProductId2 = product2._id.toString();
            console.log(`Cart Test Suite: Created dummy products: ${dummyProductId1}, ${dummyProductId2}`);

        } catch (error) {
            console.error('Cart Test Suite: Failed during beforeAll setup:', error);
            test.fail('Cart Test Suite setup failed');
        }
    });

    test.afterAll(async () => {
        try {
            if (testDbConnection && testDbConnection.readyState !== 0) {
                await TestUserModel.deleteOne({ _id: testUserId });
                await TestProductModel.deleteOne({ _id: dummyProductId1 });
                await TestProductModel.deleteOne({ _id: dummyProductId2 });
                await TestCartModel.deleteMany({ userId: testUserId });
                await testDbConnection.close();
                console.log('MongoDB disconnected after all Cart tests and cleaned up data.');
            }
        } catch (error) {
            console.error('Cart Test Suite: Failed during afterAll teardown:', error);
        }
    });

    test.beforeEach(async () => {
        if (testDbConnection.readyState !== 1) {
            console.error('Cart Test DB Connection not ready in beforeEach! Current state:', testDbConnection.readyState);
            throw new Error('Cart Test DB Connection not ready for database operations in beforeEach.');
        }
        await TestCartModel.deleteMany({ userId: testUserId });
        console.log(`Cart Test: Cleared cart for user ${testUserId} before test.`);
    });

    test('should allow an authenticated user to add a product to their cart', async ({ request }) => {
        const quantity = 2;
        const response = await addToCartAPI(request, authToken, dummyProductId1, quantity);
        const responseBody = await response.json();

        console.log('Add to Cart Test - API Response Status:', response.status());
        console.log('Add to Cart Test - API Response Body:', responseBody);

        expect(response.status()).toBe(200);
        expect(responseBody.message).toBe('Product added to cart');
        expect(responseBody.cart).toBeDefined();
        expect(responseBody.cart.userId.toString()).toBe(testUserId.toString());
        expect(responseBody.cart.productId.toString()).toBe(dummyProductId1);
        expect(responseBody.cart.quantity).toBe(quantity);

        const userCartItem = await TestCartModel.findOne({ userId: testUserId, productId: dummyProductId1 });
        expect(userCartItem).not.toBeNull();
        expect(userCartItem.quantity).toBe(quantity);
        expect(userCartItem.productId.toString()).toBe(dummyProductId1);
    });

    test('should update quantity if the same product is added again', async ({ request }) => {
        await addToCartAPI(request, authToken, dummyProductId1, 1);

        const newQuantity = 2;
        const response = await addToCartAPI(request, authToken, dummyProductId1, newQuantity);
        const responseBody = await response.json();

        console.log('Update Cart Quantity Test - API Response Status:', response.status());
        console.log('Update Cart Quantity Test - API Response Body:', responseBody);

        expect(response.status()).toBe(200);
        expect(responseBody.message).toBe('Product quantity updated in cart');
        expect(responseBody.cart).toBeDefined();
        expect(responseBody.cart.quantity).toBe(newQuantity);

        const userCartItem = await TestCartModel.findOne({ userId: testUserId, productId: dummyProductId1 });
        expect(userCartItem).not.toBeNull();
        expect(userCartItem.quantity).toBe(newQuantity);
    });

    test('should return 401 if adding to cart without authentication', async ({ request }) => {
        const response = await addToCartAPI(request, 'invalid_token', dummyProductId1, 1);
        const responseBody = await response.json();

        console.log('Add to Cart No Auth Test - API Response Status:', response.status());
        console.log('Add to Cart No Auth Test - API Response Body:', responseBody);

        expect(response.status()).toBe(401);
        expect(responseBody.message).toBe('Invalid or malformed token. Please login again.');
    });

    test('should return 400 if adding a product with invalid ID format', async ({ request }) => {
        const response = await addToCartAPI(request, authToken, 'invalidid123', 1);
        const responseBody = await response.json();

        console.log('Add to Cart Invalid ID Format Test - API Response Status:', response.status());
        console.log('Add to Cart Invalid ID Format Test - API Response Body:', responseBody);

        expect(response.status()).toBe(400);
        expect(responseBody.error).toBeDefined();
    });

    test('should return 400 if adding a product with missing quantity', async ({ request }) => {
        const response = await request.post('/api/cart/add', {
            headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
            data: { productId: dummyProductId1 },
        });
        const responseBody = await response.json();

        console.log('Add to Cart Missing Quantity Test - API Response Status:', response.status());
        console.log('Add to Cart Missing Quantity Test - API Response Body:', responseBody);

        expect(response.status()).toBe(400);
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toBe('Quantity must be a positive number.');
    });

    test('should return 400 if adding a product with invalid quantity (e.g., 0 or negative)', async ({ request }) => {
        const response = await addToCartAPI(request, authToken, dummyProductId1, 0);
        const responseBody = await response.json();

        console.log('Add to Cart Invalid Quantity Test - API Response Status:', response.status());
        console.log('Add to Cart Invalid Quantity Test - API Response Body:', responseBody);

        expect(response.status()).toBe(400);
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toBe('Quantity must be a positive number.');
    });

    test('should allow an authenticated user to view their cart with products', async ({ request }) => {
        await addToCartAPI(request, authToken, dummyProductId1, 1);
        await addToCartAPI(request, authToken, dummyProductId2, 3);

        const response = await getCartAPI(request, authToken);
        const responseBody = await response.json();

        console.log('View Cart Test - API Response Status:', response.status());
        console.log('View Cart Test - API Response Body:', responseBody);

        expect(response.status()).toBe(200);
        expect(responseBody.cart).toBeDefined();
        expect(responseBody.cart.user.toString()).toBe(testUserId.toString());
        expect(responseBody.cart.items).toHaveLength(2);

        expect(responseBody.cart.items).toContainEqual(
            expect.objectContaining({
                productId: expect.objectContaining({ _id: dummyProductId1 }),
                quantity: 1,
            })
        );
        expect(responseBody.cart.items).toContainEqual(
            expect.objectContaining({
                productId: expect.objectContaining({ _id: dummyProductId2 }),
                quantity: 3,
            })
        );
    });

    test('should return an empty cart if no items are added', async ({ request }) => {
        let initialUserCart = await TestCartModel.findOne({ userId: testUserId });
        console.log('DEBUG: Cart before getCartAPI in empty cart test (initial check):', initialUserCart ? initialUserCart.items.length : 'null/undefined');
        if (initialUserCart && initialUserCart.items.length > 0) {
            await TestCartModel.deleteMany({ userId: testUserId });
            console.log('DEBUG: Manually cleared cart again for empty cart test as it was not empty.');
        }

        const response = await getCartAPI(request, authToken);
        const responseBody = await response.json();

        console.log('View Empty Cart Test - API Response Status:', response.status());
        console.log('View Empty Cart Test - API Response Body:', responseBody);

        expect(response.status()).toBe(200);
        expect(responseBody.cart).toBeDefined();
        expect(responseBody.cart.user.toString()).toBe(testUserId.toString());
        expect(responseBody.cart.items).toHaveLength(0);
    });

    test('should return 401 if viewing cart without authentication', async ({ request }) => {
        const response = await getCartAPI(request, 'invalid_token');
        const responseBody = await response.json();

        console.log('View Cart No Auth Test - API Response Status:', response.status());
        console.log('View Cart No Auth Test - API Response Body:', responseBody);

        expect(response.status()).toBe(401);
        expect(responseBody.message).toBe('Invalid or malformed token. Please login again.');
    });

    test('should allow an authenticated user to remove a product from their cart', async ({ request }) => {
        await addToCartAPI(request, authToken, dummyProductId1, 2);

        const response = await removeFromCartAPI(request, authToken, dummyProductId1);
        const responseBody = await response.json();

        console.log('Remove Product from Cart Test - API Response Status:', response.status());
        console.log('Remove Product from Cart Test - API Response Body:', responseBody);

        expect(response.status()).toBe(200);
        expect(responseBody.message).toBe('Product removed from cart successfully');

        const userCart = await TestCartModel.findOne({ userId: testUserId });
        expect(userCart).toBeNull();
    });

    test('should return 401 if removing from cart without authentication', async ({ request }) => {
        const response = await removeFromCartAPI(request, 'invalid_token', dummyProductId1);
        const responseBody = await response.json();

        console.log('Remove from Cart No Auth Test - API Response Status:', response.status());
        console.log('Remove from Cart No Auth Test - API Response Body:', responseBody);

        expect(response.status()).toBe(401);
        expect(responseBody.message).toBe('Invalid or malformed token. Please login again.');
    });

    test('should return 400 if removing a product with invalid ID format', async ({ request }) => {
        const response = await removeFromCartAPI(request, authToken, 'invalidid');
        const responseBody = await response.json();

        console.log('Remove from Cart Invalid ID Format Test - API Response Status:', response.status());
        console.log('Remove from Cart Invalid ID Format Test - API Response Body:', responseBody);

        expect(response.status()).toBe(400);
        expect(responseBody.error).toBeDefined();
    });
});
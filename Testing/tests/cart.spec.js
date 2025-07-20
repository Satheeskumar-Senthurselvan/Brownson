
// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../Backend/Models/userModel'; // Import User model
import Cart from '../../Backend/Models/cart'; // Assuming your Cart model path
import Product from '../../Backend/Models/productModel'; // Assuming your Product model path
import bcrypt from 'bcryptjs';

// MongoDB URI for the test environment.
const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

// Declare variables to hold our specific connection and model instances for testing
let testDbConnection;
let TestUserModel;
let TestCartModel;
let TestProductModel;

// --- Helper Functions for Test Data and API Calls ---

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
 * Sends a signin request to the API and returns the token.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<string>} The authentication token.
 */
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

/**
 * Sends an add to cart request.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} token - Authentication token.
 * @param {string} productId - ID of the product to add.
 * @param {number} quantity - Quantity to add.
 * @returns {Promise<import('@playwright/test').APIResponse>} The API response.
*/
export const addToCartAPI = async (request, token, productId, quantity) => {
  return request.post('/api/cart/add', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: { productId, quantity },
  });
};

/**
 * Sends a get cart request.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} token - Authentication token.
 * @returns {Promise<import('@playwright/test').APIResponse>} The API response.
 */
async function getCartAPI(request, token) {
  console.log('Helper: Getting user cart.');
  return await request.get('/api/cart', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Sends a remove from cart request.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} token - Authentication token.
 * @param {string} productId - ID of the product to remove.
 * @returns {Promise<import('@playwright/test').APIResponse>} The API response.
 */
async function removeFromCartAPI(request, token, productId) {
  console.log(`Helper: Removing product ${productId} from cart.`);
  return await request.delete(`/api/cart/remove/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Sends a clear cart request.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright's API request fixture.
 * @param {string} token - Authentication token.
 * @returns {Promise<import('@playwright/test').APIResponse>} The API response.
 */
async function clearCartAPI(request, token) {
  console.log('Helper: Clearing user cart.');
  return await request.delete('/api/cart/clear', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Main Cart API Test Suite ---
test.describe('Cart API Tests', () => {
  let authToken;
  let testUserId;
  let dummyProductId1;
  let dummyProductId2;
  let testUserEmail;
  let testUserPassword;

  // Connect to MongoDB and set up common test data before all tests in this file
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

      // Define models on this specific connection
      TestUserModel = testDbConnection.model('User', User.schema);
      TestCartModel = testDbConnection.model('Cart', Cart.schema); // Using Cart.schema as before
      TestProductModel = testDbConnection.model('Product', Product.schema);
      console.log('MongoDB connected for Cart tests and models defined on test connection.');

      // Create a persistent test user and get token
      const userData = generateUserData();
      testUserEmail = userData.email;
      testUserPassword = userData.password;
      authToken = await createTestUserAndGetToken(request, testUserEmail, testUserPassword);

      const user = await TestUserModel.findOne({ email: testUserEmail });
      testUserId = user._id;

      // Create dummy products
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

  // Clean up the test user and products after all tests in this file are done
  test.afterAll(async () => {
    try {
      if (testDbConnection && testDbConnection.readyState !== 0) {
        await TestUserModel.deleteOne({ _id: testUserId });
        await TestProductModel.deleteOne({ _id: dummyProductId1 });
        await TestProductModel.deleteOne({ _id: dummyProductId2 });
        // Clean up any remaining carts for the test user using 'userId'
        await TestCartModel.deleteMany({ userId: testUserId }); // Use 'userId' field
        await testDbConnection.close();
        console.log('MongoDB disconnected after all Cart tests and cleaned up data.');
      }
    } catch (error) {
      console.error('Cart Test Suite: Failed during afterAll teardown:', error);
    }
  });

  // Clear the cart before each individual test to ensure a clean state
  test.beforeEach(async () => {
    if (testDbConnection.readyState !== 1) {
      console.error('Cart Test DB Connection not ready in beforeEach! Current state:', testDbConnection.readyState);
      throw new Error('Cart Test DB Connection not ready for database operations in beforeEach.');
    }
    // Use 'userId' field to match your Cart schema
    await TestCartModel.deleteMany({ userId: testUserId });
    console.log(`Cart Test: Cleared cart for user ${testUserId} before test.`);
  });

  // --- POST /api/cart/add ---
  test('should allow an authenticated user to add a product to their cart', async ({ request }) => {
    const quantity = 2;
    const response = await addToCartAPI(request, authToken, dummyProductId1, quantity);
    const responseBody = await response.json();

    console.log('Add to Cart Test - API Response Status:', response.status());
    console.log('Add to Cart Test - API Response Body:', responseBody);

    expect(response.status()).toBe(200);
    expect(responseBody.message).toBe('Product added to cart');
    expect(responseBody.cart).toBeDefined();
    // Expect response body to have 'userId' now as per your schema
    expect(responseBody.cart.userId.toString()).toBe(testUserId.toString()); 
    expect(responseBody.cart.productId.toString()).toBe(dummyProductId1);
    expect(responseBody.cart.quantity).toBe(quantity);

    // Check directly in the database using 'userId'
    const userCartItem = await TestCartModel.findOne({ userId: testUserId, productId: dummyProductId1 });
    expect(userCartItem).not.toBeNull();
    expect(userCartItem.quantity).toBe(quantity);
    expect(userCartItem.productId.toString()).toBe(dummyProductId1);
  });

  test('should update quantity if the same product is added again', async ({ request }) => {
    // Initial add to get a quantity of 1
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

    // Check directly in the database using 'userId'
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

  // --- GET /api/cart ---
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
    // Verify the cart is actually empty from the DB before making the API call
    let initialUserCart = await TestCartModel.findOne({ userId: testUserId }); // Use 'userId' field
    console.log('DEBUG: Cart before getCartAPI in empty cart test:', initialUserCart ? initialUserCart.items.length : 'null/undefined');
    if (initialUserCart && initialUserCart.items.length > 0) {
        await TestCartModel.deleteMany({ userId: testUserId }); // Use 'userId' field
        console.log('DEBUG: Manually cleared cart again for empty cart test.');
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

  // --- DELETE /api/cart/remove/:productId ---
  test('should allow an authenticated user to remove a product from their cart', async ({ request }) => {
    await addToCartAPI(request, authToken, dummyProductId1, 2); // Add product first

    const response = await removeFromCartAPI(request, authToken, dummyProductId1);
    const responseBody = await response.json();

    console.log('Remove Product from Cart Test - API Response Status:', response.status());
    console.log('Remove Product from Cart Test - API Response Body:', responseBody);

    expect(response.status()).toBe(200);
    expect(responseBody.message).toBe('Product removed from cart successfully');

    // Check directly in the database. Since your backend deletes the cart document when empty.
    const userCart = await TestCartModel.findOne({ userId: testUserId }); // Use 'userId' field
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
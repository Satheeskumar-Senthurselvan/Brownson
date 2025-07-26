// @ts-check
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import User from '../../backend/Models/userModel.js';
import Product from '../../backend/Models/productModel.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const DB_URI = 'mongodb+srv://sathees:Sathees123@cluster1.a1nbh.mongodb.net/Brownson_test?retryWrites=true&w=majority&appName=Cluster1&serverSelectionTimeoutMS=60000';

let testDbConnection;
let TestUserModel;
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
        role: 'admin',
        ...overrides,
    };
}

async function registerAndLoginUser(request, email, password, role = 'user') {
    const userData = generateUserData({ email, password, role });
    const hashedPassword = await bcrypt.hash(password, 10);

    await TestUserModel.deleteOne({ email: email });
    const user = await TestUserModel.create({ ...userData, password: hashedPassword });

    const loginResponse = await request.post('/api/auth/signin', {
        data: { email, password },
    });

    expect(loginResponse.status()).toBe(200);
    const responseBody = await loginResponse.json();
    const token = responseBody.token;
    expect(token).toBeDefined();

    return {
        accessToken: token,
        userId: user._id.toString(),
        email,
        password,
        contactNumber: userData.contactNumber,
        address: userData.address,
        name: userData.name,
        role: user.role
    };
}

async function createProductDirectlyInDB(overrides = {}) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const categories = [
        'Jellies', 'Custards', 'Food essences', 'Cake ingredients', 'Artificial colors and flavors'
    ];
    const units = ['ml', 'g', 'kg', 'l', 'pcs'];

    const productData = {
        name: `DB Product ${uniqueId}`,
        price: Math.floor(Math.random() * 1000) + 10,
        description: `Description for DB Product ${uniqueId}`,
        ratings: 0,
        images: [{ image: `/img/product/db_image_${uniqueId}.png`, _id: new mongoose.Types.ObjectId() }],
        category: categories[Math.floor(Math.random() * categories.length)],
        seller: 'DB Seller ' + uniqueId,
        stock: Math.floor(Math.random() * 50) + 1,
        quantity: {
            value: Math.floor(Math.random() * 20) + 1,
            unit: units[Math.floor(Math.random() * units.length)],
        },
        numOfReviews: 0,
        reviews: [],
        ...overrides,
    };
    const product = await TestProductModel.create(productData);
    return product;
}

test.describe('Admin Product API Tests (Focused)', () => {
    let admin_info;
    let testProductId;

    const dummyImagePath = path.join(__dirname, 'dummy-image.jpg');
    if (!fs.existsSync(dummyImagePath)) {
        const dummyImageBuffer = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
            0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
        ]);
        fs.writeFileSync(dummyImagePath, dummyImageBuffer);
    }

    test.beforeAll(async ({ request }) => {
        try {
            mongoose.set('bufferCommands', false);
            mongoose.set('bufferTimeoutMS', 30000);

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
            TestProductModel = testDbConnection.model('Product', Product.schema);

            const adminEmail = generateUserData({ role: 'admin' }).email;
            admin_info = await registerAndLoginUser(request, adminEmail, 'adminPass123', 'admin');

        } catch (error) {
            test.fail('Admin Product Test Suite setup failed');
        }
    });

    test.afterAll(async () => {
        try {
            if (testDbConnection && testDbConnection.readyState !== 0) {
                await TestUserModel.deleteMany({
                    email: { $regex: /^test.*@example\.com/ }
                });
                await TestProductModel.deleteMany({
                    $or: [
                        { name: { $regex: /^Automated Test Product/ } },
                        { name: { $regex: /^Updated Test Product/ } },
                        { name: { $regex: /^DB Product/ } },
                        { name: { $regex: /^Product with Image/ } },
                        { name: { $regex: /^Product to be Deleted/ } },
                        { name: { $regex: /^Product for Partial Update/ } }
                    ]
                });

                await testDbConnection.close();
            }
            if (fs.existsSync(dummyImagePath)) {
                fs.unlinkSync(dummyImagePath);
            }
        } catch (error) {}
    });

    test.beforeEach(async () => {
        testProductId = null;
    });

    test('AdminProduct-Create-001: Should allow an admin to create a new product with images', async ({ request }) => {
        const uniqueProductSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newProductData = {
            name: `Automated Test Product ${uniqueProductSuffix}`,
            price: '150.00',
            description: `Description for ${uniqueProductSuffix}`,
            category: 'Food essences',
            seller: 'Automated Seller',
            stock: '50',
            'quantity[value]': '100',
            'quantity[unit]': 'ml',
        };

        const response = await request.post('/api/product/admin/product/new', {
            headers: {
                'Authorization': `Bearer ${admin_info.accessToken}`,
            },
            formData: {
                ...newProductData,
                images: fs.createReadStream(dummyImagePath),
            },
        });

        const responseBody = await response.json();

        expect(response.status()).toBe(201);
        expect(responseBody.success).toBe(true);
        expect(responseBody.product).toBeDefined();
        expect(responseBody.product).toHaveProperty('_id');
        expect(responseBody.product.name).toBe(newProductData.name);
        expect(responseBody.product.price).toBe(Number(newProductData.price));
        expect(responseBody.product.stock).toBe(Number(newProductData.stock));
        expect(responseBody.product.quantity).toEqual({
            value: Number(newProductData['quantity[value]']),
            unit: newProductData['quantity[unit]']
        });
        expect(responseBody.product.images).toBeInstanceOf(Array);
        expect(responseBody.product.images.length).toBeGreaterThan(0);
        expect(responseBody.product.images[0]).toHaveProperty('image');
        expect(responseBody.product.images[0]).toHaveProperty('_id');
        expect(responseBody.product.images[0].image).toContain('/img/product/');

        testProductId = responseBody.product._id;
    });

    test('AdminProduct-Create-002: Should return 401 if creating product without authentication', async ({ request }) => {
        const response = await request.post('/api/product/admin/product/new', {
            formData: {
                name: 'Unauthorized Product', price: '10', description: '...',
                category: 'Jellies', seller: '...', stock: '1', 'quantity[value]': '1', 'quantity[unit]': 'pcs',
            },
        });

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Please login to access this resource');
    });

    test('AdminProduct-Create-003: Should return 403 if a regular user tries to create a product', async ({ request }) => {
        const regular_user_info = await registerAndLoginUser(request, generateUserData().email, 'userPass123', 'user');

        const response = await request.post('/api/product/admin/product/new', {
            headers: {
                'Authorization': `Bearer ${regular_user_info.accessToken}`,
            },
            formData: {
                name: 'Regular User Product', price: '10', description: '...',
                category: 'Jellies', seller: '...', stock: '1', 'quantity[value]': '1', 'quantity[unit]': 'pcs',
            },
        });

        expect(response.status()).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Role (user) is not allowed to access this resource');
    });

    test('AdminProduct-GetAll-001: Should allow an admin to get all products', async ({ request }) => {
        if (!testProductId) {
            const product = await createProductDirectlyInDB();
            testProductId = product._id.toString();
        }

        const response = await request.get('/api/product/admin/products', {
            headers: {
                'Authorization': `Bearer ${admin_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        expect(responseBody.products).toBeInstanceOf(Array);
        expect(responseBody.products.length).toBeGreaterThan(0);
        const foundProduct = responseBody.products.find(p => p._id === testProductId);
        expect(foundProduct).toBeDefined();
        expect(foundProduct).toHaveProperty('stock');
    });

    test('AdminProduct-GetAll-003: Should return 403 if a regular user tries to get all products', async ({ request }) => {
        const regular_user_info = await registerAndLoginUser(request, generateUserData().email, 'userPass123', 'user');

        const response = await request.get('/api/product/admin/products', {
            headers: {
                'Authorization': `Bearer ${regular_user_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Role (user) is not allowed to access this resource');
    });

    test('AdminProduct-Update-001: Should allow an admin to update an existing product with new images', async ({ request }) => {
        if (!testProductId) {
            const product = await createProductDirectlyInDB();
            testProductId = product._id.toString();
        }

        const updatedName = `Updated Test Product ${Date.now()}`;
        const updatedPrice = '250';
        const updatedDescription = '100% natural organic olive oil for cooking and skincare. - Updated';
        const updatedStock = '75';

        const updatePayload = {
            name: updatedName,
            price: updatedPrice,
            description: updatedDescription,
            category: 'Food essences',
            seller: 'Brownson',
            stock: updatedStock,
            'quantity[value]': '100',
            'quantity[unit]': 'ml',
            images: fs.createReadStream(dummyImagePath),
            imagesCleared: 'true',
        };

        const response = await request.put(`/api/product/admin/product/${testProductId}`, {
            headers: {
                'Authorization': `Bearer ${admin_info.accessToken}`,
            },
            formData: updatePayload,
        });

        const responseBody = await response.json();

        expect(response.status()).toBe(200);
        expect(responseBody.success).toBe(true);
        expect(responseBody.product).toBeDefined();
        expect(responseBody.product._id.toString()).toBe(testProductId);
        expect(responseBody.product.name).toBe(updatedName);
        expect(responseBody.product.price).toBe(Number(updatedPrice));
        expect(responseBody.product.description).toBe(updatedDescription);
        expect(responseBody.product.stock).toBe(Number(updatedStock));
        expect(responseBody.product.quantity).toEqual({
            value: Number(updatePayload['quantity[value]']),
            unit: updatePayload['quantity[unit]']
        });
        expect(responseBody.product.images).toBeInstanceOf(Array);
        expect(responseBody.product.images.length).toBeGreaterThan(0);
        expect(responseBody.product.images[0]).toHaveProperty('image');
        expect(responseBody.product.images[0]).toHaveProperty('_id');
        expect(responseBody.product.images[0].image).toContain('/img/product/');
    });

    test('AdminProduct-Update-003: Should return 401 if updating product without authentication', async ({ request }) => {
        const dummyId = new mongoose.Types.ObjectId().toString();
        const response = await request.put(`/api/product/admin/product/${dummyId}`, {
            formData: { name: 'Unauthorized Update' },
        });

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Please login to access this resource');
    });

    test('AdminProduct-Update-004: Should return 403 if a regular user tries to create a product', async ({ request }) => {
        const regular_user_info = await registerAndLoginUser(request, generateUserData().email, 'userPass123', 'user');

        const dummyId = new mongoose.Types.ObjectId().toString();
        const response = await request.put(`/api/product/admin/product/${dummyId}`, {
            headers: {
                'Authorization': `Bearer ${regular_user_info.accessToken}`,
            },
            formData: { name: 'Forbidden Update' },
        });

        expect(response.status()).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Role (user) is not allowed to access this resource');
    });

    test('AdminProduct-Delete-001: Should allow an admin to delete an existing product', async ({ request }) => {
        const productToDelete = await createProductDirectlyInDB({ name: 'Product to be Deleted' });
        const productIdToDelete = productToDelete._id.toString();

        const response = await request.delete(`/api/product/admin/product/${productIdToDelete}`, {
            headers: {
                'Authorization': `Bearer ${admin_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        expect(responseBody.message).toBe('Product deleted');

        const deletedProduct = await TestProductModel.findById(productIdToDelete);
        expect(deletedProduct).toBeNull();

        const fetchResponse = await request.get(`/api/product/${productIdToDelete}`);
        expect(fetchResponse.status()).toBe(404);
        expect(fetchResponse.json()).resolves.toHaveProperty('message', 'API Route Not Found');
    });

    test('AdminProduct-002: Should return 401 if deleting product without authentication', async ({ request }) => {
        const dummyId = new mongoose.Types.ObjectId().toString();
        const response = await request.delete(`/api/product/admin/product/${dummyId}`);

        expect(response.status()).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Please login to access this resource');
    });

    test('AdminProduct-003: Should return 403 if a regular user tries to delete a product', async ({ request }) => {
        const regular_user_info = await registerAndLoginUser(request, generateUserData().email, 'userPass123', 'user');

        const dummyId = new mongoose.Types.ObjectId().toString();
        const response = await request.delete(`/api/product/admin/product/${dummyId}`, {
            headers: {
                'Authorization': `Bearer ${regular_user_info.accessToken}`,
            },
        });

        expect(response.status()).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.message).toContain('Role (user) is not allowed to access this resource');
    });
});
import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * 1. Define the test configuration
 * This example simulates 10 virtual users for a duration of 30 seconds.
 */
export let options = {
    vus: 200,
    duration: '30s',
};

const BASE_URL = 'http://localhost:4000';

/**
 * This is the main function that each virtual user will execute.
 * It simulates a user's journey: signing up, logging in, and accessing a protected resource.
 */
export default function () {
    let token = ''; 

    // Create a truly unique user for each virtual user (VU)
    const uniqueUserId = `${Date.now()}-${__VU}`;
    const testUser = {
        name: `Test User ${uniqueUserId}`,
        email: `testuser_${uniqueUserId}@example.com`,
        password: 'testpassword123',
        contactNumber: '1234567890',
        address: '123 Test St',
        profileImg: '/img/uploadsImage/user.jpg',
    };

    // Step A: Sign up a new user with all required fields
    const signupPayload = JSON.stringify(testUser);
    const signupHeaders = {
        'Content-Type': 'application/json',
    };

    let signupRes = http.post(`${BASE_URL}/api/auth/signup`, signupPayload, {
        headers: signupHeaders,
    });
    
    check(signupRes, {
        'Signup successful (status 201)': (res) => res.status === 201,
    });
    
    if (signupRes.status !== 201) {
        console.error(`VU ${__VU}: Failed to create new user. Stopping VU.`);
        return;
    }

    // Step B: Log in using the newly created user to get the authentication token
    const loginPayload = JSON.stringify({
        email: testUser.email,
        password: testUser.password,
    });
    const loginHeaders = {
        'Content-Type': 'application/json',
    };

    let loginRes = http.post(`${BASE_URL}/api/auth/signin`, loginPayload, {
        headers: loginHeaders,
    });
    
    check(loginRes, {
        'Login successful (status 200)': (res) => res.status === 200,
    });
    token = loginRes.json('token');

    if (!token) {
        console.error(`VU ${__VU}: Failed to get auth token. Stopping VU.`);
        return;
    }

    // Step C: Access a protected resource (e.g., get all products for a regular user)
    const protectedHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    // Correcting the URL here
    let protectedRes = http.get(`${BASE_URL}/api/product/products`, {
        headers: protectedHeaders,
    });
    
    // Log the response status and body for debugging
    console.log(`VU ${__VU}: Protected resource response status: ${protectedRes.status}`);
    console.log(`VU ${__VU}: Protected resource response body: ${protectedRes.body}`);

    // Check if the request to the protected endpoint was successful
    check(protectedRes, {
        'Protected resource accessed successfully (status 200)': (res) => res.status === 200,
    });
    
    sleep(1);
}

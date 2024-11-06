require('dotenv').config();

// Mock the performance API
global.performance = {
    now: () => Date.now(),
};


import request from 'supertest';
import express from 'express';
import employeeRouter from '../routes/employeeLogin.mjs'; // Adjust the path to your router
import { client } from '../db/conn.mjs'; // Import the MongoDB client


const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use('/emp', employeeRouter); // Use your employee router

// Mock database connection for testing
beforeAll(async () => {
    // Connect to your test database or mock the db connection
    await client.connect(); // Ensure the client is connected
});

afterAll(async () => {
    // Close the MongoDB connection after tests
    await client.close(); // Close the client, not the db
});

describe('Employee Login', () => {
    it('should successfully log in with valid credentials', async () => {
        // Replace with valid test credentials
        const validCredentials = {
            username: 'emp1', // Replace with a valid username
            password: 'Flexvision@27' // Replace with the corresponding password
        };

        const response = await request(app)
            .post('/emp/emplogin')
            .send(validCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('username', validCredentials.username);
        expect(response.body.message).toBe('Authentication successful');
    });

    it('should return an error for invalid credentials', async () => {
        const invalidCredentials = {
            username: 'invaliduser',
            password: 'wrongpassword'
        };

        const response = await request(app)
            .post('/emp/emplogin')
            .send(invalidCredentials);

        expect(response.status).toBe(401);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    field: 'general',
                    message: 'Username or password could be incorrect'
                })
            ])
        );
    });

    it('should return an error for missing fields', async () => {
        const response = await request(app)
            .post('/emp/emplogin')
            .send({}); // Sending an empty object

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    field: 'username',
                    message: 'Username is required'
                }),
                expect.objectContaining({
                    field: 'password',
                    message: 'Password is required'
                })
            ])
        );
    });
});
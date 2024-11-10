import request from 'supertest';
import express from 'express';
import router from '../routes/payment.mjs';
import performanceNow from 'performance-now';
import { client, db } from '../db/conn.mjs'; // Import the MongoDB client and db
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load environment variables from .env file


// Polyfill the performance API
global.performance = {
    now: performanceNow
};

const app = express();
app.use(express.json());
app.use('/', router);

let server;

beforeAll((done) => {
    server = app.listen(4002, () => { // Use a different port number (4002)
        console.log('Test server running on port 4002');
        done();
    });
});

afterAll(async () => {
    try {
        // Close the MongoDB connection after all tests are done
        await client.close();
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    } finally {
        // Close the Express server after all tests are done
        server.close();
    }
});

jest.setTimeout(10000); // Increase the timeout to 10 seconds

const generateToken = (username, accountNumber) => {
    try {
        const token = jwt.sign({ username, accountNumber }, process.env.SECRET_KEY, { expiresIn: "20m" });
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

describe('Payment Endpoint', () => {
    it('should return validation errors for invalid account number', async () => {
        const token = generateToken('FlexVision', '789258146');
        const response = await request(app)
            .post('/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                recipientName: 'John Doe',
                recipientBank: 'Bank of America',
                recipientAccountNo: '123', // Invalid account number
                amount: 100,
                swiftCode: 'BOFAUS3N',
                username: 'johndoe',
                date: '2022-01-01',
                currency: 'USD',
            });

        expect(response.status).toBe(400);
        expect(response.body.fieldErrors).toBeDefined();
        expect(response.body.fieldErrors.recipientAccountNo).toBe('Invalid account number. It should have 9 to 10 digits.');
    });

    it('should return validation errors for invalid swift code', async () => {
        const token = generateToken('FlexVision', '789258146');
        const response = await request(app)
            .post('/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                recipientName: 'John Doe',
                recipientBank: 'Bank of America',
                recipientAccountNo: '789258146',
                amount: 100,
                swiftCode: '123', // Invalid swift code
                username: 'johndoe',
                date: '2022-01-01',
                currency: 'USD',
            });

        expect(response.status).toBe(400);
        expect(response.body.fieldErrors).toBeDefined();
        expect(response.body.fieldErrors.swiftCode).toBe('Invalid swift code. It should have 4 to 5 capital letters followed by 1 to 2 numbers.');
    });

    // Test case for fetching pending payments
    it('should fetch pending payments', async () => {
        const token = generateToken('FlexVision', '789258146'); // Generate a token for authentication
        const response = await request(app)
            .get('/pending') // Call the endpoint to fetch pending payments
            .set('Authorization', `Bearer ${token}`); // Set the authorization header

        expect(response.status).toBe(200); // Expect a successful response
        expect(Array.isArray(response.body)).toBe(true); // Expect the response body to be an array
    });

    // Test case for fetching transaction history
    it('should fetch transaction history', async () => {
        const token = generateToken('FlexVision', '789258146'); // Generate a token for authentication
        const response = await request(app)
            .get('/history') // Call the endpoint to fetch transaction history
            .set('Authorization', `Bearer ${token}`); // Set the authorization header

        expect(response.status).toBe(200); // Expect a successful response
        expect(Array.isArray(response.body)).toBe(true); // Expect the response body to be an array
    });


});
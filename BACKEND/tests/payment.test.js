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
  } finally {
    // Close the Express server after all tests are done
    server.close();
  }
});

jest.setTimeout(10000); // Increase the timeout to 10 seconds

const generateToken = (username, accountNumber) => {
  try {
    const token = jwt.sign({ username, accountNumber }, process.env.SECRET_KEY, { expiresIn: "1h" });
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

  // ... other tests ...
});
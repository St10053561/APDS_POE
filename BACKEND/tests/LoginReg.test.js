import request from 'supertest';
import express from 'express';
import router from '../routes/Login&Reg.mjs';
import performanceNow from 'performance-now';
import { client } from '../db/conn.mjs'; // Import the MongoDB client

// Polyfill the performance API
global.performance = {
  now: performanceNow
};

const app = express();
app.use(express.json());
app.use('/', router);

let server;

beforeAll((done) => {
  server = app.listen(4000, () => {
    console.log('Test server running on port 4000');
    done();
  });
});

afterAll(async () => {
  // Close the MongoDB connection after all tests are done
  await client.close();
  // Close the Express server after all tests are done
  server.close();
});

describe('Registration Endpoint', () => {
  it('should return validation errors for invalid input', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        firstName: 'John1', // Invalid first name
        lastName: 'Doe',
        email: 'invalid-email', // Invalid email
        username: 'jd', // Invalid username (too short)
        password: '123', // Invalid password (too weak)
        confirmPassword: '1234', // Passwords do not match
        accountNumber: '123', // Invalid account number (too short)
        idNumber: '123456789012' // Invalid ID number (too short)
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toHaveLength(7); // Adjusted to 7 validation errors
  });

  it('should create a new user with valid input', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'Password123',
        confirmPassword: 'Password123',
        accountNumber: '1234567890',
        idNumber: '1234567890123'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });
});
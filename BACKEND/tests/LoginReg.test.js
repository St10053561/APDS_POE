import request from 'supertest';
import express from 'express';
import router from '../routes/Login&Reg.mjs';
import performanceNow from 'performance-now';
import { client, db } from '../db/conn.mjs'; // Import the MongoDB client and db
import dotenv from 'dotenv'; // Import dotenv


// Load environment variables from .env file
dotenv.config();


// Polyfill the performance API
global.performance = {
  now: performanceNow
};

//This is getting a express route
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
        password: process.env.TEST_PASSWORD2, // Invalid password (too weak)
        confirmPassword: '1234', // Passwords do not match
        accountNumber: '123', // Invalid account number (too short)
        idNumber: '123456789012' // Invalid ID number (too short)
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toHaveLength(6);
  });

  it('should create a new user with valid input', async () => {
    const username = `johndoe${Math.random().toString(36).slice(2, 11)}`;
    const email = `vjannatha${Math.random().toString(36).slice(2, 11)}@gmail.com`;
    const response = await request(app)
      .post('/register')
      .send({
        firstName: 'vicky',
        lastName: 'jannatha',
        email,
        username,
        password: process.env.EMPLOYEE_PASSWORD,
        confirmPassword: 'Abc@1234',
        accountNumber: '1234567890',
        idNumber: '1234567890123'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');

    // Check if the user was created in the database
    const collection = await db.collection("CustomerReg&Login");
    const user = await collection.findOne({ username });
    expect(user).toBeDefined();
  });

  it('should return an error for duplicate username', async () => {
    // First registration
    await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: process.env.EMPLOYEE_PASSWORD,
        confirmPassword: 'Abc@1234',
        accountNumber: '1234567890',
        idNumber: '1234567890123'
      });

    // Attempt to register with the same username
    const response = await request(app)
      .post('/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        username: 'johndoe', // Duplicate username
        password: process.env.EMPLOYEE_PASSWORD,
        confirmPassword: 'Abc@1234',
        accountNumber: '0987654321',
        idNumber: '3210987654321'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toContainEqual({ field: 'username', message: 'Username already exists' });
  });

  it('should return an error for duplicate email', async () => {
    // First registration
    await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: process.env.EMPLOYEE_PASSWORD,
        confirmPassword: 'Abc@1234',
        accountNumber: '1234567890',
        idNumber: '1234567890123'
      });

    // Attempt to register with the same email
    const response = await request(app)
      .post('/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com', // Duplicate email
        username: 'janedoe',
        password: process.env.EMPLOYEE_PASSWORD,
        confirmPassword: 'Abc@1234',
        accountNumber: '0987654321',
        idNumber: '3210987654321'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toContainEqual({ field: 'email', message: 'Email already exists' });
  });
});

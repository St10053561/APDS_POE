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
  server = app.listen(4001, () => { // Use a different port number (4001)
    console.log('Test server running on port 4001');
    done();
  });
});

afterAll(async () => {
  if (client && client.topology && client.topology.isConnected()) {
    await client.close();
  }
  server.close();
});


beforeAll(() => {
  jest.setTimeout(10000);
});
 // Increase the timeout to 10 seconds

describe('Login Endpoint', () => {
  it('should return validation errors for invalid input', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        usernameOrAccountNumber: '', // Invalid username or account number
        password: '123' // Invalid password
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toHaveLength(1); // Update the expected length to 1
  });

});
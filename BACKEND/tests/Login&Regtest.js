import request from 'supertest';
import app from '../server.mjs'; // Adjust the path to your server.mjs

describe('User Registration and Login', () => {
  let token;

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'Password123',
        confirmPassword: 'Password123',
        accountNumber: '123456789',
        idNumber: '1234567890123'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should login the user', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({
        usernameOrAccountNumber: 'johndoe',
        password: 'Password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Authentication successful');
    token = response.body.token;
  });

  // Add more tests as needed
});
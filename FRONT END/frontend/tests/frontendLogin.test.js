import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../src/AuthContext'; // Import AuthContext from the correct path
import Login from '../src/components/login.js'; // Import Login component from the correct path

// Mock fetch to simulate API responses
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-token', username: 'testuser', accountNumber: '12345' }),
  })
);

// Test to check if the Login component renders correctly
test('renders Login component', () => {
    render(
        // Provide a mock AuthContext with a login function
        <AuthContext.Provider value={{ login: jest.fn() }}>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </AuthContext.Provider>
    );

    // Check if the username input is rendered
    expect(screen.getByLabelText(/username or account number/i)).toBeInTheDocument();

    // Check if the password input is rendered
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Check if the login button is rendered
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

// Test to check if the form submission works correctly
test('submits the form successfully', async () => {
    const mockLogin = jest.fn(); // Mock login function
    render(
        <AuthContext.Provider value={{ login: mockLogin }}>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </AuthContext.Provider>
    );

    // Simulate user input for username and password
    fireEvent.change(screen.getByLabelText(/username or account number/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i })); // Simulate form submission

    // Wait for the mockLogin function to be called with the correct arguments
    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('fake-token', 'testuser', '12345');
    });
});

// Test to check if error messages are displayed on failed login
test('displays error message on failed login', async () => {
    // Mock fetch to simulate a failed login attempt
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: () => Promise.resolve(JSON.stringify({ errors: [{ field: 'general', message: 'Login failed' }] })),
        })
    );

    render(
        <AuthContext.Provider value={{ login: jest.fn() }}>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </AuthContext.Provider>
    );

    // Simulate user input for username and password
    fireEvent.change(screen.getByLabelText(/username or account number/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i })); // Simulate form submission

    // Wait for the error message to be displayed
    await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
});
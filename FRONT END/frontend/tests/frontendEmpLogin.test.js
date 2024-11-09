import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../src/AuthContext'; // Adjust path if necessary
import EmployeeLogin from '../src/components/employeeLogin'; // Adjust path if necessary

// Mocking the AuthContext's login function and navigation
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('EmployeeLogin Component', () => {
    beforeEach(() => {
        render(
            <BrowserRouter>
                <AuthContext.Provider value={{ login: mockLogin }}>
                    <EmployeeLogin />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    });

    test('renders login form fields correctly', () => {
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('displays validation error if form is submitted without input', async () => {
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        
        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
        });
    });

    test('calls login function and navigates to home on successful login', async () => {
        // Mock fetch response for a successful login
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'test-token', username: 'testuser' }),
            })
        );

        // Simulate user input
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test-token', 'testuser');
            expect(mockNavigate).toHaveBeenCalledWith('/emp-Home');
        });

        // Cleanup fetch mock
        global.fetch.mockRestore();
    });
});

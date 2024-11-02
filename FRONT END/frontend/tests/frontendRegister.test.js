import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import Register from '../src/components/register'; // Adjust the path as necessary

// Mock fetch to simulate API responses
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
);

test('renders Register component', () => {
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    // Check if the form inputs are rendered
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Number')).toBeInTheDocument();
    expect(screen.getByLabelText('ID Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});

test('submits the form successfully', async () => {
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    // Simulate user input for the form fields
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Account Number'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('ID Number'), { target: { value: '87654321' } });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for the form to be reset and the navigation to occur
    await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toHaveValue('');
        expect(screen.getByLabelText('Last Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Username')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Confirm Password')).toHaveValue('');
        expect(screen.getByLabelText('Account Number')).toHaveValue('');
        expect(screen.getByLabelText('ID Number')).toHaveValue('');
    });
});

test('displays error messages on failed registration', async () => {
    // Mock fetch to simulate a failed registration attempt
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: () => Promise.resolve({ errors: [{ field: 'email', message: 'Email already exists' }] }),
        })
    );

    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    // Simulate user input for the form fields
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Account Number'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('ID Number'), { target: { value: '87654321' } });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for the error message to be displayed
    await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
});
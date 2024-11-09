import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import PaymentPortal from '../src/components/paymentPortal';
import { AuthContext } from '../src/AuthContext'; // Import the AuthContext

jest.mock('axios', () => ({
  post: jest.fn(),
}));
const axios = require('axios'); // Import axios

// Mock the AuthContext
const auth = {
  token: 'mock-token',
  username: 'mock-username',
};

test('renders PaymentPortal component', () => {
  render(
    <BrowserRouter>
      <AuthContext.Provider value={{ auth }}>
        <PaymentPortal />
      </AuthContext.Provider>
    </BrowserRouter>
  );

  // Check if the form inputs are rendered
  expect(screen.getByLabelText("Recipient's Name:")).toBeInTheDocument();
  expect(screen.getByLabelText("Recipient's Bank:")).toBeInTheDocument();
  expect(screen.getByLabelText("Recipient's Account No:")).toBeInTheDocument();
  expect(screen.getByLabelText("Currency:")).toBeInTheDocument();
  expect(screen.getByLabelText("Amount to Transfer:")).toBeInTheDocument();
  expect(screen.getByLabelText("SWIFT Code:")).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Pay Now/i })).toBeInTheDocument();
});

test('submits the form successfully', async () => {
  axios.post.mockImplementationOnce(() =>
    Promise.resolve({
      data: {
        success: true,
      },
    })
  );

  render(
    <BrowserRouter>
      <AuthContext.Provider value={{ auth }}>
        <PaymentPortal />
      </AuthContext.Provider>
    </BrowserRouter>
  );

  // Simulate user input for the form fields
  fireEvent.change(screen.getByLabelText("Recipient's Name:"), { target: { value: 'John Doe' } });
  fireEvent.change(screen.getByLabelText("Recipient's Bank:"), { target: { value: 'Bank of America' } });
  fireEvent.change(screen.getByLabelText("Recipient's Account No:"), { target: { value: '1234567890' } });
  fireEvent.change(screen.getByLabelText("Amount to Transfer:"), { target: { value: '100.00' } });
  fireEvent.change(screen.getByLabelText("SWIFT Code:"), { target: { value: 'BOFAUS3N' } });

  // Simulate form submission
  fireEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

  // Wait for the approval message to be displayed
  await waitFor(() => {
    expect(screen.getByText('Your payment will be processed once it has been approved by an employee.')).toBeInTheDocument();
  });
});

test('displays error messages on failed payment', async () => {
  axios.post.mockImplementationOnce(() =>
    Promise.reject({
      response: {
        data: {
          error: 'Failed to make payment',
          fieldErrors: {
            amount: 'Amount must be a positive number',
          },
        },
      },
    })
  );

  render(
    <BrowserRouter>
      <AuthContext.Provider value={{ auth }}>
        <PaymentPortal />
      </AuthContext.Provider>
    </BrowserRouter>
  );

  // Simulate user input for the form fields
  fireEvent.change(screen.getByLabelText("Recipient's Name:"), { target: { value: 'John Doe' } });
  fireEvent.change(screen.getByLabelText("Recipient's Bank:"), { target: { value: 'Bank of America' } });
  fireEvent.change(screen.getByLabelText("Recipient's Account No:"), { target: { value: '1234567890' } });
  fireEvent.change(screen.getByLabelText("Amount to Transfer:"), { target: { value: '-100.00' } });
  fireEvent.change(screen.getByLabelText("SWIFT Code:"), { target: { value: 'BOFAUS3N' } });

  // Simulate form submission
  fireEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

  // Wait for the error message to be displayed
  await waitFor(() => {
    expect(screen.getByText(/Amount must be a positive number/)).toBeInTheDocument();
  });

  // Check if the error message is displayed
  expect(screen.queryByText('Failed to make payment')).not.toBeInTheDocument();
});
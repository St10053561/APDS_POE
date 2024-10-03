import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext
import axios from 'axios';
import './PaymentPortal.css'; // payment portal styling

const currencySymbols = {
    ZAR: 'R',
    USD: '$',
    GBP: '£',
    INR: '₹',
    JPY: '¥'
    // Add more currencies as needed
};

const PaymentPortal = () => {
    const { auth } = useContext(AuthContext); // Use the context
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientBank: '',
        recipientAccountNo: '',
        amount: '',
        swiftCode: '',
        username: auth.username, // Automatically add the logged-in username
        date: new Date().toISOString().split('T')[0], // Automatically add the current date
        currency: 'ZAR' // Default currency to South African Rand
    });
    const [successMessage, setSuccessMessage] = useState(''); // State for success message
    const [errorMessage, setErrorMessage] = useState(''); // State for form-wide error message

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCurrencyChange = (e) => {
        setFormData({ ...formData, currency: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://localhost:3001/payment', { // Ensure the URL is correct
                ...formData,
                currencySymbol: currencySymbols[formData.currency] // Include the selected currency symbol in the request
            }, {
                headers: {
                    'Authorization': `Bearer ${auth.token}` // Include the token in the headers
                }
            });
            // Update the success message state
            setSuccessMessage('Payment has been made successfully!');
            setErrorMessage(''); // Clear any previous error messages
            // Clear the form data
            setFormData({
                recipientName: '',
                recipientBank: '',
                recipientAccountNo: '',
                amount: '',
                swiftCode: '',
                username: auth.username,
                date: new Date().toISOString().split('T')[0], // Reset the date to the current date
                currency: 'ZAR' // Reset the currency to default
            });
        } catch (error) {
            console.error('Error making payment:', error); // Log error
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message); // Set a global error message
            } else {
                setErrorMessage('An error occurred while making the payment'); // Generic error message
            }
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <h3>Payment Portal</h3>
                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                        <label>Recipient's Name:</label>
                        <input 
                            type="text" 
                            name="recipientName" 
                            value={formData.recipientName} 
                            onChange={handleChange} 
                            placeholder="Recipient's Name"
                            required />
                    </div>
                    <div className="form-group">
                        <label>Recipient's Bank:</label>
                        <input 
                            type="text" 
                            name="recipientBank" 
                            value={formData.recipientBank} 
                            onChange={handleChange} 
                            placeholder="Recipient's Bank"
                            required />
                    </div>
                    <div className="form-group">
                        <label>Recipient's Account No:</label>
                        <input 
                            type="text" 
                            name="recipientAccountNo" 
                            value={formData.recipientAccountNo} 
                            onChange={handleChange} 
                            placeholder="Recipient's Account No"
                            required />
                    </div>
                    <div className="form-group">
                        <label>Currency:</label>
                        <select 
                            name="currency" 
                            value={formData.currency} 
                            onChange={handleCurrencyChange}
                            required>
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="USD">USD - Dollar</option>
                            <option value="GBP">GBP - Pound</option>
                            <option value="INR">INR - Rupees</option>
                            <option value="JPY">JPY - Yen</option>
                            {/* Add more currencies as needed */}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount to Transfer:</label>
                        <input 
                            type="number" 
                            name="amount" 
                            value={formData.amount} 
                            onChange={handleChange} 
                            placeholder={`Amount (${currencySymbols[formData.currency]})`}
                            required />
                    </div>
                    <div className="form-group">
                        <label>SWIFT Code:</label>
                        <input 
                            type="text" 
                            name="swiftCode" 
                            value={formData.swiftCode} 
                            onChange={handleChange} 
                            placeholder="SWIFT Code"
                            required />
                    </div>
                    {/* Hidden input field for the username */}
                    <input type="hidden" name="username" value={formData.username} />
                    {/* Hidden input field for the date */}
                    <input type="hidden" name="date" value={formData.date} />
                    <button type="submit">Pay Now</button>
                    <button 
                        type="button" 
                        onClick={() => setFormData({ 
                            recipientName: '', 
                            recipientBank: '', 
                            recipientAccountNo: '', 
                            amount: '', 
                            swiftCode: '', 
                            username: auth.username, 
                            date: new Date().toISOString().split('T')[0],
                            currency: 'ZAR' // Reset the currency to default
                        })}>Cancel</button>
                </form>
                {/* Display the success message if it exists */}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                {/* Display the error message if it exists */}
                {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default PaymentPortal;
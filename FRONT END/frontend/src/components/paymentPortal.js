import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext
import axios from 'axios';

const PaymentPortal = () => {
    const { auth } = useContext(AuthContext); // Use the context
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientBank: '',
        recipientAccountNo: '',
        amount: '',
        swiftCode: '',
        username: auth.username, // Automatically add the logged-in username
        date: new Date().toISOString().split('T')[0] // Automatically add the current date
    });
    const [successMessage, setSuccessMessage] = useState(''); // State for success message

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://localhost:3001/payment', { // Ensure the URL is correct
                ...formData
            }, {
                headers: {
                    'Authorization': `Bearer ${auth.token}` // Include the token in the headers
                }
            });
            // Update the success message state
            setSuccessMessage('Payment has been made successfully!');
            // Clear the form data
            setFormData({
                recipientName: '',
                recipientBank: '',
                recipientAccountNo: '',
                amount: '',
                swiftCode: '',
                username: auth.username,
                date: new Date().toISOString().split('T')[0] // Reset the date to the current date
            });
        } catch (error) {
            console.error('Error making payment:', error); // Log error
            // Handle error (e.g., show an error message)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Recipient's Name:</label>
                    <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} required />
                </div>
                <div>
                    <label>Recipient's Bank:</label>
                    <input type="text" name="recipientBank" value={formData.recipientBank} onChange={handleChange} required />
                </div>
                <div>
                    <label>Recipient's Account No:</label>
                    <input type="text" name="recipientAccountNo" value={formData.recipientAccountNo} onChange={handleChange} required />
                </div>
                <div>
                    <label>Amount to Transfer:</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                </div>
                <div>
                    <label>SWIFT Code:</label>
                    <input type="text" name="swiftCode" value={formData.swiftCode} onChange={handleChange} required />
                </div>
                {/* Hidden input field for the username */}
                <input type="hidden" name="username" value={formData.username} />
                {/* Hidden input field for the date */}
                <input type="hidden" name="date" value={formData.date} />
                <button type="submit">Pay Now</button>
                <button type="button" onClick={() => setFormData({ recipientName: '', recipientBank: '', recipientAccountNo: '', amount: '', swiftCode: '', username: auth.username, date: new Date().toISOString().split('T')[0] })}>Cancel</button>
            </form>
            {/* Display the success message if it exists */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
        </div>
    );
};

export default PaymentPortal;
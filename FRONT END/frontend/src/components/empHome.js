import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EmpHome() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingPayments, setPendingPayments] = useState([]);

    useEffect(() => {
        if (!auth.token) {
            navigate('/'); // Redirect to home if not logged in
        } else {
            fetchPendingPayments();
        }
    }, [auth.token, navigate]);

    const fetchPendingPayments = async () => {
        try {
            const response = await axios.get('https://localhost:3001/payment/pending', {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setPendingPayments(response.data);
        } catch (error) {
            console.error("Error fetching pending payments:", error);
        }
    };

    const updatePaymentStatus = async (id, status) => {
        try {
            await axios.put(`https://localhost:3001/payment/${id}/status`, { status }, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            fetchPendingPayments(); // Refresh the list after updating
        } catch (error) {
            console.error("Error updating payment status:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={{ ...styles.greeting, color: 'black' }}>Hello, {auth.username}!</h1>
            <p style={{ ...styles.date, color: 'black' }}>Today is {new Date().toLocaleDateString()}</p>
            <h2 style={{ color: 'black' }}>Pending Payments</h2>
            <ul>
                {pendingPayments.map(payment => (
                    <li key={payment._id} style={{ color: 'black' }}>
                        <p1>Recipient: {payment.recipientName}</p1>
                        <p1>Amount: {payment.amount} {payment.currency}</p1>
                        <p1>Date: {payment.date}</p1>
                        <button onClick={() => updatePaymentStatus(payment._id, 'approved')}>Approve</button>
                        <button onClick={() => updatePaymentStatus(payment._id, 'disapproved')}>Disapprove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
    },
    greeting: {
        fontSize: '2rem',
        color: '#333'
    },
    date: {
        fontSize: '1.2rem',
        color: '#666'
    }
};
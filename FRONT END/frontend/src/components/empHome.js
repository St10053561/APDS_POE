import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmpHome.css'; // Import the CSS file
import './Login.css';

export default function EmpHome() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingPayments, setPendingPayments] = useState([]);

    const fetchPendingPayments = useCallback(async () => {
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
    }, [auth.token]);

    useEffect(() => {
        if (!auth.token) {
            navigate('/'); // Redirect to home if not logged in
        } else {
            fetchPendingPayments();
        }
    }, [auth.token, navigate, fetchPendingPayments]);

    const updatePaymentStatus = async (id, status) => {
        try {
            // Update the payment status
            await axios.put(`https://localhost:3001/payment/${id}/status`, { status }, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });

            // Log the transaction history
            const payment = pendingPayments.find(payment => payment._id === id);
            if (payment) {
                await axios.post('https://localhost:3001/payment/history', {
                    recipientName: payment.recipientName,
                    amount: payment.amount,
                    currency: payment.currency,
                    status : status,
                    date: new Date().toISOString(),
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
            }

            fetchPendingPayments(); // Refresh the list after updating
        } catch (error) {
            console.error("Error updating payment status:", error);
        }
    };

    return (
        <div className="login-container">
        <div className="outer-container2">
            <h1 className="greeting">Hello, {auth.username}!</h1>
            <p className="date">Today is {new Date().toLocaleDateString()}</p>
            <h2 className="heading">Pending Payments</h2>
            <div className="list">
                {pendingPayments.map(payment => (
                    <div key={payment._id} className="card">
                        <p className="text"><strong>Recipient:</strong> {payment.recipientName}</p>
                        <p className="text"><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
                        <p className="text"><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
                        <div className="buttonContainer">
                            <button className="approveButton" onClick={() => updatePaymentStatus(payment._id, 'approved')}>Approve</button>
                            <button className="disapproveButton" onClick={() => updatePaymentStatus(payment._id, 'disapproved')}>Disapprove</button>
                        </div>
                    </div>
                ))}
            </div>
            <button className="historyButton" onClick={() => navigate('/transaction-history')}>View Transaction History</button>
        </div>
        </div>
    );
}

   // Adding keyframe animation for background shift
   const styleSheet = document.styleSheets[0];
   styleSheet.insertRule(`
       @keyframes backgroundShift {
           0% { background: linear-gradient(135deg, #f8f9fa, #e9ecef); }
           100% { background: linear-gradient(135deg, #e9ecef, #d6d8db); }
       }
   `, styleSheet.cssRules.length);
   
   
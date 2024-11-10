import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TransactionHistory.css';

export default function TransactionHistory() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = useCallback(async () => {
        try {
            const response = await axios.get('https://localhost:3001/payment/history', {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transaction history:", error);
        }
    }, [auth.token]);

    useEffect(() => {
        if (!auth.token) {
            navigate('/'); // Redirect to home page if not authenticated
        } else {
            fetchTransactions();
        }
    }, [auth.token, fetchTransactions, navigate]);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    return (
        <div className="container">
            <h2>Transaction History</h2>
            <ul className="transaction-list">
                {transactions.map(transaction => (
                    <li key={transaction._id} className="transaction-card">
                        <p><strong>Recipient:</strong> {transaction.recipientName}</p>
                        <p className="amount"><strong>Amount:</strong> {transaction.amount} {transaction.currency}</p>
                        <p><strong>Date:</strong> {formatDate(transaction.date)}</p>
                        <p className="status"><strong>Status:</strong> {transaction.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
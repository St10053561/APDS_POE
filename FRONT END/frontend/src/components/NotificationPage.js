import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import axios from 'axios';
import './NotificationPage.css';

const NotificationPage = () => {
  const { auth } = useContext(AuthContext);
  const [approvedPayments, setApprovedPayments] = useState([]);

  const fetchApprovedPayments = useCallback(async () => {
    try {
      const response = await axios.get('https://localhost:3001/payment/approved', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          username: auth.username,
        },
      });
      setApprovedPayments(response.data);
    } catch (error) {
      console.error("Error fetching approved payments:", error);
    }
  }, [auth.token, auth.username]);

  useEffect(() => {
    if (auth.token) {
      fetchApprovedPayments();
    }
  }, [auth.token, fetchApprovedPayments]);

  return (
    <div className="notification-page">
      <h1>Approved Transactions</h1>
      <ul>
        {approvedPayments.map(payment => (
          <li key={payment._id}>
            <p>Recipient: {payment.recipientName}</p>
            <p>Amount: {payment.amount} {payment.currency}</p>
            <p>Date: {payment.date}</p>
            <p>Status: {payment.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPage;
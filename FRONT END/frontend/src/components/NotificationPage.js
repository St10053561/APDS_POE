import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationPage.css';

const NotificationPage = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [readNotifications, setReadNotifications] = useState(new Set(JSON.parse(localStorage.getItem('readNotifications')) || []));

  const fetchPayments = useCallback(async () => {
    try {
      const response = await axios.get('https://localhost:3001/payment/status', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          username: auth.username,
        },
      });

      if (response.status === 200) {
        setPayments(response.data);
      } else {
        console.error("Error: Received non-200 response", response.status);
      }
    } catch (error) {
      console.error("Error fetching payments:", error.message);
    }
  }, [auth.token, auth.username]);

  const markAsRead = (id) => {
    setReadNotifications((prev) => {
      const updated = new Set(prev).add(id);
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(updated))); // Save to local storage
      return updated;
    });
  };

  useEffect(() => {
    if (!auth.token) {
      navigate('/'); // Redirect to home page if not authenticated
    } else {
      fetchPayments();
    }
  }, [auth.token, fetchPayments, navigate]);

  return (
    <div className="container">
      <h2>Notifications History</h2>
      <ul className="notification-list">
        {payments.map(payment => (
          <li key={payment._id} className={`notification-card ${readNotifications.has(payment._id) ? 'read' : 'unread'}`}>
            <p><strong>Recipient:</strong> {payment.recipientName}</p>
            <p className="amount"><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
            <p><strong>Date:</strong> {payment.date}</p>
            <p className="status"><strong>Status:</strong> {payment.status}</p>
            <button onClick={() => markAsRead(payment._id)}>Mark as Read</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPage;
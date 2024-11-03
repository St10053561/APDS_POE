import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationPage.css';
import notificationSound from './notification-sound.mp3'; // Import the sound file

const NotificationPage = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound); // Use the imported sound file
    audio.play();
  };

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
      
      // Check if there are new payments and play sound
      if (response.data.length > 0) {
        setPayments(response.data);
        playNotificationSound(); // Play sound when new payments are fetched
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  }, [auth.token, auth.username]);

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
          <li key={payment._id} className="notification-card">
            <p><strong>Recipient:</strong> {payment.recipientName}</p>
            <p className="amount"><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
            <p><strong>Date:</strong> {payment.date}</p>
            <p className="status"><strong>Status:</strong> {payment.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPage;
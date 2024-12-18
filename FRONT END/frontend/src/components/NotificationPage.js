import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationPage.css';

const NotificationPage = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(new Set(JSON.parse(localStorage.getItem('readNotifications')) || []));

  // Fetch the notifications for the user
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`https://localhost:3001/notifications/${auth.username}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          username: auth.username,
        },
      });

      if (response.status === 200) {
        setNotifications(response.data);
      } else {
        console.error("Error: Received non-200 response", response.status);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  }, [auth.token, auth.username]);

  // Mark a notification as read
  const markAsRead = (id) => {
    setReadNotifications((prev) => {
      const updated = new Set(prev).add(id);
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  useEffect(() => {
    if (!auth.token) {
      navigate('/'); // Redirect to home page if not authenticated
    } else {
      fetchNotifications();
    }
  }, [auth.token, fetchNotifications, navigate]);

  // Helper function to format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options).replace(/(\d{2})\/(\w{3})\/(\d{4})/, '$3 - $2 - $1').toUpperCase();
  };

  return (
    <div className="container">
      <h2>Notifications History</h2>
      <ul className="notification-list">
        {notifications.map(notification => (
          <li key={notification._id} className={`notification-card ${readNotifications.has(notification._id) ? 'read' : 'unread'}`}>
            <p className={`fade-up`}><strong>Message:</strong> {notification.message}</p>
            <p className={`fade-up`}><strong>Date:</strong> {formatDate(notification.date)}</p>
            {!readNotifications.has(notification._id) && (
              <button className={`fade-up`} onClick={() => markAsRead(notification._id)}>Mark as Read</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationPage;
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { NavLink, useNavigate } from 'react-router-dom';
import './Home.css';
import loginSound from './notification-sound.mp3';
import axios from 'axios';

const Home = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0); // Track unread notifications count
    const [notifications, setNotifications] = useState([]); // Store the notifications

    // Function to play notification sound
    const playNotificationSound = () => {
        const audio = new Audio(loginSound);
        audio.play();
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get(`https://localhost:3001/notifications/${auth.username}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            if (response.status === 200) {
                const readNotifications = new Set(JSON.parse(localStorage.getItem('readNotifications')) || []);
                const newNotifications = response.data.filter(notification => !readNotifications.has(notification._id));

                setUnreadCount(newNotifications.length); // Update count
                setNotifications(newNotifications); // Store notifications to display
                if (newNotifications.length > 0) playNotificationSound(); // Play sound if there are new notifications
            } else {
                console.error("Error: Received non-200 response", response.status);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error.message);
        }
    }, [auth.token, auth.username]);

    useEffect(() => {
        if (!auth.token) {
            navigate('/'); // Redirect to home if not logged in
        } else {
            fetchNotifications(); // Fetch notifications only once on load
        }
    }, [auth.token, navigate, fetchNotifications]); // This will run once when the component mounts

    if (!auth.token) {
        return (
            <div className="dashboard-container">
                <h1>Welcome to <span className="highlight">TransactIO</span></h1>
                <p>Please log in to access your account and make payments.</p>
            </div>
        );
    }

    const banks = ["ABSA", "NEDBANK", "FNB", "CAPITEC", "STANDARD BANK"];
    const randomBank = banks[Math.floor(Math.random() * banks.length)];

    const maskAccountNumber = (accountNumber) => {
        return accountNumber.slice(0, -3).replace(/./g, 'x') + accountNumber.slice(-3);
    };

    const bankingDetails = {
        accountNumber: maskAccountNumber(auth.accountNumber || "123456789"),
        bankName: randomBank,
        balance: "R100,000"
    };

    return (
        <div className="dashboard-container">
            <h1>Welcome to TransactIO</h1>
            <p>Hello, {auth.username}</p>
            <div className="dashboard">
                <h2>Banking Details</h2>
                <p>Account Number: {bankingDetails.accountNumber}</p>
                <p>Bank Name: {bankingDetails.bankName}</p>
                <p>Balance: {bankingDetails.balance}</p>
                <NavLink to="/paymentCreate">
                    <button>Make International Payment</button>
                </NavLink>
            </div>
            <div className="notifications">
                <h2>Notifications</h2>
                <p>Unread Notifications: {unreadCount}</p>
                <ul>
                    {notifications.map((notification) => (
                        <li key={notification._id}>{notification.message}</li> // Display notification messages
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Home;
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

    // Function to play notification sound
    const playNotificationSound = () => {
        const audio = new Audio(loginSound);
        audio.play();
    };

    const fetchNotifications = useCallback(async () => {
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
                const readNotifications = new Set(JSON.parse(localStorage.getItem('readNotifications')) || []);

                const newNotifications = response.data.filter(notification =>
                    !readNotifications.has(notification._id) // Check if the notification is unread
                );

                // Update unread notifications count
                setUnreadCount(newNotifications.length);

                if (newNotifications.length > 0) {
                    playNotificationSound(); // Play sound only for new, unread notifications
                }
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
            const intervalId = setInterval(fetchNotifications, 3000);
            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [auth.token, navigate, fetchNotifications]);

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
                <p1>Account Number: {bankingDetails.accountNumber}</p1>
                <p1>Bank Name: {bankingDetails.bankName}</p1>
                <p1>Balance: {bankingDetails.balance}</p1>
                <NavLink to="/paymentCreate">
                    <button>Make International Payment</button>
                </NavLink>
            </div>
            <div className="notifications">
                <h2>Notifications</h2>
                <p>Unread Notifications: {unreadCount}</p> {/* Display only the count */}
            </div>
        </div>
    );
};

export default Home;
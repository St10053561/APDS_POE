import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../AuthContext.js';
import { NavLink, useNavigate } from 'react-router-dom';
import './Home.css';
import loginSound from './notification-sound.mp3'; // Import the sound file
import axios from 'axios';

const Home = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    // Function to play notification sound
    const playNotificationSound = () => {
        const audio = new Audio(loginSound); // Use the imported sound file
        audio.play();
    };

    // Function to fetch notifications
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

            // Check if there are new notifications
            if (response.data.length > notifications.length) {
                playNotificationSound(); // Play sound when new notifications are fetched
                setNotifications(response.data); // Update notifications state
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, [auth.token, auth.username, notifications.length]);

    useEffect(() => {
        if (!auth.token) {
            navigate('/'); // Redirect to home if not logged in
        } else {
            // Fetch notifications every 5 seconds
            const intervalId = setInterval(fetchNotifications, 5000);
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
        accountNumber: maskAccountNumber(auth.accountNumber || "123456789"), // Use the account number from auth
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
        </div>
    );
};

export default Home;
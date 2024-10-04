import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext.js';
import { NavLink } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const { auth } = useContext(AuthContext);

    if (!auth.token) {
        return (
            <div className="dashboard-container">
                <h1>Welcome to TransactIO</h1>
                <p>Please log in to access your account and make payments.</p>
                
            </div>
        );
    }

    const banks = ["ABSA", "NEDBANK", "FNB", "CAPITEC", "STANDARD BANK"];
    const randomBank = banks[Math.floor(Math.random() * banks.length)];

    const bankingDetails = {
        accountNumber: "123456789",
        bankName: randomBank,
        balance: "R10,000"
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

export default Home;
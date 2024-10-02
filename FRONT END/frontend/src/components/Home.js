import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext.js';
import { NavLink } from 'react-router-dom';
const Home = () => {
    const { auth } = useContext(AuthContext);

    if (!auth.token) {
        return (
            <div className="container">
                <h1>Welcome to the Payment Portal</h1>
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
        <div className="container">
            <h1>Welcome to the Payment Portal</h1>
            <p>Hello, {auth.username}</p>
            <div className="dashboard">
                <NavLink to="/paymentCreate">
                    <button>Make International Payment</button>
                </NavLink>
                <h2>Banking Details</h2>
                <p>Account Number: {bankingDetails.accountNumber}</p>
                <p>Bank Name: {bankingDetails.bankName}</p>
                <p>Balance: {bankingDetails.balance}</p>
            </div>
        </div>
    );
};

export default Home;
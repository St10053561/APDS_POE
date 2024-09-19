import React from 'react';

const Home = () => {
    const username = "John Doe"; // Placeholder for customer username
    const bankingDetails = {
        accountNumber: "123456789",
        bankName: "ABC Bank",
        balance: "$10,000"
    };
    const paymentReceipts = [
        { id: 1, date: "2023-01-01", amount: "$100", type: "Local" },
        { id: 2, date: "2023-01-15", amount: "$200", type: "International" }
    ];

    return (
        <div className="container">
            <h1>Welcome to the Payment Portal</h1>
            <p>Hello, {username}</p>
            <div className="dashboard">
                <button>Make Local Payment</button>
                <button>Make International Payment</button>
                <h2>Banking Details</h2>
                <p>Account Number: {bankingDetails.accountNumber}</p>
                <p>Bank Name: {bankingDetails.bankName}</p>
                <p>Balance: {bankingDetails.balance}</p>
                <h2>Payment Receipts</h2>
                <ul>
                    {paymentReceipts.map(receipt => (
                        <li key={receipt.id}>
                            {receipt.date} - {receipt.amount} ({receipt.type})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Home;
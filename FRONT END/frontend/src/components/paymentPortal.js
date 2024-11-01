import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentPortal.css";

const currencySymbols = {
  ZAR: "R",
  USD: "$",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

const PaymentPortal = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientBank: "",
    recipientAccountNo: "",
    amount: "",
    swiftCode: "",
    username: auth.username,
    date: new Date().toISOString().split("T")[0],
    currency: "ZAR",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for general error message
  const [fieldErrors, setFieldErrors] = useState({}); // State for field-specific errors
  const [approvalMessage, setApprovalMessage] = useState(""); // State for approval notification
  const [paymentStatus, setPaymentStatus] = useState(""); // State for payment status

  useEffect(() => {
    if (!auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" }); // Clear field error on change
  };

  const handleCurrencyChange = (e) => {
    setFormData({ ...formData, currency: e.target.value });
    setFieldErrors({ ...fieldErrors, currency: "" }); // Clear field error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      setFieldErrors({ ...fieldErrors, amount: "Amount must be a positive number." });
      return;
    }
    try {
      const response = await axios.post(
        "https://localhost:3001/payment",
        {
          ...formData,
          currencySymbol: currencySymbols[formData.currency],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setSuccessMessage("Payment has been made successfully!");
      setApprovalMessage("Your payment will be processed once approved by an employee."); // Set approval message
      setErrorMessage(""); // Clear any previous error message
      setFieldErrors({}); // Clear field errors
      setFormData({
        recipientName: "",
        recipientBank: "",
        recipientAccountNo: "",
        amount: "",
        swiftCode: "",
        username: auth.username,
        date: new Date().toISOString().split("T")[0],
        currency: "ZAR",
      });
      setPaymentStatus(response.data.status); // Set payment status
    } catch (error) {
      console.error("Error making payment:", error);
      setSuccessMessage("");
      setApprovalMessage(""); // Clear approval message on error
      setErrorMessage(error.response?.data?.error || "Failed to make payment");
      if (error.response?.data?.fieldErrors) {
        setFieldErrors(error.response.data.fieldErrors);
      }
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h3>Payment Portal</h3>
        <form onSubmit={handleSubmit} className="payment-form">
          {/* Form fields */}
          <div className="form-group">
            <label htmlFor="recipientName">Recipient's Name:</label>
            <input
              type="text"
              id="recipientName"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              placeholder="Recipient's Name"
              required
            />
            {fieldErrors.recipientName && <div className="error-message">{fieldErrors.recipientName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="recipientBank">Recipient's Bank:</label>
            <input
              type="text"
              id="recipientBank"
              name="recipientBank"
              value={formData.recipientBank}
              onChange={handleChange}
              placeholder="Recipient's Bank"
              required
            />
            {fieldErrors.recipientBank && <div className="error-message">{fieldErrors.recipientBank}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="recipientAccountNo">Recipient's Account No:</label>
            <input
              type="text"
              id="recipientAccountNo"
              name="recipientAccountNo"
              value={formData.recipientAccountNo}
              onChange={handleChange}
              placeholder="Recipient's Account No"
              required
            />
            {fieldErrors.recipientAccountNo && <div className="error-message">{fieldErrors.recipientAccountNo}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency:</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleCurrencyChange}
              required
            >
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="USD">USD - Dollar</option>
              <option value="GBP">GBP - Pound</option>
              <option value="INR">INR - Rupees</option>
              <option value="JPY">JPY - Yen</option>
              {/* Add more currencies as needed */}
            </select>
            {fieldErrors.currency && <div className="error-message">{fieldErrors.currency}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount to Transfer:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder={`Amount (${currencySymbols[formData.currency]})`}
              required
              min="0.01" // Ensure the amount is positive
              step="0.01" // Allow decimal values
            />
            {fieldErrors.amount && <div className="error-message">{fieldErrors.amount}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="swiftCode">SWIFT Code:</label>
            <input
              type="text"
              id="swiftCode"
              name="swiftCode"
              value={formData.swiftCode}
              onChange={handleChange}
              placeholder="SWIFT Code"
              required
            />
            {fieldErrors.swiftCode && <div className="error-message">{fieldErrors.swiftCode}</div>}
          </div>
          <input type="hidden" name="username" value={formData.username} />
          <input type="hidden" name="date" value={formData.date} />
          <button type="submit">Pay Now</button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                recipientName: "",
                recipientBank: "",
                recipientAccountNo: "",
                amount: "",
                swiftCode: "",
                username: auth.username,
                date: new Date().toISOString().split("T")[0],
                currency: "ZAR",
              })
            }
          >
            Cancel
          </button>
        </form>
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}
        {approvalMessage && (
          <div className="alert alert-info">{approvalMessage}</div>
        )}
        {paymentStatus && (
          <div className={`alert alert-${paymentStatus === 'approved' ? 'success' : 'warning'}`}>
            Your payment status: {paymentStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPortal;
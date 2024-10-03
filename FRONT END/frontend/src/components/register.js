import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Register component
export default function Register() {
  // State to manage form data
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    accountNumber: "",
    idNumber: "",
  });

  // Hook to navigate programmatically
  const navigate = useNavigate();

  // Function to update form state
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const newUser = { ...form };

    try {
      const response = await fetch("https://localhost:3001/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log("Registration successful:", data);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        accountNumber: "",
        idNumber: "",
      });

      navigate("/login");
    } catch (error) {
      window.alert(error.message);
      console.error("Error during registration:", error);
    }
  }

  // JSX to render the form
  return (
    <div className="container">
      <h3>Register</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={form.firstName}
            onChange={(e) => updateForm({ firstName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={form.lastName}
            onChange={(e) => updateForm({ lastName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={form.username}
            onChange={(e) => updateForm({ username: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={form.password}
            onChange={(e) => updateForm({ password: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => updateForm({ confirmPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number</label>
          <input
            type="text"
            className="form-control"
            id="accountNumber"
            value={form.accountNumber}
            onChange={(e) => updateForm({ accountNumber: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="idNumber">ID Number</label>
          <input
            type="text"
            className="form-control"
            id="idNumber"
            value={form.idNumber}
            onChange={(e) => updateForm({ idNumber: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input type="submit" value="Register" className="btn btn-primary" />
        </div>
      </form>
    </div>
  );
}

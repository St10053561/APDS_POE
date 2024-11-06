import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext
import './Employee.css'; // Import login styling

export default function EmployeeLogin() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    function updateForm(value) {
        setErrors({});
        return setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        try {
            const response = await fetch('https://localhost:3001/emp/emplogin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const text = await response.text();
                let errorData = {};

                // Check if the response is JSON
                try {
                    errorData = text ? JSON.parse(text) : {};
                } catch (jsonError) {
                    console.error("Failed to parse error response:", jsonError);
                    errorData = { errors: [{ field: 'general', message: 'Login failed. Please try again.' }] };
                }

                // Throw an error with the parsed error data or a general message
                throw new Error(JSON.stringify(errorData.errors || [{ field: 'general', message: 'Login failed' }]));
            }

            const data = await response.json();
            login(data.token, data.username);
            navigate('/emp-Home'); // Redirect to your desired route
        } catch (error) {
            let errorMessages = {};

            // Attempt to parse the error message
            try {
                errorMessages = JSON.parse(error.message).reduce((acc, err) => {
                    acc[err.field] = err.message;
                    return acc;
                }, {});
            } catch (parseError) {
                console.error("Failed to parse error message:", parseError);
                errorMessages.general = 'An unexpected error occurred. Please try again.';
            }

            setErrors(errorMessages);
            console.error('Error during employee login:', error);
        }
    }

    return (
        <div className="simple-login-container">
            <form onSubmit={onSubmit} className="simple-login-form">
                <h2>Employee Login</h2>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => updateForm({ username: e.target.value })}
                    required
                />
                {errors.username && <div className="error-message">{errors.username}</div>} {/* Display username error */}

                <input
                    type="password"
                    className="input-field"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => updateForm({ password: e.target.value })}
                    required />
                {errors.password && <div className="error-message">{errors.password}</div>} {/* Display password error */}

                {errors.general && <div className="error-message">{errors.general}</div>} {/* Display general error */}
                
                <button type="submit" className="login-button">Login</button>
                <div className="form-group">
                    <a href="/employee-forgot-password">Forgot Password?</a>
                </div>
            </form>
        </div>
    );
}
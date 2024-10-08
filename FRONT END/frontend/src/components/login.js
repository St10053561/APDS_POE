import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext
import './Login.css'; // Import login styling

export default function Login() {
    // State to manage form inputs
    const [form, setForm] = useState({
        usernameOrAccountNumber: '',
        password: ''
    });

    // State to manage error messages
    const [errors, setErrors] = useState({});
    // Use the login function from AuthContext
    const { login } = useContext(AuthContext);
    // Hook to navigate programmatically
    const navigate = useNavigate();

    // Function to update form state and clear errors
    function updateForm(value) {
        setErrors({}); // Clear errors when updating form
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    // Function to handle form submission
    async function onSubmit(e) {
        e.preventDefault(); // Prevent default form submission

        try {
            // Make a POST request to the login endpoint
            const response = await fetch('https://localhost:3001/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form) // Send form data as JSON
            });

            // Handle non-OK responses
            if (!response.ok) {
                let errorData;
                try {
                    const text = await response.text();
                    errorData = text ? JSON.parse(text) : {};
                } catch (jsonError) {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
                }
                throw new Error(JSON.stringify(errorData.errors || [{ field: 'general', message: 'Login failed' }]));
            }

            // Parse the response data
            const data = await response.json();
            console.log('Login successful:', data);

            // Set the authentication state with token, username, and account number
            login(data.token, data.username, data.accountNumber);
            // Navigate to the home page
            navigate('/');
        } catch (error) {
            // Parse error messages and set them in the errors state
            const errorMessages = JSON.parse(error.message).reduce((acc, err) => {
                acc[err.field] = err.message;
                return acc;
            }, {});
            setErrors(errorMessages);
            console.error('Error during login:', error);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h3>Welcome Back!</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor='usernameOrAccountNumber'>Username or Account Number</label>
                        <input
                            type="text"
                            className='form-control'
                            id="usernameOrAccountNumber"
                            value={form.usernameOrAccountNumber}
                            onChange={(e) => updateForm({ usernameOrAccountNumber: e.target.value })}
                            placeholder="Username/Account Number" 
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='password'
                            value={form.password}
                            onChange={(e) => updateForm({ password: e.target.value })}
                            placeholder="Password" 
                            required
                        />
                    </div>
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    <div className='form-group'>
                        <input
                            type='submit'
                            value='Login'
                            className='btn btn-primary'
                        />
                    </div>
                </form>
                <div className="form-group">
                    <a href="/forgot-password">Forgot Password?</a>
                </div>
            </div>
        </div>
    );
}
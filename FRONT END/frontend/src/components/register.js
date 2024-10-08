import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // styling for register

// Register component
export default function Register() {
    // State to manage form data
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        accountNumber: '',
        idNumber: ''
    });

    // State to manage error messages
    const [errors, setErrors] = useState({});

    // Hook to navigate programmatically
    const navigate = useNavigate();

    // Function to update form state
    function updateForm(value) {
        setErrors({}); // Clear errors when updating form
        setForm(prev => ({ ...prev, ...value }));
    }

    // Function to handle form submission
    async function onSubmit(e) {
        e.preventDefault();

        // Create a new user object
        const newUser = { ...form };

        try {
            const response = await fetch('https://localhost:3001/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData.errors));
            }

            // Reset the form state
            setForm({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
                accountNumber: '',
                idNumber: ''
            });

            // Navigate to the login page
            navigate('/login');
        } catch (error) {
            let errorMessage;
            try {
                errorMessage = JSON.parse(error.message);
            } catch (e) {
                errorMessage = error.message;
            }
            if (Array.isArray(errorMessage)) {
                const errorObj = {};
                errorMessage.forEach(err => {
                    errorObj[err.field] = err.message;
                });
                setErrors(errorObj);
            } else {
                setErrors({ general: errorMessage });
            }
            console.error('Error during registration:', error);
        }
    }

    // JSX to render the form
    return (
        <div className='register-container'>
            <div className='register-card'>
                <h3>Register</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id='firstName'
                            value={form.firstName}
                            onChange={(e) => updateForm({ firstName: e.target.value })}
                            required
                        />
                        {errors.firstName && <div className="error-message">{errors.firstName.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id='lastName'
                            value={form.lastName}
                            onChange={(e) => updateForm({ lastName: e.target.value })}
                            required
                        />
                        {errors.lastName && <div className="error-message">{errors.lastName.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id='email'
                            value={form.email}
                            onChange={(e) => updateForm({ email: e.target.value })}
                            required
                        />
                        {errors.email && <div className="error-message">{errors.email.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id='username'
                            value={form.username}
                            onChange={(e) => updateForm({ username: e.target.value })}
                            required
                        />
                        {errors.username && <div className="error-message">{errors.username.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id='password'
                            value={form.password}
                            onChange={(e) => updateForm({ password: e.target.value })}
                            required
                        />
                        {errors.password && <div className="error-message">{errors.password.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id='confirmPassword'
                            value={form.confirmPassword}
                            onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                            required
                        />
                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="accountNumber">Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id='accountNumber'
                            value={form.accountNumber}
                            onChange={(e) => updateForm({ accountNumber: e.target.value })}
                            required
                        />
                        {errors.accountNumber && <div className="error-message">{errors.accountNumber.toString()}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="idNumber">ID Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id='idNumber'
                            value={form.idNumber}
                            onChange={(e) => updateForm({ idNumber: e.target.value })}
                            required
                        />
                        {errors.idNumber && <div className="error-message">{errors.idNumber.toString()}</div>}
                    </div>
                    <div className='form-group'>
                        <input
                            type='submit'
                            value='Register'
                            className='btn btn-primary'
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
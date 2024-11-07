import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export default function EmployeeForgotPassword() {
    const [form, setForm] = useState({
        username: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    function updateForm(value) {
        setErrors({}); // Clear errors when updating form
        setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }
        try {
            const response = await fetch('https://localhost:3001/emp/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form) // Send the entire form object
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
                }
                const fieldErrors = {};
                if (Array.isArray(errorData.errors)) {
                    errorData.errors.forEach(error => {
                        fieldErrors[error.field] = error.message;
                    });
                } else {
                    fieldErrors.general = 'Password reset failed';
                }
                setErrors(fieldErrors);
                return;
            }
            window.alert('Password has been reset successfully');
            navigate('/emp'); // Redirect to the employee login page
        } catch (error) {
            console.error('Error during password reset:', error);
            setErrors({ general: error.message });
        }
    }

    const renderInput = (id, label, type) => (
        <div className="form-group mb-3">
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                className="form-control"
                id={id}
                value={form[id]}
                onChange={(e) => updateForm({ [id]: e.target.value })}
                required
            />
            {errors[id] && <div className="error-message">{errors[id]}</div>}
        </div>
    );

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">Forgot Password</h3>
                            <form onSubmit={onSubmit}>
                                {renderInput('username', 'Username', 'text')}
                                {renderInput('newPassword', 'New Password', 'password')}
                                {renderInput('confirmPassword', 'Confirm Password', 'password')}
                                <div className="form-group text-center">
                                    <input
                                        type="submit"
                                        value="Submit"
                                        className="btn btn-primary"
                                    />
                                </div>
                                {errors.general && <div className="error-message text-center">{errors.general}</div>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

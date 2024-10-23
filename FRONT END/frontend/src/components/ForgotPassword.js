import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
    const [form, setForm] = useState({
        identifier: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    function updateForm(value) {
        setErrors({}); // Clear errors when updating form
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        try {
            const response = await fetch('https://localhost:3001/user/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: form.identifier,
                    newPassword: form.newPassword,
                    confirmPassword: form.confirmPassword
                })
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
            navigate('/login');
        } catch (error) {
            console.error('Error during password reset:', error);
            setErrors({ general: error.message });
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">Forgot Password</h3>
                            <form onSubmit={onSubmit}>
                                <div className="form-group mb-3">
                                    <label htmlFor="identifier">Username or Account Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="identifier"
                                        value={form.identifier}
                                        onChange={(e) => updateForm({ identifier: e.target.value })}
                                        required
                                    />
                                    {errors.identifier && <div className="error-message">{errors.identifier}</div>}
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="newPassword"
                                        value={form.newPassword}
                                        onChange={(e) => updateForm({ newPassword: e.target.value })}
                                        required
                                    />
                                    {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                                        required
                                    />
                                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                                </div>
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
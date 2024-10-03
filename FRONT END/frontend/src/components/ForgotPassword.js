import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
    const [form, setForm] = useState({
        username: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://localhost:3001/user/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
                }
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            window.alert('Password has been reset successfully');
            navigate('/login');
        } catch (error) {
            console.error('Error during password reset:', error);
            setError(`An error occurred: ${error.message}`);
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
                                    {error && <small className="text-danger">{error}</small>}
                                </div>
                                <div className="form-group text-center">
                                    <input
                                        type="submit"
                                        value="Submit"
                                        className="btn btn-primary"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


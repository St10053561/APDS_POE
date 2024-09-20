import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [form, setForm] = useState({
        username: '',
        newPassword: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            window.alert('Passwords do not match');
            return;
        }

        try {
            // Send a POST request to the server using HTTPS
            const response = await fetch('https://localhost:3001/user/forgot-password', { // Ensure the URL is correct
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
                }
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const data = await response.json();
            console.log('Password reset successful:', data);

            // Navigate to the login page or show a success message
            window.alert('Password has been reset successfully');
            navigate('/login');
        } catch (error) {
            console.error('Error during password reset:', error);
            window.alert(`An error occurred: ${error.message}`);
        }
    }

    return (
        <div className="container">
            <h3>Forgot Password</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor='username'>Username</label>
                    <input
                        type="text"
                        className='form-control'
                        id="username"
                        value={form.username}
                        onChange={(e) => updateForm({ username: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor='newPassword'>New Password</label>
                    <input
                        type="password"
                        className='form-control'
                        id="newPassword"
                        value={form.newPassword}
                        onChange={(e) => updateForm({ newPassword: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor='confirmPassword'>Confirm Password</label>
                    <input
                        type="password"
                        className='form-control'
                        id="confirmPassword"
                        value={form.confirmPassword}
                        onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                        required
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='submit'
                        value='Submit'
                        className='btn btn-primary'
                    />
                </div>
            </form>
        </div>
    );
}
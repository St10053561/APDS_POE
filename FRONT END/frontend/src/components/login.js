import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext
import './Login.css'; // login styling

export default function Login() {
    const [form, setForm] = useState({
        usernameOrAccountNumber: '',
        password: ''
    });

    const { setAuth } = useContext(AuthContext); // Use the context
    const navigate = useNavigate();

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        try {
            const response = await fetch('https://localhost:3001/user/login', {
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

            const data = await response.json();
            console.log('Login successful:', data);

            setAuth({ token: data.token, username: data.username });
            navigate('/');
        } catch (error) {
            console.error('Error during login:', error);
            window.alert(`An error occurred: ${error.message}`);
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

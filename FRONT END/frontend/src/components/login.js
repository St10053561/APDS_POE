import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext

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
            // Send a POST request to the server using HTTPS
            const response = await fetch('https://localhost:3001/user/login', { // Ensure the URL is correct
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) {
                // Try to parse the error response as JSON
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    // If parsing fails, the response is not JSON
                    throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
                }
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const data = await response.json();
            console.log('Login successful:', data);

            // Update the context with the token and username
            setAuth({ token: data.token, username: data.username });

            // Navigate to the home page or another page
            navigate('/');
        } catch (error) {
            console.error('Error during login:', error);
            window.alert(`An error occurred: ${error.message}`);
        }
    }

    return (
        <div className="container">
            <h3>Login</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor='usernameOrAccountNumber'>Username or Account Number</label>
                    <input
                        type="text"
                        className='form-control'
                        id="usernameOrAccountNumber"
                        value={form.usernameOrAccountNumber}
                        onChange={(e) => updateForm({ usernameOrAccountNumber: e.target.value })}
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
        </div>
    );
}
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext
import { useNavigate } from 'react-router-dom';

export default function EmpHome() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.token) {
            navigate('/'); // Redirect to home if not logged in
        }
    }, [auth.token, navigate]);

    return (
        <div style={styles.container}>
            <h1 style={styles.greeting}>Hello, {auth.username}!</h1>
            <p style={styles.date}>Today is {new Date().toLocaleDateString()}</p>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
    },
    greeting: {
        fontSize: '2rem',
        color: '#333'
    },
    date: {
        fontSize: '1.2rem',
        color: '#666'
    }
};
// LoginSelection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginSelection() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Select Login Type</h2>
            <button onClick={() => navigate('/login')} style={styles.buttonPrimary}>
                Customer Login
            </button>
            <button onClick={() => navigate('/emp')} style={styles.buttonSecondary}>
                Employee Login
            </button>
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
    heading: {
        marginBottom: '20px',
        fontSize: '1.5rem',
        color: '#333'
    },
    buttonPrimary: {
        padding: '10px 20px',
        margin: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        width: '200px'
    },
    buttonSecondary: {
        padding: '10px 20px',
        margin: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        width: '200px'
    }
};

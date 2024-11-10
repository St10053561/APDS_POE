// LoginSelection.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function LoginSelection() {
    const navigate = useNavigate();
    const [hoveredButton, setHoveredButton] = useState(null);

    return (
        <div className="login-container">
            <div style={styles.container}>
                <h2 style={styles.heading}>Select Login Type</h2>
                <button
                    onClick={() => navigate('/login')}
                    onMouseEnter={() => setHoveredButton('customer')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        ...(hoveredButton === 'customer' ? styles.buttonPrimaryHover : {})
                    }}
                >
                    Customer Login
                </button>
                <button
                    onClick={() => navigate('/emp')}
                    onMouseEnter={() => setHoveredButton('employee')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        ...(hoveredButton === 'employee' ? styles.buttonSecondaryHover : {})
                    }}
                >
                    Employee Login
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        animation: 'backgroundShift 10s infinite alternate',
    },
    heading: {
        marginBottom: '30px',
        fontSize: '2.5rem',
        color: '#333',
        fontWeight: '600',
        letterSpacing: '1px',
    },
    button: {
        padding: '14px 28px',
        margin: '12px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.2rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: '240px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
    },
    buttonPrimary: {
        backgroundColor: '#007bff',
        color: '#fff',
    },
    buttonPrimaryHover: {
        backgroundColor: '#0056b3',
        transform: 'scale(1.05)',
        boxShadow: '0px 8px 16px rgba(0, 91, 179, 0.4)',
    },
    buttonSecondary: {
        backgroundColor: '#6c757d',
        color: '#fff',
    },
    buttonSecondaryHover: {
        backgroundColor: '#495057',
        transform: 'scale(1.05)',
        boxShadow: '0px 8px 16px rgba(73, 80, 87, 0.4)',
    },
};

// Adding keyframe animation for background shift
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes backgroundShift {
        0% { background: linear-gradient(135deg, #f8f9fa, #e9ecef); }
        100% { background: linear-gradient(135deg, #e9ecef, #d6d8db); }
    }
`, styleSheet.cssRules.length);


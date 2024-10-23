import React, { createContext, useState } from 'react';

// Create a context for authentication
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        username: null,
        accountNumber: null // Add account number to the auth state
    });

    // Login function to set authentication state
    const login = (token, username, accountNumber) => {
        setAuth({
            token,
            username,
            accountNumber // Set the account number during login
        });
    };

    // Logout function to clear authentication state
    const logout = () => {
        setAuth({
            token: null,
            username: null,
            accountNumber: null // Clear account number on logout
        });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
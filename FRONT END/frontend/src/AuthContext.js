import React, { createContext, useState } from 'react';

// Create a context for authentication
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        username: null
    });

    // Logout function to clear authentication state
    const logout = () => {
        setAuth({
            token: null,
            username: null
        });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
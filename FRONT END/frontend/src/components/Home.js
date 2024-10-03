import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext.js';
import { NavLink } from 'react-router-dom';
const Home = () => {
    const { auth } = useContext(AuthContext);

    if (!auth.token) {
        return (

            
            <div className="container">
                <h1 className="welcome-message">Welcome to TransactIO.</h1>
                <p className="subtext">Please log in to access your account and make payments.</p>
            </div>

            
        );

        
    }

   

   
};

export default Home;
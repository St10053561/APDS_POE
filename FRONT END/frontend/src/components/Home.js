import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext.js';
import Navbar from './navbar';  // Import the Navbar
import './Home.css';

const Home = () => {
    const { auth } = useContext(AuthContext);

    return (
        <div>
            <Navbar />  
            <div className="home-container">
                <div className="left-half">
                    <h1>Welcome to TransactIO</h1>
                </div>

                {auth.token ? (
                    <div className="right-half">
                        <button className="register-btn">Register</button>
                        <button className="login-btn">Login</button>
                        <button className="create-payment-btn">Create Payment</button>
                    </div>
                ) : (
                    <div className="right-half">
                        <Navbar to="/register">
                            <button>Register</button>
                        </Navbar>
                    </div>
                )}
            </div>
        </div>

        
    );
};

export default Home;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar.js'; // Ensure the case matches the file name
import Register from './components/register.js'; // Ensure the case matches the file name
import Login from './components/login.js'; // Ensure the case matches the file name
import { AuthProvider } from './AuthContext.js'; // Import the AuthProvider
import PaymentPortal from './components/paymentPortal.js'; // Ensure the case matches the file name
import Home from './components/Home.js'; // Import the Home component
import ForgotPassword from './components/ForgotPassword.js'; // Import the ForgotPassword component

import './App.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <body>
                <img src="images/Logo.jpg" class= "img-fluid" alt= ''/>
            </body>
                    <Routes>
                        <Route exact path="/" element={<Home />} /> {/* Add the route for Home */}
                        <Route exact path="/register" element={<Register />} />
                        <Route exact path="/login" element={<Login />} />
                        <Route exact path="/paymentCreate" element={<PaymentPortal />} /> {/* Add the route for PaymentPortal */}
                        <Route exact path="/forgot-password" element={<ForgotPassword />} /> {/* Add the route for ForgotPassword */}
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
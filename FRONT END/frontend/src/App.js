// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar.js'; 
import Register from './components/register.js'; 
import Login from './components/login.js'; 
import { AuthProvider } from './AuthContext.js'; // Import the AuthProvider
import PaymentPortal from './components/paymentPortal.js'; 
import Home from './components/Home.js'; // Import the Home component
import ForgotPassword from './components/ForgotPassword.js'; // Import the ForgotPassword component
import EmployeeLogin from './components/employeeLogin.js'; // Import the EmployeeLogin component
import LoginSelection from './components/LoginSelection.js'; // Import the LoginSelection component
import EmpHome from './components/empHome.js'; // Import the EmpHome component
import './App.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <Routes>
                        <Route exact path="/" element={<Home />} /> {/* Default Home for all users */}
                        <Route exact path="/register" element={<Register />} />
                        <Route exact path="/login" element={<Login />} />
                        <Route exact path="/emp" element={<EmployeeLogin />} /> {/* Employee Login */}
                        <Route exact path="/emp-home" element={<EmpHome />} /> {/* Employee Home */}
                        <Route exact path="/paymentCreate" element={<PaymentPortal />} /> {/* Payment Portal */}
                        <Route exact path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot Password */}
                        <Route exact path="/login-selection" element={<LoginSelection />} /> {/* Login Selection */}
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
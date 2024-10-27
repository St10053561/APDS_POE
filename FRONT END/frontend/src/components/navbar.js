// Navbar.js
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from './transactio.png'; 
import '../navbar.css'; // Custom CSS file for styling
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext

// Navbar component
export default function Navbar() {
  const { auth, logout } = useContext(AuthContext); // Use the context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login-selection'); // Redirect to login selection after logout
  };

  return (
    <nav className="navbar">
      <NavLink className="navbar-brand" to="/">
        <img className="logo-3d" src={logo} alt="Logo" />
      </NavLink>

      <ul className="nav-links">
        {auth.token ? ( // Check if user is logged in
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to={auth.accountNumber ? "/emp-home" : "/"}> {/* Redirect based on user type */}
                Home
              </NavLink>
            </li>
            {auth.accountNumber && ( // If logged in as employee
              <li className="nav-item">
                <NavLink className="nav-link" to="/paymentCreate">
                  Create Payment
                </NavLink>
              </li>
            )}
            <li className='nav-item'>
              <NavLink className='nav-item' onClick={handleLogout} style={{ color: 'red' }}>
                Logout
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to="/register">
                Register
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login-selection">
                Login
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
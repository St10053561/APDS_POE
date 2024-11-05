// Navbar.js
import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from './transactio.png';
import '../navbar.css'; // Custom CSS file for styling
import { AuthContext } from '../AuthContext.js'; // Import the AuthContext

// Navbar component
export default function Navbar() {
  const { auth, logout } = useContext(AuthContext); // Use the context
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to the default home page after logout
  };

  return (
    <nav className="navbar">
      <NavLink className="navbar-brand" to="/">
        <img className="logo-3d" src={logo} alt="Logo" />
      </NavLink>

      <div className="nav-left">
        {auth.token && auth.accountNumber && ( // If logged in as Customer
          <NavLink className="nav-link" to="/notifications">
            <img src="notification-icon.png" alt="Notifications" />
          </NavLink>
        )}
      </div>

      <ul className="nav-links">
        {auth.token ? ( // Check if user is logged in
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to={auth.accountNumber ? "/" : "/emp-home"}>
                Home
              </NavLink>
            </li>
            {auth.accountNumber && ( // If logged in as Customer
              <li className="nav-item">
                <NavLink className="nav-link" to="/paymentCreate">
                  Create Payment
                </NavLink>
              </li>
            )}
            {!auth.accountNumber && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/transaction-history">
                  Transaction History
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
              <NavLink className="nav-link" to="/login-selection">
                Login
              </NavLink>
            </li>
            {location.pathname !== '/emp' && ( // Hide "Register" if on employee login page
              <li className="nav-item">
                <NavLink className="nav-link" to="/register">
                  Register
                </NavLink>
              </li>
            )}
          </>
        )}
      </ul>
    </nav>
  );
}
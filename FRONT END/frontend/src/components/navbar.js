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
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink className="navbar-brand" to="/">
        <img className="logo-3d" src={logo} alt="Logo" />
      </NavLink>

      <ul className="nav-links">
        <li className="nav-item">
          <NavLink className="nav-link" to="/">
            Home
          </NavLink>
        </li>
        {auth.username && ( // Conditionally render the Create Payment link
          <li className="nav-item">
            <NavLink className="nav-link" to="/paymentCreate">
              Create Payment
            </NavLink>
          </li>
        )}
        {!auth.username && (
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to="/register">
                Register
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>
            </li>
          </>
        )}
        {auth.username && (
          <li className='nav-item'>
            <NavLink className='nav-item' onClick={handleLogout}>
              Logout
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

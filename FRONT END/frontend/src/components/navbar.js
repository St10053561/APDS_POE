import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../logo.svg'; // Adjust the path as necessary
import '../Navbar.css'; // Custom CSS file for styling
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
    <nav className="navbar navbar-expand-lg navbar-3d bg-gradient">
      <div className="container">
        {/* Fixed larger logo on the left */}
        <NavLink className="navbar-brand" to="/">
          <img className="logo-3d" src={logo} alt="Logo" />
        </NavLink>

        {/* Toggler for mobile views */}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <NavLink className="nav-link nav-link-3d" to="/">
                Home
              </NavLink>
            </li>
            {auth.username && ( // Conditionally render the Create Payment link
              <li className="nav-item">
                <NavLink className="nav-link nav-link-3d" to="/paymentCreate">
                  Create Payment
                </NavLink>
              </li>
            )}
            {!auth.username && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link nav-link-3d" to="/register">
                    Register
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link nav-link-3d" to="/login">
                    Login
                  </NavLink>
                </li>
              </>
            )}
            {auth.username && (
              <>
                <li className='nav-item'>
                  <button className='nav-link nav-link-3d btn btn-link' onClick={handleLogout}>
                    Logout
                  </button>
                </li>
                <span className="navbar-text">Welcome, {auth.username}!</span>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
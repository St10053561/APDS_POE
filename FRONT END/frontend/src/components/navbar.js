import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; 

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">
                <img src="C:\Users\ASUS\Downloads\Logo.jpg" alt= ''/>
            </div>
            <ul className="nav-links">
                <li>
                    <NavLink to="/Home" activeClassName="active-link">Home</NavLink>
                </li>
                <li>
                    <NavLink to="/Register" activeClassName="active-link">Register</NavLink>
                </li>
                <li>
                    <NavLink to="/Login" activeClassName="active-link">Login</NavLink>
                </li>
               
               
            </ul>
        </nav>
    );
};

export default Navbar;

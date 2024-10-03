import React from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css'; 



const navbar = () => {
    return (
        <nav className="navbar">
            <body className="logo">
                <img src="images/Logo.jpg" class= "img-fluid" alt= ''/>
            </body>
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

export default navbar;

import React, { useState } from "react";
import "./header.css";
import { Link } from "react-router-dom";
const Header = () => {
  const [mobilemenu, setMobilemenu] = useState(false);
  return (
    <>
      <header>
        <div className="container flexSB">
          <nav className="flexSB">
            <div className="logo">
              <img src="./images/logo.png" alt="" />
            </div>
            <ul
              className={mobilemenu ? "navmenu-list" : "flexSB"}
              onClick={() => setMobilemenu(false)}
            >
              <Link to="/">Home</Link>
              <Link to="/series">Series</Link>
              <Link to="/movies">movies</Link>
              <Link to="/pages">pages</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/pricing">Contact</Link>
            </ul>
            <button
              className="toggle"
              onClick={() => setMobilemenu(!mobilemenu)}
            >
              {mobilemenu ? (
                <i className="fa fa-times"></i>
              ) : (
                <i className="fa fa-bars"></i>
              )}
            </button>
          </nav>

          <div className="account flexSB">
            <i className="fa fa-search"></i>
            <i className="fa fa-bell"></i>
            <i className="fa fa-user"></i>
            <button>Subscribe Now</button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

// src/components/HomePage.js
import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const StartPage = () => {
  return (
    <div>
      <Navbar />
      <div>
        <div className=''>
          <h1> Please <Link to='/signin'>Login</Link> or <Link to='/signup'>Sign Up</Link> to get started!   </h1>
        </div>
      </div>
    </div>
  );
};

export default StartPage;

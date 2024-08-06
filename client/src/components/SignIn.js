// src/components/SignIn.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignIn.css';

const SignIn = ({ setUser }) => {
  const [formData, setFormData] = useState({ username: '', password: '', });
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(false);

  const server_url = "https://user-post-comment-chat-project.onrender.com";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add logic to handle form submission
    try {
      const response = await axios.post(`${server_url}/api/users/login`, formData);
      const user = response.data;
      localStorage.setItem('user:token', user.token);
      localStorage.setItem('user:data', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (error) {
      setLoginError(true);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); // Show alert with the server-side error message
      } else {
        alert('Error signing up');
      }
    }
  };

  return (
    <div className='signin-contaniner'>
        <div className='signin-to-home'>
            <Link to='/start'><h1>Back to home</h1></Link>
        </div>
        <div className='signin-form-container'>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit">Sign In</button>
                {loginError && (
                  <div className="error-message">
                    <p>Wrong password! <Link to='/forgot-password'>Forgot Password?</Link></p>
                  </div>
                )}
            </form>
            <p>Don't have an account? <Link to='/signup'>Sign Up here</Link> </p>
        </div>
        
    </div>
    
  );
};

export default SignIn;

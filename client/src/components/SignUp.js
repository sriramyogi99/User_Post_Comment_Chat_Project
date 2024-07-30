// src/components/SignUp.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SignUp.css';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '', email: '',
    password: '', confirmPassword: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project.onrender.com";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add logic to handle form submission
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    //
    const form = new FormData();
    form.append('username', formData.username);
    form.append('email', formData.email);
    form.append('password', formData.password);
    if (profilePic) {
      form.append('profilePic', profilePic);
    }
    //
    try {
      await axios.post(`${server_url}/api/users/register`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/signin');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); // Show alert with the server-side error message
      } else {
        alert('Error signing up');
      }
    }
  };

  return (
    <div className='signup-container'>
        <div className='signup-to-home'>
            <Link to='/start'><h1>Back to home</h1></Link>
        </div>
        <div className='signup-form-container'>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div>
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
                <div>
                    <label>Profile Picture (optional)</label>
                    <input type="file" name="profilePic" onChange={handleFileChange} />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to='/signin'>Sign In here</Link> </p>
        </div>
    </div>
    
  );
};

export default SignUp;

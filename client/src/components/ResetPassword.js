// client/src/components/ResetPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { id, token } = useParams();
  const server_url = "http://localhost:8000";

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${server_url}/api/users/reset-password/${id}/${token}`, { password });
      alert('Password updated successfully. Please Login!');
      navigate('/signin');
    } catch (error) {
      console.error(error);
      alert('Error updating password. Try Again!');
    }
  };

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Update Password</h2>
        <input
          type="password"
          name="password"
          placeholder="Enter new password"
          value={password}
          onChange={handleChange}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
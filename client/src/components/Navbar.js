// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Navbar.css';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user:data'));
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project-backend.onrender.com";

  const handleLogout = async () => {
    try {
      await axios.post(`${server_url}/api/users/logout`);
      localStorage.removeItem('user:token');
      localStorage.removeItem('user:data');
      navigate('/start');
    } catch (error) {
      console.error(error);
      alert('Error logging out');
    }
  };
  //
  return (
    <nav className='nav-bar-container'>
      <div className='nav-left'>
        {user ? (
          <>
            <Link to="/" className='nav-link'><h3>Home</h3></Link>
            <Link to={`/${user._id}/posts`} className='nav-link'><h3>Posts</h3></Link>
            <Link to="/chats" className='nav-link'><h3>Chats</h3></Link>
          </>
        ) : (
          <Link to="/chats" className='nav-link'><h3>Chats</h3></Link>
        )}
      </div>
      <div className='nav-right'>
        {!user ? (
          <>
            <Link to="/signin" className='nav-link'>Sign In</Link>
            <Link to="/signup" className='nav-link'>Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/profile" className='image-link'>
              {user.profilePic && (
                <img 
                  src={`${server_url}${user.profilePic}`} 
                  alt="Profile" 
                  className='profile-picture'
                />
              )}
              <span className='profile-link'>{user.username}</span>
            </Link>
            <button onClick={handleLogout} className='logout-button'>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

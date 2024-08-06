// src/components/Profile.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  // const [ID, setID] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project-backend.onrender.com";

  useEffect(() => {
    const fetchUser = async () => {
      const userData = JSON.parse(localStorage.getItem('user:data'));
      if (userData) {
        setUser(userData);
        setUsername(userData.username);
        setEmail(userData.email);
        setProfilePic(userData.profilePic);
        // setID(userData._id);
      }
    };
    fetchUser();
  }, []);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your profile?");
    
    if (!confirmDelete) {
      return; // Exit the function if user cancels
    }
    try {
      const response = await fetch(`${server_url}/api/users/${user._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        localStorage.removeItem('user:data');
        navigate('/start');
      } else {
        console.error('Failed to delete profile');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChanges = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (newProfilePic) {
      formData.append('profilePic', newProfilePic);
    }

    try {
      const response = await fetch(`${server_url}/api/users/${user._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user:data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfilePic(updatedUser.profilePic);
        alert('User details updated successfully'); // Success message
        setIsEditable(false);
      } else {
        const errorData = await response.json();
        if (errorData.message) {
          alert(errorData.message); // Show alert with the server-side error message
        } else {
          alert('Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating profile');
    }
  };

  const handleFileChange = (e) => {
    setNewProfilePic(e.target.files[0]);
  };

  const handleEditClick = () => {
    setIsEditable(true);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        {!isEditable && (
          <button className="edit-button" onClick={handleEditClick}>✎</button>
        )}
        <div className="profile-details">
          <img
            src={`${server_url}${profilePic}`}
            alt="Profile"
            style={{ width: "100px", height: "100px" }}
          />
          <div className="profile-form-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChanges();
              }} 
            >
              {/* <label> ID: </label>
              <input
                  type="text"
                  value={ID}
                  onChange={(e) => setID(e.target.value)}
                  disabled={true}
                />
              <br /> */}
              <label> Username: </label>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditable}
                />
              <br />
              <label> Email: </label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditable}
                />
              <br />
              <label> Change Profile Picture: </label>
              <input type="file" onChange={handleFileChange} disabled={!isEditable} />
              <br />
              {isEditable && <button type="submit">Save Changes</button>}
            </form>
          </div>
          <Link to={`/${user._id}/posts`} className="your-posts-button" >Your Posts</Link> <br />
          <button onClick={handleDelete} className="delete-button">Delete Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

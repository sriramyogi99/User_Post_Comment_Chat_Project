// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import '../styles/HomePage.css';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project-backend.onrender.com";
  //
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${server_url}/api/posts/allposts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    //
    fetchPosts();
  }, []);
  //
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${server_url}/api/users/allusers`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleNewPost = () => {
    navigate('/newpost');
  };
  //
  const getUserById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user : { username: 'Unknown user', profilePic: '/uploads/defaultProfile.png' };
  };
  //
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div>
      <Navbar />
      <div>
        <div className='posts-container'>
          <h1>All posts:</h1>
          <div className='new-post-button'>
            <button onClick={handleNewPost}>Create New Post</button>
          </div><br/>
          <div className='posts-grid'>
            {posts.map(post => {
                const user = getUserById(post.postCreatedBy);
                return (
                  <div key={post._id} className='post-container' onClick={() => handlePostClick(post._id)}>
                    <div className='post-user-info'>
                      <img 
                        src={`${server_url}${user.profilePic}`} 
                        alt="User Profile" 
                        className='user-profile-picture' 
                      />
                      <h4>{user.username}</h4>
                    </div>
                    <h2>{post.postTitle}</h2>
                    {post.postImage && <img src={`${server_url}${post.postImage}`} alt="PostImage" />}
                    <p>{post.postDescription}</p>
                  </div>
                );
              })}
          </div>
        </div>
        <div className='new-post-button'>
          <button onClick={handleNewPost}>Create New Post</button>
        </div><br/>
      </div>
    </div>
  );
};

export default HomePage;

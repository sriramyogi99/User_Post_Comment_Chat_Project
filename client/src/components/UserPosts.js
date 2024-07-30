// src/components/UserPosts.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/UserPosts.css';

const UserPosts = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project.onrender.com";

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userResponse = await axios.get(`${server_url}/api/users/${userId}`);
        setUser(userResponse.data);
  
        if (userResponse.data.posts && userResponse.data.posts.length > 0) {
          const validPosts = [];
          const postRequests = userResponse.data.posts.map(async postId => {
            try {
              const postResponse = await axios.get(`${server_url}/api/posts/${postId}`);
              validPosts.push(postResponse.data);
            } catch (error) {
              console.error(`Error fetching post with ID ${postId}:`, error);
            }
          });
  
          await Promise.all(postRequests);
          setPosts(validPosts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching user and posts:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserAndPosts();
  }, [userId]);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (posts.length === 0) {
    return (
      <div>
        <Navbar />
        <h3>You don't have any posts yet! You can create one here:</h3>
        <div className='new-post-button'>
          <Link to='/newpost'>Create New Post</Link>
        </div><br/>
      </div>
    );
  }
  //
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };
  //
  const handleNewPost = () => {
    navigate('/newpost');
  };

  return (
    <div>
      <Navbar />
      <div className='user-posts-container'>
        <div className='new-post-button'>
          <button onClick={handleNewPost}>Create New Post</button>
        </div><br/>
        <h1>Your Posts</h1>
        <div className='posts-grid'>
          {posts.map(post => (
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
              <p>{post.postDescription}</p>
              {post.postImage && <img src={`${server_url}${post.postImage}`} alt="Post" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPosts;

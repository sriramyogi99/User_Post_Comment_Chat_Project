// src/components/NewPost.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NewPost.css';

const NewPost = () => {
  const [userID, setUserID] = useState(null);
  const [formData, setFormData] = useState({
    postImage: null,
    postTitle: '',
    postDescription: '',
  });
  const navigate = useNavigate();
  const server_url = "http://localhost:8000";

  useEffect(() => {
    const fetchUser = async () => {
      const userData = JSON.parse(localStorage.getItem('user:data'));
      if (userData) {
        setUserID(userData._id);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to handle file upload
    const formDataToSend = new FormData();
    formDataToSend.append('postTitle', formData.postTitle);
    formDataToSend.append('postDescription', formData.postDescription);
    if(formData.postImage){
      formDataToSend.append('postImage', formData.postImage);
    }
    formDataToSend.append('userId', userID); // Assuming user object contains an id

    try {
      const response = await fetch(`${server_url}/api/posts/newpost`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create a new post');
      }

      const result = await response.json();
      window.alert('Post created successfully');
      navigate(`/${userID}/posts`);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className='newpost-container'>
      <div className='to-home'>
          <Link to='/'><h1>Back to home</h1></Link>
      </div>
      <div className='form-container'>
        <h2>New Post</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Post Title</label>
            <input type="text" name="postTitle" value={formData.postTitle} onChange={handleChange} required />
          </div>
          <div>
            <label>Post Description</label>
            <textarea name="postDescription" value={formData.postDescription} onChange={handleChange} required />
          </div>
          <div>
            <label>Post Image</label>
            <input type="file" name="postImage" onChange={handleChange} />
          </div>
          
          <button type="submit">Create Post</button>
        </form>
      </div>
      
    </div>
  );
};

export default NewPost;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Comment from '../commentModules/Comment';
import '../styles/PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null); // user of this post
  const [user, setUser] = useState(null);
  const [loggedInuser, setLoggedInUser] = useState(null); // user currently logged in
  //
  const [editMode, setEditMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postImage, setPostImage] = useState(null);
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project.onrender.com";

  //
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem('user:data'));
      if(loggedInUserData) {
        setLoggedInUser(loggedInUserData);
      }
    };
    fetchLoggedInUser();
  }, []);
  //

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${server_url}/api/posts/${postId}`);
        setPost(response.data);
        setPostTitle(response.data.postTitle);
        setPostDescription(response.data.postDescription);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId]);
  //

  useEffect(() => {
    if (post) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${server_url}/api/users/${post.postCreatedBy}`);
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUser();
    }
  }, [post]);
  //


  const handleOnClick = async () => {
    if(loggedInuser && user && loggedInuser._id === user._id){
      navigate(`/${user._id}/posts`);
    }
  };
  //

  const handleEditClick = () => {
    setEditMode(true);
  };
  //

  const handleFileChange = (e) => {
    setPostImage(e.target.files[0]);
  };
  //

  const handleChanges = async () => {
    const formData = new FormData();
    formData.append('newPostTitle', postTitle);
    formData.append('newPostDescription', postDescription);
    if (postImage) {
      formData.append('postImage', postImage);
    }

    try {
      const response = await fetch(`${server_url}/api/posts/${postId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
        setPostImage(updatedPost.postImage);
        alert('User details updated successfully');
        setEditMode(false);
      } else {
        const errorData = await response.json();
        if (errorData.message) {
          alert(errorData.message); // Show alert with the server-side error message
        } else {
          alert('Failed to update post');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating post');
    }
  };
  //

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your profile?");
    if(!confirmDelete){
      return;
    }
    //
    try {
      const response = await fetch(`${server_url}/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Post deleted successfully');
        navigate('/');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  //

  const handleNewPost = () => {
    navigate('/newpost');
  };
  //

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className='new-post-button'>
        <button onClick={handleNewPost}>Create New Post</button>
      </div><br/>
      <div className='post-detail-container'>
        {loggedInuser && user && loggedInuser._id === user._id && (
          <button className="edit-button" onClick={handleEditClick}>✎</button>
        )}
        <div className='user-info' onClick={handleOnClick}>
          {user && user.profilePic && (
            <img 
              src={`${server_url}${user.profilePic}`} 
              alt="Profile" 
              className='user-profile-picture' 
            />
          )}
          <h1>{user ? user.username : 'Loading...'}</h1>
        </div>
          {!editMode ? (
            <>
              <h4><span>Title: </span>{post.postTitle}</h4>
              {post.postImage && <img src={`${server_url}${post.postImage}`} alt="Post" className='post-detail-image' />}
              <p><span>Caption: </span>{post.postDescription}</p>
              <p>Created at: {new Date(post.createdAt).toLocaleDateString()}</p>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChanges();
              }}
              className="edit-post-form"
            >
              <label>Title:</label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
              />
              <br />
              <label>Description:</label>
              <textarea
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                required
              />
              <br />
              <label>Update Image:</label>
              <input type="file" onChange={handleFileChange} />
              <br />
              <button type="submit">Save Changes</button>
            </form>
          )}
          {loggedInuser && user && loggedInuser._id === user._id && (
            <button onClick={handleDelete} className="delete-button">Delete Post</button>
          )}
      </div>
      {/* <AllComments /> */}
      <Comment postId={post?._id} userId={user?._id} />
    </div>
  );
};

export default PostDetail;

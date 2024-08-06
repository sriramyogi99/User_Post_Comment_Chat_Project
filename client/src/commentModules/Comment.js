import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/Comment.css';
import AddCommentForm from "./AddCommentForm";

const Comment = ({ postId, userId }) => {
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const server_url = "https://user-post-comment-chat-project-backend.onrender.com";

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    if (!postId) return;

    try {
      const response = await axios.get(
        `${server_url}/api/comments/${postId}`
      );
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
        console.log("Fetched comments:", response.data.comments); // Log the comments here
      } else {
        console.error("Fetched data is not in the expected format:", response.data);
      }
      setReplyingTo(null);
      setEditing(null);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  //

  const handleReplyClick = (commentId) => {
    if (replyingTo === commentId) {
      setReplyingTo(null); // Cancel reply
    } else {
      setReplyingTo(commentId);
      setEditing(null); // Close any open edit forms
    }
  };

  const handleEditClick = (commentId) => {
    if (editing === commentId) {
      setEditing(null); // Cancel edit
    } else {
      setEditing(commentId);
      setReplyingTo(null); // Close any open reply forms
    }
  };

  const handleDeleteClick = async (commentId) => {
    try {
      await axios.delete(`${server_url}/api/comments/${commentId}`);
      fetchComments(); // Refresh comments after deletion
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  //
  const renderComments = (comments) => {
    return Object.values(comments).map(comment => (
      <div key={comment._id} className="comment" style={{ marginLeft: `${comment.depth * 20}px`}}>
        <div className="comment-description">{comment.commentDescription}</div>
        <div className="comment-actions">
          <button className="comment-action-button" onClick={() => handleReplyClick(comment._id)}> 
            {replyingTo === comment._id ? '❌' : '↩️'}
          </button> 
          <button className="comment-action-button" onClick={() => handleEditClick(comment._id)}> 
            {editing === comment._id ? '❌' : '✏️'}
          </button> {/* Edit reply */}
          <button className="comment-action-button" onClick={() => handleDeleteClick(comment._id)}  >🗑️</button> {/* Delete reply */}
        </div>
        {replyingTo === comment._id && (
          <AddCommentForm
            postId={postId}
            userId={userId}
            parentId={comment._id}
            depth={comment.depth}
            onCommentAdded={fetchComments}
          />
        )}
        {editing === comment._id && (
          <AddCommentForm
            postId={postId}
            userId={userId}
            parentId={comment._id}
            commentId={comment._id}
            depth={comment.depth}
            commentText={comment.commentDescription}
            onCommentAdded={fetchComments}
            value={comment.commentDescription}
          />
        )}
        {comment.children && renderComments(comment.children)}
      </div>
    ));
  };

  return (
    <div className="comments-container">
      <div className="new-comment-container">
        <AddCommentForm
          postId={postId}
          userId={userId}
          onCommentAdded={fetchComments}
        />
      </div>
      <h2>Comments:</h2>
      {renderComments(comments)}
    </div>
  );
};

export default Comment;

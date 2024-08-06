import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/Comment.css';

const AddCommentForm = ({ postId, userId, parentId, commentId, commentDescription, onCommentAdded, value, depth }) => {
  const [comment, setComment] = useState(commentDescription || "");
  const server_url = "https://user-post-comment-chat-project-backend.onrender.com";

  useEffect(() => {
    setComment(commentDescription || "");
  }, [commentDescription]);

  const handleInputChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (commentId) {
        // Edit existing comment
        await axios.put(`${server_url}/api/comments/${commentId}`, { commentDescription: comment });
      } else {
        // Add new comment or reply
        await axios.post(`${server_url}/api/comments`, {
          postId,
          authorId: userId,
          parentId: parentId === "undefined" ? null : parentId,
          commentDescription: comment,
          depth: parentId === "undefined" ? 1 : depth + 1,
        });
      }
      onCommentAdded();
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-comment-form">
      <input
        type="text"
        value={comment}
        onChange={handleInputChange}
        className="comment-input"
        placeholder={commentId ? "Edit your comment" : "Add a Comment"}
      />
      <button type="submit" className="comment-submit-button">{commentId ? "Edit" : "Submit"}</button>
    </form>
  );
};

export default AddCommentForm;

const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// Add a new comment
router.post("/", async (req, res) => {
  const { authorId, commentDescription, postId, parentId, depth } = req.body;
  try {
    if (!authorId || !commentDescription || !postId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const data = { authorId, commentDescription, postId };
    if (parentId) data.parentId = parentId;
    if (depth) data.depth = depth;

    const comment = new Comment(data);
    const savedComment = await comment.save();
    res.json({ comment: savedComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments by postId
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean().exec();

    const rec = (comment, threads) => {
      for (const thread in threads) {
        const value = threads[thread];
        if (thread.toString() === comment.parentId.toString()) {
          value.children[comment._id] = comment;
          return;
        }
        if (value.children) {
          rec(comment, value.children);
        }
      }
    };

    const threads = {};
    for (const comment of comments) {
      comment.children = {};
      const { parentId } = comment;
      if (!parentId) {
        threads[comment._id] = comment;
      } else {
        rec(comment, threads);
      }
    }

    res.json({ count: comments.length, comments: threads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a comment by commentId
router.put("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { commentDescription } = req.body;
  try {
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { commentDescription }, { new: true });
    res.status(200).json({ message: "Comment Updated", comment: updatedComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment by commentId
router.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  try {
    // Recursive delete function
    const deleteCommentAndChildren = async (commentId) => {
      const comment = await Comment.findById(commentId);
      if (comment) {
        // Delete child comments
        const childComments = await Comment.find({ parentId: commentId });
        for (const childComment of childComments) {
          await deleteCommentAndChildren(childComment._id);
        }
        // Delete the comment
        await Comment.findByIdAndDelete(commentId);
      }
    };

    await deleteCommentAndChildren(commentId);
    res.status(200).json({ message: "Comment and its children deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../postUploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Create a new Post
router.post("/newpost", upload.single("postImage"), async (req, res) => {
  const { postTitle, postDescription, userId } = req.body;
  const postImage = req.file ? `/postUploads/${req.file.filename}` : "";

  try {
    const newPost = new Post({
      postTitle,
      postDescription,
      postImage,
      postCreatedBy: userId,
      comments: [],
    });

    const post = await newPost.save();

    // Update the user with the new post ID
    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });
    //
    res.status(201).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all posts created by all users
router.get("/allposts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

// Get a particular post by post ID and user ID
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found with this ID" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post details", error });
  }
});

// Update a post
router.put("/:postId", upload.single("postImage"), async (req, res) => {
  const { postId } = req.params;
  const { newPostTitle, newPostDescription } = req.body;
  const newPostImage = req.file
    ? `/postUploads/${req.file.filename}`
    : undefined;
  //
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    //
    post.postTitle = newPostTitle || post.postTitle;
    post.postDescription = newPostDescription || post.postDescription;
    if (newPostImage) {
      post.postImage = newPostImage;
    }
    //
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndDelete(postId);
    //
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await Comment.deleteMany({ commentedOnPost: postId });
    // Remove the post ID from the user's posts array
    await User.findByIdAndUpdate(post.postCreatedBy, {
      $pull: { posts: postId },
    });
    //
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;

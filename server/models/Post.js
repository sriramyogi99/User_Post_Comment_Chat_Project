// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  postTitle: { type: String, required: true },
  postDescription: { type: String, required: true },
  postImage: { type: String },
  postCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

module.exports = mongoose.model('Post', PostSchema);

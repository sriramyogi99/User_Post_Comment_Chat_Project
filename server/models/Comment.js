const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentDescription: { type: String, required: true },
  depth: { type: Number, default: 1 },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

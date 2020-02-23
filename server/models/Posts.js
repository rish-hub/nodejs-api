const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//comments Schema
const CommentSchema = new Schema({
    postId: { type: Number },
    id: { type: Number },
    name: { type: String },
    email: { type: String },
    body: { type: String },
}, { timestamps: true })

//Posts Schema 
const PostSchema = new Schema({
    userId: { type: Number },
    id: { type: Number },
    title:{ type: String },
    body:{ type: String },
    comments: [CommentSchema]
  }, { timestamps: true });

module.exports = PostModel = mongoose.model('posts', PostSchema, 'posts');

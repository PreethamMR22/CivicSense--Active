import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  location: {
    type: String,
    default: ''
  },
  latitude: Number,
  longitude: Number,
  tags: [{
    type: String
  }],
  image: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;

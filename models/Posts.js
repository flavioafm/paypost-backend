const database = require('../config/database');

const PostSchema = new database.Schema({
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type: database.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    platformId: {
        type: database.Schema.Types.ObjectId,
        ref: 'Platforms',
        required: true,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
  });

  const Post = database.model('Posts', PostSchema);
  module.exports = Post;
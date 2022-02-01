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
        type: String,
        required: true,
    },
    platformPostId: {
        type: String,
        required: true,
    },
    mediaId: {
        type: database.Schema.Types.ObjectId,
        ref: 'Medias'
    },
    likes: {
        type: Number,
        default: 0,
    }, 
    responses: {
        type: Number,
        default: 0,
    }, 
    shares: {
        type: Number,
        default: 0,
    }, 
    views: {
        type: Number,
        default: 0,
    }, 
    earned: {
        type: Number,
        default: 1,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
  });

  const Post = database.model('Posts', PostSchema);
  module.exports = Post;
const database = require('../config/database');

const MediaSchema = new database.Schema({
    url: {
        type: String,
        required: true
    },
    userId: {
        type: database.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
  });

  const Post = database.model('Medias', MediaSchema);
  module.exports = Post;
const database = require('../config/database');

const PlatformSchema = new database.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
  });

  const Platform = database.model('Platforms', PlatformSchema);
  module.exports = Platform;
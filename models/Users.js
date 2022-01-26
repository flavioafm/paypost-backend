const database = require('../config/database');
const bcrypt = require('bcryptjs');

const UserSchema = new database.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        required: true,
    },
    companyId: {
        type: database.Schema.Types.ObjectId,
        ref: 'Companies',
        required: true,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
  });

  UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  });

  const User = database.model('Users', UserSchema);
  module.exports = User;
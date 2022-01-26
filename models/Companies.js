const database = require('../config/database');

const CompanySchema = new database.Schema({
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

  const Company = database.model('Companies', CompanySchema);
  module.exports = Company;
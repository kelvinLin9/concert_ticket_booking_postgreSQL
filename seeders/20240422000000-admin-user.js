'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    return queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      is_email_verified: true,
      oauth_providers: [],
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  }
}; 
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 添加 lastPasswordResetAttempt 字段到 users 表
    await queryInterface.addColumn('users', 'last_password_reset_attempt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // 回滾操作 - 刪除 lastPasswordResetAttempt 字段
    await queryInterface.removeColumn('users', 'last_password_reset_attempt');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. 添加新的 name 列
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. 遷移數據：將 first_name 和 last_name 合併到 name
    const users = await queryInterface.sequelize.query(
      'SELECT id, first_name, last_name FROM users',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const name = [firstName, lastName].filter(Boolean).join(' ');

      if (name) {
        await queryInterface.sequelize.query(
          'UPDATE users SET name = ? WHERE id = ?',
          {
            replacements: [name, user.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // 3. 移除舊列
    await queryInterface.removeColumn('users', 'first_name');
    await queryInterface.removeColumn('users', 'last_name');
  },

  async down (queryInterface, Sequelize) {
    // 1. 添加回舊列
    await queryInterface.addColumn('users', 'first_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'last_name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. 遷移數據：將 name 拆分回 first_name 和 last_name
    const users = await queryInterface.sequelize.query(
      'SELECT id, name FROM users',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      if (user.name) {
        const parts = user.name.trim().split(/\s+/);
        const firstName = parts[0] || null;
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;

        await queryInterface.sequelize.query(
          'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
          {
            replacements: [firstName, lastName, user.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // 3. 移除新列
    await queryInterface.removeColumn('users', 'name');
  }
};

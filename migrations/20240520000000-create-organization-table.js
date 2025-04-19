'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 創建新的organization表
    await queryInterface.createTable('organization', {
      organization_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      org_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      org_address: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      org_mail: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      org_contact: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      org_mobile: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      org_phone: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      org_website: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
        allowNull: false,
        defaultValue: 'active'
      },
      verification_status: {
        type: Sequelize.ENUM('unverified', 'pending', 'verified'),
        allowNull: false,
        defaultValue: 'unverified'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // 2. 從舊表遷移數據到新表
    await queryInterface.sequelize.query(`
      INSERT INTO organization (
        organization_id, 
        user_id, 
        org_name, 
        org_address, 
        org_website, 
        org_contact,
        status, 
        verification_status, 
        created_at, 
        updated_at
      ) 
      SELECT 
        id, 
        user_id, 
        company_name, 
        company_address, 
        website, 
        CAST(contact_person->>'name' AS VARCHAR(1000)), 
        status, 
        verification_status, 
        created_at, 
        updated_at 
      FROM organizers;
    `);

    // 3. 更新concerts表中的外鍵引用
    await queryInterface.renameColumn('concerts', 'organizer_id', 'organization_id');
    await queryInterface.sequelize.query(`
      ALTER TABLE concerts 
      DROP CONSTRAINT concerts_organizer_id_fkey, 
      ADD CONSTRAINT concerts_organization_id_fkey 
      FOREIGN KEY (organization_id) 
      REFERENCES organization(organization_id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);

    // 4. 創建索引
    await queryInterface.addIndex('organization', ['user_id']);
    await queryInterface.addIndex('organization', ['verification_status']);
    await queryInterface.addIndex('concerts', ['organization_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // 1. 恢復concerts表中的外鍵引用
    await queryInterface.sequelize.query(`
      ALTER TABLE concerts 
      DROP CONSTRAINT concerts_organization_id_fkey;
    `);
    await queryInterface.renameColumn('concerts', 'organization_id', 'organizer_id');
    
    // 2. 刪除新表
    await queryInterface.dropTable('organization');
    
    // 3. 恢復外鍵關係
    await queryInterface.sequelize.query(`
      ALTER TABLE concerts 
      ADD CONSTRAINT concerts_organizer_id_fkey 
      FOREIGN KEY (organizer_id) 
      REFERENCES organizers(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
  }
}; 
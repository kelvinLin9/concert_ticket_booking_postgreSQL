'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 創建用戶表
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'superuser'),
        allowNull: false,
        defaultValue: 'user'
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      preferred_regions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      preferred_event_types: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      verification_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      verification_token_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      password_reset_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_verification_attempt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      oauth_providers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
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

    // 創建組織者表
    await queryInterface.createTable('organizers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_person: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          name: '',
          email: '',
          phone: '',
          title: ''
        }
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
      created_concerts: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
        defaultValue: []
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

    // 創建場地表
    await queryInterface.createTable('venues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      region: {
        type: Sequelize.ENUM('north', 'south', 'east', 'central', 'offshore', 'overseas'),
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contact_info: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          name: '',
          email: '',
          phone: ''
        }
      },
      seating_chart: {
        type: Sequelize.STRING,
        allowNull: true
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

    // 創建音樂會表
    await queryInterface.createTable('concerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      concert_type: {
        type: Sequelize.ENUM('pop', 'rock', 'electronic', 'hip-hop', 'jazz-blues', 'classical', 'other'),
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'canceled', 'completed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      organizer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'venues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      total_tickets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sold_tickets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      region: {
        type: Sequelize.ENUM('north', 'south', 'east', 'central', 'offshore', 'overseas'),
        allowNull: false
      },
      featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // 創建票種表
    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      concert_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'concerts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      seat_info: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      sale_start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      sale_end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('available', 'sold-out', 'off-sale'),
        allowNull: false,
        defaultValue: 'available'
      },
      is_reserved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // 創建訂單表
    await queryInterface.createTable('orders', {
      id: {
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
      concert_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'concerts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'canceled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_info: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      tickets: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      purchase_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      contact_info: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // 創建支付表
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'TWD'
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refund_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      gateway_response: {
        type: Sequelize.JSONB,
        allowNull: true
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

    // 添加索引
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('organizers', ['user_id']);
    await queryInterface.addIndex('organizers', ['verification_status']);
    await queryInterface.addIndex('concerts', ['organizer_id']);
    await queryInterface.addIndex('concerts', ['venue_id']);
    await queryInterface.addIndex('concerts', ['status']);
    await queryInterface.addIndex('concerts', ['region']);
    await queryInterface.addIndex('tickets', ['concert_id']);
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['concert_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表格（注意順序與依賴關係）
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('tickets');
    await queryInterface.dropTable('concerts');
    await queryInterface.dropTable('venues');
    await queryInterface.dropTable('organizers');
    await queryInterface.dropTable('users');
  }
}; 
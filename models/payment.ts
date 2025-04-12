import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { Order } from './order';

@Table({
  tableName: 'payments',
  timestamps: true,
  paranoid: true
})
export class Payment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  orderId!: string;

  @BelongsTo(() => Order)
  order!: Order;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '支付方式為必填欄位'
      }
    }
  })
  paymentMethod!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '支付金額不能小於0'
      }
    }
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'TWD'
  })
  currency!: string;

  @Column({
    type: DataType.ENUM('pending', 'success', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  transactionId?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  paymentDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  refundDate?: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  refundAmount?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  gatewayResponse?: any;
}

export default Payment; 
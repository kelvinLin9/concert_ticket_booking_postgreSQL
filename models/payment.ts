import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { Order } from './order';

@Table({
  tableName: 'payments',
  timestamps: true,
  paranoid: false,
  underscored: true
})
export class Payment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'payment_id'
  })
  paymentId!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'order_id'
  })
  orderId!: string;

  @BelongsTo(() => Order)
  order!: Order;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'method'
  })
  method!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'provider'
  })
  provider!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'status'
  })
  status!: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  })
  amount!: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    defaultValue: 'TWD',
    field: 'currency'
  })
  currency!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'paid_at'
  })
  paidAt?: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'transaction_id'
  })
  transactionId?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    field: 'raw_payload'
  })
  rawPayload?: any;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at'
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'updated_at'
  })
  updatedAt!: Date;
}

export default Payment; 
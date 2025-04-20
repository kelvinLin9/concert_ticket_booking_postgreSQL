import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { User } from './user';
import { TicketType } from './ticketType';
import { Ticket } from './ticket';
import { Payment } from './payment';

@Table({
  tableName: 'orders',
  timestamps: true,
  paranoid: false,
  underscored: true
})
export class Order extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'order_id'
  })
  orderId!: string;

  @ForeignKey(() => TicketType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'ticket_type_id'
  })
  ticketTypeId!: string;

  @BelongsTo(() => TicketType, {
    onDelete: 'CASCADE',
    hooks: true
  })
  ticketType!: TicketType;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_id'
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'order_status'
  })
  orderStatus!: 'held' | 'expired' | 'paid' | 'cancelled' | 'refunded';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_locked'
  })
  isLocked!: boolean;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'lock_token'
  })
  lockToken!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'lock_expire_time'
  })
  lockExpireTime!: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'purchaser_name'
  })
  purchaserName!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'purchaser_email'
  })
  purchaserEmail!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'purchaser_phone'
  })
  purchaserPhone!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'invoice_platform'
  })
  invoicePlatform!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'invoice_type'
  })
  invoiceType!: 'donation' | 'mobile' | 'natural' | 'company';

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'invoice_carrier'
  })
  invoiceCarrier!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'invoice_status'
  })
  invoiceStatus!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'invoice_number'
  })
  invoiceNumber!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'invoice_url'
  })
  invoiceUrl!: string;

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

  @HasMany(() => Ticket)
  tickets!: Ticket[];

  @HasMany(() => Payment)
  payments!: Payment[];
}

export default Order; 
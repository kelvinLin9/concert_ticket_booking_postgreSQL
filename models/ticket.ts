import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './user';
import { Order } from './order';
import { TicketType } from './ticketType';

@Table({
  tableName: 'tickets',
  timestamps: true,
  paranoid: false,
  underscored: true
})
export class Ticket extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'ticket_id'
  })
  ticketId!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'order_id'
  })
  orderId!: string;

  @BelongsTo(() => Order)
  order!: Order;

  @ForeignKey(() => TicketType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'ticket_type_id'
  })
  ticketTypeId!: string;

  @BelongsTo(() => TicketType)
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
    type: DataType.STRING(100),
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
    type: DataType.STRING(20),
    allowNull: true,
    field: 'seat_number'
  })
  seatNumber!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'qr_code'
  })
  qrCode!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'status'
  })
  status!: 'purchased' | 'refunded' | 'used';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'purchase_time'
  })
  purchaseTime!: Date;
}

export default Ticket; 
import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { Concert } from './concert';
import { Order } from './order';
import { Ticket } from './ticket';

@Table({
  tableName: 'ticket_types',
  timestamps: true,
  paranoid: false,
  underscored: true
})
export class TicketType extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'ticket_type_id'
  })
  ticketTypeId!: string;

  @ForeignKey(() => Concert)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'concert_id'
  })
  concertId!: string;

  @BelongsTo(() => Concert)
  concert!: Concert;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'ticket_type_name'
  })
  ticketTypeName!: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: true,
    field: 'description'
  })
  description!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'entrance_type'
  })
  entranceType!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'ticket_benefits'
  })
  ticketBenefits!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'refund_policy'
  })
  refundPolicy!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'ticket_type_price'
  })
  ticketTypePrice!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'total_quantity'
  })
  totalQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'remaining_quantity'
  })
  remainingQuantity!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'sell_begin_date'
  })
  sellBeginDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'sell_end_date'
  })
  sellEndDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at'
  })
  createdAt!: Date;

  @HasMany(() => Order)
  orders!: Order[];

  @HasMany(() => Ticket)
  tickets!: Ticket[];
}

export default TicketType; 
import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { User } from './user';
import { Concert } from './concert';

interface ITicket {
  ticketId: string;
  name: string;
  price: number;
  quantity: number;
  seatInfo?: any;
}

interface IContactInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface IPaymentInfo {
  method: string;
  transactionId?: string;
  amount: number;
  status: string;
  paidAt?: Date;
}

@Table({
  tableName: 'orders',
  timestamps: true,
  paranoid: true
})
export class Order extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Concert)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  concertId!: string;

  @BelongsTo(() => Concert)
  concert!: Concert;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  orderNumber!: string;

  @Column({
    type: DataType.ENUM('pending', 'paid', 'canceled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  })
  status!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '訂單總金額不能小於0'
      }
    }
  })
  totalAmount!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  paymentInfo?: IPaymentInfo;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '票券資訊為必填欄位'
      }
    }
  })
  tickets!: ITicket[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  purchaseDate!: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '聯絡資訊為必填欄位'
      }
    }
  })
  contactInfo!: IContactInfo;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  notes?: string;
}

export default Order; 
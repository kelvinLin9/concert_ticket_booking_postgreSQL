import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { Concert } from './concert';

interface ISeatInfo {
  section?: string;
  row?: string;
  seatNumber?: string;
  floor?: string;
  area?: string;
}

@Table({
  tableName: 'tickets',
  timestamps: true,
  paranoid: true
})
export class Ticket extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

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
    validate: {
      notEmpty: {
        msg: '票種名稱為必填欄位'
      }
    }
  })
  name!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '票價不能小於0'
      }
    }
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '票種數量不能小於0'
      }
    }
  })
  quantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '已售數量不能小於0'
      }
    }
  })
  sold!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  seatInfo?: ISeatInfo;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  saleStartDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  saleEndDate!: Date;

  @Column({
    type: DataType.ENUM('available', 'sold-out', 'off-sale'),
    allowNull: false,
    defaultValue: 'available'
  })
  status!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isReserved!: boolean;
}

export default Ticket; 
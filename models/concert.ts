import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { Organizer } from './organizer';
import { Venue } from './venue';

@Table({
  tableName: 'concerts',
  timestamps: true,
  paranoid: true
})
export class Concert extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活動標題為必填欄位'
      }
    }
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活動描述為必填欄位'
      }
    }
  })
  description!: string;

  @Column({
    type: DataType.ENUM('流行音樂', '搖滾', '電子音樂', '嘻哈', '爵士藍調', '古典音樂', '其他'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活動類型為必填欄位'
      }
    }
  })
  concertType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: '活動圖片 URL 格式不正確'
      }
    }
  })
  image?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  startDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  endDate!: Date;

  @Column({
    type: DataType.ENUM('draft', 'published', 'canceled', 'completed'),
    allowNull: false,
    defaultValue: 'draft'
  })
  status!: string;

  @ForeignKey(() => Organizer)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  organizerId!: string;

  @BelongsTo(() => Organizer)
  organizer!: Organizer;

  @ForeignKey(() => Venue)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  venueId!: string;

  @BelongsTo(() => Venue)
  venue!: Venue;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '總票數不能小於0'
      }
    }
  })
  totalTickets!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '已售票數不能小於0'
      }
    }
  })
  soldTickets!: number;

  @Column({
    type: DataType.ENUM('北部', '南部', '東部', '中部', '離島', '海外'),
    allowNull: false
  })
  region!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  featured!: boolean;
}

export default Concert; 
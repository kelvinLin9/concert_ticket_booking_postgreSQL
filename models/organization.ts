import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { User } from './user';
import { Concert } from './concert';

@Table({
  tableName: 'organization',
  timestamps: true,
  paranoid: true
})
export class Organization extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  organizationId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '公司名稱為必填欄位'
      }
    }
  })
  orgName!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '公司地址為必填欄位'
      }
    }
  })
  orgAddress!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: '公司電子郵件格式不正確'
      }
    }
  })
  orgMail?: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: true
  })
  orgContact?: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true
  })
  orgMobile?: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true
  })
  orgPhone?: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    validate: {
      isUrl: {
        msg: '公司網站格式不正確'
      }
    }
  })
  orgWebsite?: string;

  @Column({
    type: DataType.ENUM('active', 'inactive', 'blocked'),
    allowNull: false,
    defaultValue: 'active'
  })
  status!: string;

  @Column({
    type: DataType.ENUM('unverified', 'pending', 'verified'),
    allowNull: false,
    defaultValue: 'unverified'
  })
  verificationStatus!: string;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => Concert)
  concerts!: Concert[];
}

export default Organization; 
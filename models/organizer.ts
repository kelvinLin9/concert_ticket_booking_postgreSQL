import {
  Table, Column, Model, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './user';

interface IContactPerson {
  name: string;
  email: string;
  phone: string;
  title: string;
}

@Table({
  tableName: 'organizers',
  timestamps: true,
  paranoid: true
})
export class Organizer extends Model {
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
        msg: '公司名稱為必填欄位'
      }
    }
  })
  companyName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '公司地址為必填欄位'
      }
    }
  })
  companyAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: '公司網站格式不正確'
      }
    }
  })
  website?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {
      name: '',
      email: '',
      phone: '',
      title: ''
    },
    validate: {
      notEmpty: {
        msg: '聯絡人資訊為必填欄位'
      }
    }
  })
  contactPerson!: IContactPerson;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

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

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: true,
    defaultValue: []
  })
  createdConcerts?: string[];
}

export default Organizer; 
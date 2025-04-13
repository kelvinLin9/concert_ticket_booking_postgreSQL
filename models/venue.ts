import {
  Table, Column, Model, DataType, HasMany
} from 'sequelize-typescript';

interface IContactInfo {
  name: string;
  email: string;
  phone: string;
}

@Table({
  tableName: 'venues',
  timestamps: true,
  paranoid: true
})
export class Venue extends Model {
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
        msg: '場地名稱為必填欄位'
      }
    }
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '場地地址為必填欄位'
      }
    }
  })
  address!: string;

  @Column({
    type: DataType.ENUM('北部', '南部', '東部', '中部', '離島', '海外'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '區域為必填欄位'
      }
    }
  })
  region!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: '場地容量必須大於0'
      }
    }
  })
  capacity!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {
      name: '',
      email: '',
      phone: ''
    }
  })
  contactInfo?: IContactInfo;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: '座位圖 URL 格式不正確'
      }
    }
  })
  seatingChart?: string;
}

export default Venue; 
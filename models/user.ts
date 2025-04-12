import {
  Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasMany
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface IOAuthProvider {
  provider: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email 格式不正確'
      }
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [6, 100],
        msg: '密碼至少需要 6 個字元以上'
      }
    }
  })
  password?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [1, 20],
        msg: '名字不能超過20個字符'
      }
    }
  })
  firstName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [1, 20],
        msg: '姓氏不能超過20個字符'
      }
    }
  })
  lastName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [1, 20],
        msg: '暱稱不能超過20個字符'
      }
    }
  })
  nickname?: string;

  @Column({
    type: DataType.ENUM('user', 'admin', 'superuser'),
    allowNull: false,
    defaultValue: 'user'
  })
  role!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9]{10}$/,
        msg: '手機號碼格式不正確'
      }
    }
  })
  phone?: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true
  })
  birthday?: Date;

  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
    allowNull: true
  })
  gender?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: []
  })
  preferredRegions?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: []
  })
  preferredEventTypes?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  country?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  address?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: '頭像 URL 格式不正確'
      }
    }
  })
  avatar?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  verificationToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  verificationTokenExpires?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isEmailVerified!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  passwordResetToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  passwordResetExpires?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lastVerificationAttempt?: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  oauthProviders!: IOAuthProvider[];

  // 實例方法
  hasOAuthProvider(provider: string): boolean {
    return this.oauthProviders.some(p => p.provider === provider);
  }

  addOAuthProvider(
    provider: string,
    providerId: string,
    accessToken: string,
    refreshToken: string,
    tokenExpiresAt: Date
  ): void {
    const existingProvider = this.oauthProviders.find(
      p => p.provider === provider && p.providerId === providerId
    );

    if (existingProvider) {
      existingProvider.accessToken = accessToken;
      existingProvider.refreshToken = refreshToken;
      existingProvider.tokenExpiresAt = tokenExpiresAt;
    } else {
      this.oauthProviders.push({
        provider,
        providerId,
        accessToken,
        refreshToken,
        tokenExpiresAt
      });
    }
  }

  async createVerificationToken(): Promise<{ token: string, code: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位數驗證碼

    this.verificationToken = token;
    this.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘後過期
    this.lastVerificationAttempt = new Date();
    await this.save({ fields: ['verificationToken', 'verificationTokenExpires', 'lastVerificationAttempt'] });

    return { token, code };
  }

  async createPasswordResetToken(): Promise<{ token: string, code: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位數驗證碼

    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘後過期
    await this.save({ fields: ['passwordResetToken', 'passwordResetExpires'] });

    return { token, code };
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    // @ts-ignore
    if (instance.changed('password') && instance.password) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export default User;

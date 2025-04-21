/**
 * User 模型 - 使用 Sequelize ORM
 * 
 * 本文件定義使用者實體及其行為。
 * 
 * 若遷移至 TypeORM，需要將此模型重構為:
 * 1. 使用 @Entity() 代替 @Table()
 * 2. 使用 @PrimaryGeneratedColumn() 代替 @Column() 作為主鍵
 * 3. 關聯使用 @OneToMany(), @ManyToOne() 等代替 HasMany 
 * 4. 生命週期鉤子使用 @BeforeInsert(), @BeforeUpdate() 等裝飾器
 * 5. 轉換為 Repository 模式而非靜態方法
 */

import {
  Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasMany
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * OAuth 提供者介面
 * TypeORM 中可以定義為嵌套實體或獨立實體
 */
interface IOAuthProvider {
  provider: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

/**
 * 使用者模型 - 定義資料庫表結構和行為
 */
@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true // 軟刪除功能 (TypeORM 使用 @DeleteDateColumn 實現)
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string; // TypeORM: @PrimaryGeneratedColumn("uuid")

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
  email!: string; // TypeORM: @Column({ unique: true })

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 100],
        msg: '密碼至少需要 8 個字元以上'
      }
    }
  })
  password!: string; // TypeORM: @Column({ select: false }) 可隱藏敏感欄位

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [20, 50],
        msg: '姓名必須介於20到50個字符之間'
      }
    }
  })
  name!: string; // TypeORM: @Column()

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [1, 40],
        msg: '暱稱不能超過40個字符'
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
    defaultValue: [],
    comment: '可選值: 北部, 南部, 東部, 中部, 離島, 海外'
  })
  preferredRegions?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
    comment: '可選值: 流行音樂, 搖滾, 電子音樂, 嘻哈, 爵士藍調, 古典音樂, 其他'
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
    type: DataType.DATE,
    allowNull: true
  })
  lastPasswordResetAttempt?: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  oauthProviders!: IOAuthProvider[]; // TypeORM: 可使用 @OneToMany() 關聯到獨立實體

  /**
   * 檢查用戶是否有特定 OAuth 提供者
   * TypeORM: 可以在 Repository 或實體方法中實現
   */
  hasOAuthProvider(provider: string): boolean {
    return this.oauthProviders.some(p => p.provider === provider);
  }

  /**
   * 添加或更新 OAuth 提供者信息
   * TypeORM: 可以使用 Repository 方法實現，或擴展實體 
   */
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

  /**
   * 創建電子郵件驗證令牌
   * TypeORM: 可以使用實體實例方法或在服務層實現
   */
  async createVerificationToken(): Promise<{ token: string, code: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位數驗證碼

    this.verificationToken = token;
    this.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘後過期
    this.lastVerificationAttempt = new Date();
    await this.save({ fields: ['verificationToken', 'verificationTokenExpires', 'lastVerificationAttempt'] });

    return { token, code };
  }

  /**
   * 創建密碼重置令牌
   * TypeORM: 可以使用實體實例方法或在服務層實現
   */
  async createPasswordResetToken(): Promise<{ token: string, code: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位數驗證碼

    this.passwordResetToken = code; // 保存 code 而不是 token
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘後過期
    this.lastPasswordResetAttempt = new Date(); // 記錄本次嘗試時間
    await this.save({ fields: ['passwordResetToken', 'passwordResetExpires', 'lastPasswordResetAttempt'] });

    return { token, code };
  }

  /**
   * 密碼加密處理 - 生命週期鉤子
   * TypeORM: 使用 @BeforeInsert() 和 @BeforeUpdate() 裝飾器
   */
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    // @ts-ignore
    if (instance.changed('password') && instance.password) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(String(instance.password), salt);
    }
  }

  /**
   * 比較密碼是否匹配
   * TypeORM: 可以實現為實體方法
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export default User;

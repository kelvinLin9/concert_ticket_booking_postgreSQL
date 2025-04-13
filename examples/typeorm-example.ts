// /**
//  * TypeORM 遷移示例 - User 實體
//  * 
//  * 本文件提供了從 Sequelize 遷移到 TypeORM 的參考示例。
//  * 實際使用時需根據專案具體情況調整。
//  */

// // 為Express Request擴展用戶屬性
// declare global {
//   namespace Express {
//     interface User {
//       id: string;
//       [key: string]: any;
//     }
//   }
// }

// // 實體定義示例
// import { 
//   Entity, 
//   PrimaryGeneratedColumn, 
//   Column, 
//   CreateDateColumn, 
//   UpdateDateColumn, 
//   DeleteDateColumn,
//   BeforeInsert,
//   BeforeUpdate,
//   OneToMany,
//   DataSource
// } from 'typeorm';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';
// import { Request, Response } from 'express';
// import { config } from 'dotenv';

// // OAuth提供者實體
// @Entity()
// export class OAuthProvider {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   provider: string;

//   @Column()
//   providerId: string;

//   @Column({ nullable: true })
//   accessToken?: string;

//   @Column({ nullable: true })
//   refreshToken?: string;

//   @Column({ nullable: true })
//   tokenExpiresAt?: Date;

//   @Column()
//   userId: string;
// }

// // 使用者實體
// @Entity({ name: 'users' })
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ unique: true })
//   email: string;

//   @Column({ nullable: true, select: false }) // select: false 預設不查詢此欄位，增加安全性
//   password?: string;

//   @Column({ nullable: true })
//   name?: string;

//   @Column({ nullable: true, length: 20 })
//   nickname?: string;

//   @Column({ 
//     type: 'enum', 
//     enum: ['user', 'admin', 'superuser'], 
//     default: 'user' 
//   })
//   role: string;

//   @Column({ nullable: true })
//   phone?: string;

//   @Column({ type: 'date', nullable: true })
//   birthday?: Date;

//   @Column({ 
//     type: 'enum', 
//     enum: ['male', 'female', 'other'],
//     nullable: true 
//   })
//   gender?: string;

//   @Column('simple-array', { nullable: true, default: [] })
//   preferredRegions: string[];

//   @Column('simple-array', { nullable: true, default: [] })
//   preferredEventTypes: string[];

//   @Column({ nullable: true })
//   country?: string;

//   @Column({ nullable: true })
//   address?: string;

//   @Column({ nullable: true })
//   avatar?: string;

//   @Column({ nullable: true })
//   verificationToken?: string;

//   @Column({ nullable: true })
//   verificationTokenExpires?: Date;

//   @Column({ default: false })
//   isEmailVerified: boolean;

//   @Column({ nullable: true })
//   passwordResetToken?: string;

//   @Column({ nullable: true })
//   passwordResetExpires?: Date;

//   @Column({ nullable: true })
//   lastVerificationAttempt?: Date;

//   @Column({ nullable: true })
//   lastPasswordResetAttempt?: Date;

//   @OneToMany(() => OAuthProvider, (oauthProvider: OAuthProvider) => oauthProvider.userId, {
//     eager: true, // 自動載入關聯數據
//     cascade: true // 自動保存關聯實體
//   })
//   oauthProviders: OAuthProvider[];

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @DeleteDateColumn()
//   deletedAt?: Date; // 軟刪除

//   // 實體方法

//   hasOAuthProvider(provider: string): boolean {
//     return this.oauthProviders.some(p => p.provider === provider);
//   }

//   // 密碼加密 - 生命週期鉤子
//   @BeforeInsert()
//   @BeforeUpdate()
//   async hashPassword() {
//     if (this.password) {
//       const salt = await bcrypt.genSalt(10);
//       this.password = await bcrypt.hash(this.password, salt);
//     }
//   }

//   async comparePassword(candidatePassword: string): Promise<boolean> {
//     if (!this.password) return false;
//     return bcrypt.compare(candidatePassword, this.password);
//   }
// }

// /**
//  * TypeORM 數據庫配置示例
//  */

// // 數據源配置
// config();

// // 創建數據源
// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   url: process.env.DATABASE_URL,
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   synchronize: process.env.NODE_ENV === 'development', // 開發環境下自動同步
//   logging: process.env.NODE_ENV === 'development',
//   entities: [User, OAuthProvider],
//   migrations: ['dist/migrations/**/*.js'],
//   subscribers: ['dist/subscribers/**/*.js'],
//   ssl: process.env.DATABASE_URL ? {
//     rejectUnauthorized: false
//   } : false
// });

// /**
//  * 連接和初始化數據庫
//  */
// export const connectDatabase = async () => {
//   try {
//     await AppDataSource.initialize();
//     console.log('數據庫連接成功');
//   } catch (error) {
//     console.error('數據庫連接失敗:', error);
//     throw new Error('數據庫連接失敗');
//   }
// };

// /**
//  * 控制器示例 - 使用 Repository 模式
//  */
// export const updateUserProfile = async (req: Request, res: Response) => {
//   try {
//     // Check if req.user exists before accessing its properties
//     if (!req.user) {
//       return res.status(401).json({
//         status: 'failed',
//         message: '未授權'
//       });
//     }
    
//     const userId = req.user.id; // Now req.user is definitely not undefined
//     const userRepository = AppDataSource.getRepository(User);
    
//     // 獲取用戶
//     const user = await userRepository.findOneBy({ id: userId });
//     if (!user) {
//       return res.status(404).json({
//         status: 'failed',
//         message: '找不到該使用者'
//       });
//     }
    
//     // 更新用戶資料
//     userRepository.merge(user, req.body);
//     const updatedUser = await userRepository.save(user);
    
//     return res.status(200).json({
//       status: 'success',
//       message: '成功修改用戶資料',
//       data: { user: updatedUser }
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: 'error',
//       message: '更新用戶資料失敗'
//     });
//   }
// }; 
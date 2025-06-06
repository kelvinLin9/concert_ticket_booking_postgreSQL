import validator from 'validator';
import nodemailer from 'nodemailer';
import { User } from '../models';
import { generateEmailToken } from '../utils/index';
import { Request, Response, NextFunction } from 'express';

export const checkEmailExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email;

    if (!validator.isEmail(email)) {
      throw new Error('Email 格式不正確');
    }

    const result = await User.findOne({
      where: { email }
    });

    res.send({
      status: true,
      result: {
        isEmailExists: Boolean(result)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email;
    const { code, token } = generateEmailToken();

    const user = await User.findOne({
      where: { email }
    });

    if (user) {
      user.verificationToken = token;
      await user.save();

      const transporter = await getTransporter();

      await transporter.sendMail({
        from: process.env.EMAILER_USER,
        to: email,
        subject: 'Node 驗證碼',
        html: `<p>使用 ${code} 做為 Node 帳戶密碼安全性驗證碼</p>`
      });
    }

    res.send({
      status: true
    });
  } catch (error) {
    next(error);
  }
};

const getTransporter = async () => {
  const { EMAILER_USER, EMAILER_PASSWORD } = process.env;

  if (!EMAILER_USER || !EMAILER_PASSWORD) {
    throw new Error('Email 服務未啟用');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAILER_USER,
      pass: EMAILER_PASSWORD
    }
  });

  await transporter.verify();

  return transporter;
};

import sequelize from '../config/database';
import { User } from './user';
import { Organizer } from './organizer';
import { Venue } from './venue';
import { Concert } from './concert';
import { Ticket } from './ticket';
import { Order } from './order';
import { Payment } from './payment';

// 註冊所有模型
const models = [
  User,
  Organizer,
  Venue,
  Concert,
  Ticket,
  Order,
  Payment
];

sequelize.addModels(models);

export {
  User,
  Organizer,
  Venue,
  Concert,
  Ticket,
  Order,
  Payment
};

export default {
  sequelize,
  User,
  Organizer,
  Venue,
  Concert,
  Ticket,
  Order,
  Payment
}; 
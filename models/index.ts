import sequelize from '../config/database';
import { User } from './user';
import { Organization } from './organization';
import { Venue } from './venue';
import { Concert } from './concert';
import { Ticket } from './ticket';
import { Order } from './order';
import { Payment } from './payment';
import { TicketType } from './ticketType';

// 註冊所有模型
const models = [
  User,
  Organization,
  Venue,
  Concert,
  TicketType,
  Ticket,
  Order,
  Payment
];

sequelize.addModels(models);

export {
  User,
  Organization,
  Venue,
  Concert,
  TicketType,
  Ticket,
  Order,
  Payment
};

export default {
  sequelize,
  User,
  Organization,
  Venue,
  Concert,
  TicketType,
  Ticket,
  Order,
  Payment
}; 
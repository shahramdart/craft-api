import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize({
  database: process.env.DATABASE,
  host: process.env.HOST,
  dialect: "mysql",
  password: process.env.PASSWORD,
  username: process.env.USER,
  port: process.env.PORT_DB,
});

export default db;

import { Sequelize } from "sequelize";

const db = new Sequelize("bako-phone", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;

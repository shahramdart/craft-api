import { Sequelize } from "sequelize";

const db = new Sequelize("mobile-ranya", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;

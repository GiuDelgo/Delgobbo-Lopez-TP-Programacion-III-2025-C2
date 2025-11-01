const { Sequelize } = require("sequelize");

const stringDb = process.env.STRING_DB;

const sequelize = new Sequelize(stringDb, { dialect: "mysql" });

sequelize.sync({ alter: true });

module.exports = sequelize;
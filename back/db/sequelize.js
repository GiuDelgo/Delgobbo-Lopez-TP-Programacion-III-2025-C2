const { Sequelize } = require("sequelize");
const path = require("path");

// Ruta al archivo de base de datos SQLite
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false 
});

console.log('Conectando a SQLite en:', dbPath);

module.exports = sequelize;
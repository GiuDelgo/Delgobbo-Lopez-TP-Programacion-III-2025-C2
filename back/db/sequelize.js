const { Sequelize } = require("sequelize");
const path = require("path");

// Detectar si estamos en producción (PostgreSQL) o desarrollo (SQLite)
const DATABASE_URL = process.env.DATABASE_URL; // Render proporciona esto automáticamente para PostgreSQL

let sequelize;

if (DATABASE_URL) {
    // Producción: Usar PostgreSQL de Render
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
    console.log('Conectando a PostgreSQL (producción)...');
} else {
    // Desarrollo: Usar SQLite local
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: dbPath,
        logging: false 
    });
    console.log('Conectando a SQLite (desarrollo) en:', dbPath);
}

module.exports = sequelize;
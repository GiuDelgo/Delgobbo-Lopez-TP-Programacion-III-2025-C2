const { Sequelize } = require("sequelize");
const path = require("path");

// Detectar si estamos en producción (PostgreSQL) o desarrollo (SQLite)
const DATABASE_URL = process.env.DATABASE_URL; // Render proporciona esto automáticamente para PostgreSQL

// Debug: Verificar si DATABASE_URL está disponible
console.log('DATABASE_URL disponible:', DATABASE_URL ? 'Sí' : 'No');
if (DATABASE_URL) {
    console.log('DATABASE_URL (primeros 50 chars):', DATABASE_URL.substring(0, 50) + '...');
}

let sequelize;

if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
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
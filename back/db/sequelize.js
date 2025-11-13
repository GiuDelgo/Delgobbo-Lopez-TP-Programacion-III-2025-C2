const { Sequelize } = require("sequelize");

const stringDb = process.env.STRING_DB;

if (!stringDb) {
    console.error('La variable de entorno STRING_DB no está configurada');
    console.log('Crea un archivo .env en la carpeta back/ con:');
    console.log('STRING_DB=mysql://usuario:contraseña@localhost:3306/nombre_base_datos');
    process.exit(1);
}

const sequelize = new Sequelize(stringDb, { 
    dialect: "mysql",
    logging: false 
});

console.log('Conectando a MySQL...');

module.exports = sequelize;
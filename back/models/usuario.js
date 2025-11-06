const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const Usuario = sequelize.define(
    "Usuario",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        contraseña: {
            type: DataTypes.TEXT,
            allowNull: false,
        }        
    },
    {
        tableName: "usuario",
    }
    );

module.exports = Usuario;
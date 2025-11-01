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
        nombreUsuario: {
            type: DataTypes.TEXT,
            allowNull: false,
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
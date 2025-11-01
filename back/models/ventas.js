const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const Venta = sequelize.define(
    "Venta",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombreCliente: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
        }        
    },
    {
        tableName: "venta",
    }
    );

module.exports = Venta;
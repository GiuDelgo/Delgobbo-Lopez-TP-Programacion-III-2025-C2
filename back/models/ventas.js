const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");
//Producto requiere prodcuto

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
        } ,        
        precioTotal: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }      
    },
    {
        tableName: "venta",
    }
);

module.exports = Venta;
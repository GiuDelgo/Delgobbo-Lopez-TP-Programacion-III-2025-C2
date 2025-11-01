const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const DetalleVenta = sequelize.define(
    "DetalleVenta",
    {
        cantidadProducto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        precioUnitario: { 
            type: DataTypes.FLOAT,
            allowNull: false
        },
        subtotal: { 
            type: DataTypes.FLOAT,
            allowNull: true
        }
    },
    {
        tableName: "detalleVenta",
    }
    );

module.exports = DetalleVenta;
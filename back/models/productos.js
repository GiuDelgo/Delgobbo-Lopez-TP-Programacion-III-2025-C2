const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // --- ATRIBUTOS COMUNES ---
    nombre: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    marca: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    precio: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    
    // --- COLUMNA DISCRIMINADORA (CLAVE) ---
    // Indica si es 'Pesa', 'Suplemento', 'Ropa', etc.
    tipo_producto: { 
        type: DataTypes.ENUM('Pesa', 'Suplemento'),
        allowNull: false 
    },
    
    // --- ATRIBUTOS VARIABLES (NULLABLES) ---
    // Corresponde a las Pesas, será NULL para Suplementos
    peso: { 
        type: DataTypes.FLOAT,
        allowNull: true // Debe ser NULLABLE
    },
    // Corresponde a los Suplementos, será NULL para Pesas
    cantidad_gramos_ml: { 
        type: DataTypes.FLOAT,
        allowNull: true // Debe ser NULLABLE
    },
    
    // --- CAMPOS ADICIONALES PARA EL PANEL ADMIN ---
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    imagen: {
        type: DataTypes.TEXT,
        allowNull: true
    }
    
}, {
    tableName: 'producto'
});

module.exports = Producto;




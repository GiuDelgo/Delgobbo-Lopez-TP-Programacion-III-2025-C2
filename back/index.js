require('dotenv').config();
const express = require("express");
const app = express();
const cors = require ("cors");
const sequelize = require("./db/sequelize");


const usuarioRoutes = require("./routes/usuario.routes");
const productosRoutes = require("./routes/productos.routes");
const ventasRoutes = require("./routes/ventas.routes");

app.use(express.json());
app.use(
    cors({
        origin: process.env.ORIGIN, 
    })
);

app.use("/usuario", usuarioRoutes);
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);

const { Venta, Producto } = require("./models/relaciones");
const Usuario = require("./models/usuario");

sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // 🛑 AHORA SÍ, LLAMAR A SYNC AQUÍ 🛑
        // { alter: true } aplica cambios a las tablas existentes sin borrarlas.
        return sequelize.sync({ alter: true }); 
    })
    .then(() => {
        console.log('Modelos sincronizados con la base de datos.');
        
        // Iniciar Express solo si la DB está lista
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor corriendo en el puerto ${process.env.PORT || 3000}`);
        });
    })
    .catch(err => {
        console.error('Error al iniciar o sincronizar la base de datos:', err);
    });

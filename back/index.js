require('dotenv').config();
const express = require("express");
const app = express();
const cors = require ("cors");
const path = require("path");
const session = require("express-session");
const sequelize = require("./db/sequelize");


const usuarioRoutes = require("./routes/usuario.routes");
const productosRoutes = require("./routes/productos.routes");
const ventasRoutes = require("./routes/ventas.routes");
const adminRoutes = require("./routes/admin.routes");

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para procesar formularios
app.use(
    cors({
        origin: process.env.ORIGIN, 
    })
);

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi-secreto-super-seguro-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // true solo si usas HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/admin", adminRoutes);

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

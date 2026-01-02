require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const sequelize = require("./db/sequelize");

// Seteo el motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parseo del body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Normalizar el origen removiendo barras finales para evitar problemas
const allowedOrigin = process.env.ORIGIN ? process.env.ORIGIN.replace(/\/$/, '') : '*';
app.use(cors({ 
    origin: allowedOrigin,
    credentials: true
}));

// Sesiones (middleware auth)
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi-secreto-super-seguro-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// Carpetas estáticas
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Rutas
const usuarioRoutes = require("./routes/usuario.routes");
const productosRoutes = require("./routes/productos.routes");
const ventasRoutes = require("./routes/ventas.routes");
const adminRoutes = require("./routes/admin.routes");

app.use("/usuario", usuarioRoutes);
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/admin", adminRoutes);

// Conexión a la BD y arranque del servidor
const Usuario = require("./models/usuario");
const bcrypt = require('bcrypt');

//Carga de relaciones antes de iniciar la BD
require("./models/relaciones"); 

sequelize.sync({force: false})//si sequelize se conecta a la BD: crea usr admin o lo busca, y levanta el servidor en puerto 3000
    .then(async () => {
        console.log('Base de datos sincronizada.');
        
        // Crear usuario admin si no existe
        const adminExistente = await Usuario.findOne({ where: { correo: 'admin@papota.com' } });
        if (!adminExistente) {
            const passHasheada = await bcrypt.hash('admin123', 10);
            await Usuario.create({
                nombre: 'Administrador',
                correo: 'admin@papota.com',
                contraseña: passHasheada
            });
            console.log('Usuario admin creado.');
        }
    })
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor en http://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch(err => {
        console.error('Error:', err);
    });


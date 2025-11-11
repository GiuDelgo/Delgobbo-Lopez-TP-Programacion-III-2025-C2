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


// EJS  motor de plantillas
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

// archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/admin", adminRoutes);

const { Venta, Producto } = require("./models/relaciones");
const Usuario = require("./models/usuario");
const bcrypt = require('bcrypt');

sequelize.authenticate()
    .then(() => {
        console.log('🔗 Conexión a la base de datos establecida correctamente.');
        
        return sequelize.sync(); 
    })
    .then(async () => {
        console.log('Modelos sincronizados con la base de datos.');
        
        // Crea usuario admin si no existe
        try {
            const adminCorreo = 'admin@papota.com';
            const adminPassword = 'admin123';
            
            const adminExistente = await Usuario.findOne({ where: { correo: adminCorreo } });
            
            if (!adminExistente) {
                // Hashea la contraseña
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                
                // Crea el usuario admin
                await Usuario.create({
                    nombre: 'Administrador',
                    correo: adminCorreo,
                    contraseña: hashedPassword
                });
                
                console.log('Usuario admin creado correctamente.');
            } 
        } catch (error) {
            console.error('Error al crear/verificar usuario admin:', error);
        }

        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
            console.log(`Panel admin: http://localhost:${process.env.PORT || 3000}/admin/login`);
        });
    })
    .catch(err => {
        console.error('Error al iniciar o sincronizar la base de datos:', err);
    });


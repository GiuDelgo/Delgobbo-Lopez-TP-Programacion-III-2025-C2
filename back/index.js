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
const bcrypt = require('bcrypt');

// ========================================
// FUNCIÓN PARA CREAR USUARIO ADMIN AUTOMÁTICAMENTE
// ========================================
async function crearUsuarioAdminSiNoExiste() {
    try {
        const correoAdmin = 'admin@papota.com';
        
        // Verificar si ya existe el usuario admin
        const adminExistente = await Usuario.findOne({ where: { correo: correoAdmin } });
        
        if (!adminExistente) {
            // Si no existe, crearlo
            const contraseñaHasheada = await bcrypt.hash('admin123', 10);
            await Usuario.create({
                nombre: 'Admin',
                correo: correoAdmin,
                contraseña: contraseñaHasheada
            });
            console.log('✅ Usuario administrador creado automáticamente');
            console.log('   📧 Correo: admin@papota.com');
            console.log('   🔐 Contraseña: admin123');
        } else {
            console.log('✅ Usuario administrador ya existe');
        }
    } catch (error) {
        console.error('⚠️  Error al crear usuario admin:', error.message);
    }
}

sequelize.authenticate()
    .then(() => {
        console.log('🔗 Conexión a la base de datos establecida correctamente.');
        
        // 🛑 AHORA SÍ, LLAMAR A SYNC AQUÍ 🛑
        // { alter: true } aplica cambios a las tablas existentes sin borrarlas.
        return sequelize.sync({ alter: true }); 
    })
    .then(() => {
        console.log('📊 Modelos sincronizados con la base de datos.');
        
        // Crear usuario admin automáticamente
        return crearUsuarioAdminSiNoExiste();
    })
    .then(() => {
        // Iniciar Express solo si la DB está lista
        app.listen(process.env.PORT || 3000, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
            console.log(`🔐 Panel admin: http://localhost:${process.env.PORT || 3000}/admin/login`);
        });
    })
    .catch(err => {
        console.error('❌ Error al iniciar o sincronizar la base de datos:', err);
    });

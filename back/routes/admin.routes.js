const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/admin.controller');

// Configuro Multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "imagenes/");
    },
    filename: (req, file, callback) => {
        const [tipo, extension] = file.mimetype.split("/");
        if (tipo !== "image") {
            callback(new Error("Solo imágenes"));
        } else {
            const nombre = file.originalname + "-" + Date.now() + "." + extension;
            callback(null, nombre);
        }
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const tiposPermitidos = /jpg|jpeg|png/;
        const tipo = file.mimetype.split("/")[1];
        if (tiposPermitidos.test(tipo)) {
            callback(null, true);
        } else {
            callback(new Error("Solo jpg, jpeg o png"));
        }
    }
});

// Middleware de autenticación
function verificarAuth(req, res, next) {
    if (req.session && req.session.usuarioId) { //comprueba que la sesión existe y que usuarioId tiene valor asignado
        return next();
    }
    res.redirect('/admin/login');
}

// Rutas públicas
router.get('/login', adminController.mostrarLogin);
router.post('/login', adminController.procesarLogin);
router.get('/logout', adminController.logout);

// Rutas protegidas
router.get('/dashboard', verificarAuth, adminController.mostrarDashboard);
router.get('/producto/nuevo', verificarAuth, adminController.mostrarFormulario);
router.get('/producto/editar/:id', verificarAuth, adminController.mostrarFormulario);
router.post('/producto/guardar', verificarAuth, upload.single("imgProducto"), adminController.guardarProducto);
router.post('/producto/guardar/:id', verificarAuth, upload.single("imgProducto"), adminController.guardarProducto);
router.post('/producto/:id/cambiar-estado', verificarAuth, adminController.cambiarEstado);//Falta implementar

module.exports = router;




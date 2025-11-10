const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "imagenes/");
    },
    filename: function (req, file, callback) {
        const mimetype = file.mimetype;
        const [tipo, extension] = mimetype.split("/"); // ["image", "jpeg"]
        if (tipo !== "image") {
        callback(new Error("Documento no permitido"));
        } else {
        const nombre = file.originalname + "-" + Date.now() + "." + extension;
        callback(null, nombre);
        }
    },
});

const upload = multer({storage: storage, 

    fileFilter: (req,file, callback)=>{

        const tiposPermitidos =/jpg|jpeg|png/;

        const tipo = file.mimetype.split("/")[1];

        const esImagen = tiposPermitidos.test(tipo);

        if (esImagen){
            callback(null, true);
        }else{
            callback(new Error ("Documento no permitido"));
        }
    }
});

const adminController = require('../controllers/admin.controller');

// Middleware para verificar autenticación
function verificarAutenticacion(req, res, next) {
    if (req.session && req.session.usuarioId) {
        return next();
    }
    res.redirect('/admin/login');
}

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================
router.get('/login', adminController.mostrarLogin);
router.post('/login', adminController.procesarLogin);
router.get('/logout', adminController.logout);

// ========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ========================================
router.get('/dashboard', verificarAutenticacion, adminController.mostrarDashboard);
router.get('/producto/nuevo', verificarAutenticacion, adminController.mostrarFormulario);
router.get('/producto/editar/:id', verificarAutenticacion, adminController.mostrarFormulario);
router.post('/producto/guardar', verificarAutenticacion, upload.single("imgProducto"),adminController.guardarProducto);
router.post('/producto/guardar/:id', verificarAutenticacion, upload.single("imgProducto"), adminController.guardarProducto);
router.post('/producto/:id/cambiar-estado', verificarAutenticacion, adminController.cambiarEstado);

module.exports = router;




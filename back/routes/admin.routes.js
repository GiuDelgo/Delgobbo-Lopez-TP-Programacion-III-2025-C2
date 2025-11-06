const express = require('express');
const router = express.Router();
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
router.post('/producto/guardar', verificarAutenticacion, adminController.guardarProducto);
router.post('/producto/guardar/:id', verificarAutenticacion, adminController.guardarProducto);
router.post('/producto/:id/cambiar-estado', verificarAutenticacion, adminController.cambiarEstado);

module.exports = router;




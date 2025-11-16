const router = require('express').Router();
const ctrl = require('../controllers/ventas.controller');
const { verificarProductosActivos } = require('../middlewares/productos.mw');


router.post('/', verificarProductosActivos, ctrl.registrarVenta); 
router.post('/descargar_ticket', ctrl.descargarTicket); 
router.get('/', ctrl.listarVentasDetalle); 

//router.get('/:id', VentaController.obtenerPorId);

module.exports = router;
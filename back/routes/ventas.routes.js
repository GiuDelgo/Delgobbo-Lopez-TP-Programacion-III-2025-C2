const router = require('express').Router();
const ctrl = require('../controllers/ventas.controller');


router.post('/', ctrl.registrarVenta); 
router.get('/', ctrl.listarVentasDetalle); 

//router.get('/:id', VentaController.obtenerPorId);

module.exports = router;
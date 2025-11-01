const router = require('express').Router();
const ctrl = require('../controllers/productos.controller');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.patch('/:id/estado', ctrl.cambiarEstado);

module.exports = router;

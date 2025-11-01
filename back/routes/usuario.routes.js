const router = require('express').Router();
const ctrl = require('../controllers/usuario.controller');

router.post('/', ctrl.crear);
router.get('/', ctrl.listar);

module.exports = router;

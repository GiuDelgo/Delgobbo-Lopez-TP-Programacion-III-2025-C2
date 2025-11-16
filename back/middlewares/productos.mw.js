const Producto = require('../models/productos');


const verificarProductosActivos = async (req, res, next) => {
    const carritoDeCompras = req.body.carritoDeCompras;
    
    if (!carritoDeCompras || carritoDeCompras.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío.' });
    }

    try {
        
        let hayProductoInactivo = false;
        let productoInactivo = null;

        for (let i = 0; i < carritoDeCompras.length; i++) {
            const item = carritoDeCompras[i];
            const idProducto = item.producto.id;
            
            
            const producto = await Producto.findByPk(idProducto);
            
            
            if (!producto) {
                return res.status(404).json({ 
                    error: 'Producto no encontrado.',
                    productoId: idProducto 
                });
            }
            
            if (producto.activo === false) {
                hayProductoInactivo = true;
                productoInactivo = producto.nombre;
                break;
            }
        }

        
        if (hayProductoInactivo) {
            return res.status(400).json({ 
                error: 'No se puede procesar la compra. Hay productos desactivados en el carrito.',
                producto: productoInactivo
            });
        }

        
        next();

    } catch (error) {
        console.error('Error al verificar productos:', error);
        return res.status(500).json({ error: 'Error al verificar los productos.' });
    }
};

module.exports = { verificarProductosActivos };


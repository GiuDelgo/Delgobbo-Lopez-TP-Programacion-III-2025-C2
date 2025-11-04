const Venta  = require('../models/ventas'); 
const DetalleVenta  = require('../models/detalleVenta'); 
const Producto  = require('../models/productos'); 

module.exports = {
    async registrarVenta(req, res) {
        const { nombreCliente, carritoDeCompras } = req.body;
        
        if (!nombreCliente || !carritoDeCompras || carritoDeCompras.length === 0) {
            return res.status(400).json({ error: 'Datos de venta incompletos o carrito vacío.' });
        }
        
        let precioTotalCalculado = 0;
        const detallesDeVenta = [];

        try {
            for (const item of carritoDeCompras) {
                const precioUnitario = item.producto.precio;
                const cantidadComprada = item.cantidad;
                const idProducto = item.producto.id;

                
                if (cantidadComprada > 0 && precioUnitario !== undefined) {
                    const subtotal = cantidadComprada * precioUnitario;
                    precioTotalCalculado += subtotal; 

                    
                    detallesDeVenta.push({
                        ProductoId: idProducto,
                        cantidadProducto: cantidadComprada,
                        precioUnitario: precioUnitario,
                        subtotal: subtotal
                    });
                }
            }
            
            if (precioTotalCalculado <= 0) {
                return res.status(400).json({ error: 'El carrito no contiene productos válidos.' });
            }

            const nuevaVenta = await Venta.create({
                nombreCliente: nombreCliente,
                fecha: new Date(),
                precioTotal: precioTotalCalculado 
            });

            const detallesFinales = detallesDeVenta.map(detalle => ({
                ...detalle,
                VentumId: nuevaVenta.id
            }));

            await DetalleVenta.bulkCreate(detallesFinales);
            
            return res.status(201).json(nuevaVenta);

        } catch (e) { 
            console.error("Error al crear la venta:", e);
            return res.status(500).json({ error: 'Error interno del servidor.', details: e.message });
        }
    },

    async listarVentasDetalle(req, res) {
        try {
            const ventas = await Venta.findAll({

                include: [{
                    model: Producto, 
                    as: 'Productos',
                    through: {
                        model: DetalleVenta, 
                        attributes: ['cantidadProducto', 'precioUnitario', 'subtotal'] 
                    }
                }],
                order: [['fecha', 'DESC']]
            });

            return res.status(200).json(ventas); 

        } catch (e) {
            console.error("Error al listar las ventas con detalle:", e);
            return res.status(500).json({ error: 'Error interno del servidor al obtener el detalle de ventas.' });
        }
    }


}
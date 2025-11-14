const Venta  = require('../models/ventas'); 
const DetalleVenta  = require('../models/detalleVenta'); 
const Producto  = require('../models/productos'); 

const PDFDocument = require ("pdfkit");
const path = require("path");  

module.exports = {
    async registrarVenta(req, res) {
        const { nombreCliente, carritoDeCompras } = req.body;
        
        if (!nombreCliente || !carritoDeCompras || carritoDeCompras.length === 0) {
            return res.status(400).json({ error: 'Datos de venta incompletos o carrito vacío.' });
        }
        
        let precioTotalCalculado = 0;
        const detallesDeVenta = [];

        try {
            carritoDeCompras.forEach(item => {
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
            });
            
            if (precioTotalCalculado <= 0) {
                return res.status(400).json({ error: 'El carrito no contiene productos válidos.' });
            }

            const nuevaVenta = await Venta.create({
                nombreCliente: nombreCliente,
                fecha: new Date(),
                precioTotal: precioTotalCalculado 
            });

            const detallesFinales = detallesDeVenta.map(detalle => ({
                ...detalle, //al final de cada venta agrego id de venta al detalle
                VentumId: nuevaVenta.id
            }));

            await DetalleVenta.bulkCreate(detallesFinales); //creo varias a la vez
            
            return res.status(201).json(nuevaVenta);

        } catch (e) { 
            console.error("Error al crear la venta:", e);
            return res.status(500).json({ error: 'Error interno del servidor.', details: e.message });
        }
    },

    async listarVentasDetalle(req, res) {
        try {
            const ventas = await Venta.findAll({

                include: [{ //join de tablas
                    model: Producto, //traigo todos los atributos de producto
                    as: 'Productos', //alias asociación venta con producto
                    through: { //tabla intemedia
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
    },

    descargarTicket(req, res) {        
        const filePDF = new PDFDocument;

        try {
            res.setHeader('Content-Type', 'application/pdf'); 
            res.setHeader("Content-Disposition", "attachment;filename=ticket.pdf");

            filePDF.pipe(res);
            filePDF.text("probando descarga");
            
            filePDF.end();
        } catch (e) {
            console.error("Error al generar o enviar el ticket:", e);
            res.status(500).send("Error interno al procesar el ticket.");
        }
    }
}
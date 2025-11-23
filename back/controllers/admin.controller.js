const Producto = require('../models/productos');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

module.exports = {
    // Muestro formulario de login
    mostrarLogin(req, res) {
        res.render('admin/login', { error: null });
    },

    // Proceso login
    async procesarLogin(req, res) {
        const { correo, contraseña } = req.body;
        
        // Busco usuario
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.render('admin/login', { error: 'Correo o contraseña incorrectos' });
        }

        // Comparo contraseñas
        const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esValida) {
            return res.render('admin/login', { error: 'Correo o contraseña incorrectos' });
        }

        // Creo sesión
        req.session.usuarioId = usuario.id;
        req.session.usuarioNombre = usuario.nombre;
        res.redirect('/admin/dashboard');
    },

    // Cierro sesión
    logout(req, res) {
        req.session.destroy();
        res.redirect('/admin/login');
    },

    // Muestro dashboard paginado
    async mostrarDashboard(req, res) {
        const tamañoPag = 10;
        const paginaActual = Number(req.query.pagina) || 1;
        const offset = (paginaActual - 1) * tamañoPag;

        try {
            const resultadoSuplementos = await Producto.findAndCountAll({
                where: { tipo_producto: 'Suplemento' }, // Filtro de tipo directo en la DB
                limit: tamañoPag,
                offset: offset,
                order: [['id', 'ASC']]
            });

            const resultadoPesas = await Producto.findAndCountAll({
                where: { tipo_producto: 'Pesa' }, // Filtro de tipo directo en la DB
                limit: tamañoPag,
                offset: offset,
                order: [['id', 'ASC']]
            });
            
            //Calculo el total de páginas para cada tipo (para la navegación)
            const totalPagSuplementos = Math.ceil(resultadoSuplementos.count / tamañoPag);
            const totalPagPesas = Math.ceil(resultadoPesas.count / tamañoPag);


            res.render('admin/dashboard', {
                usuario: { nombre: req.session.usuarioNombre },
                
                // Los arrays de productos están en la propiedad 'rows'
                suplementos: resultadoSuplementos.rows, 
                pesas: resultadoPesas.rows,
                
                // Variables de Paginación para el Frontend
                paginacion: {
                    actual: paginaActual,
                    totalSuplementos: totalPagSuplementos,
                    totalPesas: totalPagPesas,
                },
                
                mensaje: req.query.mensaje || null
            });

        } catch (e) {
            console.error("Error al obtener el dashboard:", e);
            res.status(500).send("Error interno del servidor.");
        }
    },

    // // Muestro dashboard
    // async mostrarDashboard(req, res) {
    //     const productos = await Producto.findAll();
    //     const suplementos = productos.filter(p => p.tipo_producto === 'Suplemento');
    //     const pesas = productos.filter(p => p.tipo_producto === 'Pesa');

    //     res.render('admin/dashboard', {
    //         usuario: { nombre: req.session.usuarioNombre || 'Admin' },
    //         suplementos,
    //         pesas,
    //         mensaje: req.query.mensaje || null
    //     });
    // },

    // Muestro formulario (nuevo o editar)
    async mostrarFormulario(req, res) {
        const { id } = req.params;
        let producto = null;

        if (id) {
            producto = await Producto.findByPk(id);
            if (!producto) {
                return res.redirect('/admin/dashboard?mensaje=Producto no encontrado');
            }
        }

        res.render('admin/producto-form', {
            usuario: { nombre: req.session.usuarioNombre || 'Admin' },
            producto,
            esEdicion: !!id//bandera modo edición/creación para EJS (reminder)
        });
    },

    // Guardo producto
    async guardarProducto(req, res) {
        const { id } = req.params;
        const { nombre, marca, precio, tipo_producto, peso, cantidad_gramos_ml } = req.body;
        
        let imagenUrl = null;
        if (req.file) {
            imagenUrl = `/imagenes/${req.file.filename}`;
        } else if (id) {
            const productoExistente = await Producto.findByPk(id);
            if (productoExistente) {
                imagenUrl = productoExistente.imagen;
            }
        }

        const datosProducto = {
            nombre,
            marca,
            precio: parseFloat(precio),
            tipo_producto,
            peso: tipo_producto === 'Pesa' ? parseFloat(peso) : null,
            cantidad_gramos_ml: tipo_producto === 'Suplemento' ? parseInt(cantidad_gramos_ml) : null,
            imagen: imagenUrl,
            activo: true
        };

        if (id) {
            await Producto.update(datosProducto, { where: { id } });
            res.redirect('/admin/dashboard?mensaje=Producto actualizado');
        } else {
            await Producto.create(datosProducto);
            res.redirect('/admin/dashboard?mensaje=Producto creado');
        }
    },

    // Cambio estado
    async cambiarEstado(req, res) {
        const { id } = req.params;
        const { activo } = req.body;

        await Producto.update({ activo: activo === 'true' }, { where: { id } });
        res.redirect('/admin/dashboard?mensaje=Estado actualizado');
    }
};


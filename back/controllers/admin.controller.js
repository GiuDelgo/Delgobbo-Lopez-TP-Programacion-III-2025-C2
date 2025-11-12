const Producto = require('../models/productos');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

module.exports = {
    // Mostrar formulario de login
    mostrarLogin(req, res) {
        res.render('admin/login', { error: null });
    },

    // Procesar login
    async procesarLogin(req, res) {
        const { correo, contraseña } = req.body;
        
        // Buscar usuario
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.render('admin/login', { error: 'Correo o contraseña incorrectos' });
        }

        // Comparar contraseñas
        const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esValida) {
            return res.render('admin/login', { error: 'Correo o contraseña incorrectos' });
        }

        // Crear sesión
        req.session.usuarioId = usuario.id;
        req.session.usuarioNombre = usuario.nombre;
        res.redirect('/admin/dashboard');
    },

    // Cerrar sesión
    logout(req, res) {
        req.session.destroy();
        res.redirect('/admin/login');
    },

    // Mostrar dashboard
    async mostrarDashboard(req, res) {
        const productos = await Producto.findAll();
        const suplementos = productos.filter(p => p.tipo_producto === 'Suplemento');
        const pesas = productos.filter(p => p.tipo_producto === 'Pesa');

        res.render('admin/dashboard', {
            usuario: { nombre: req.session.usuarioNombre || 'Admin' },
            suplementos,
            pesas,
            mensaje: req.query.mensaje || null
        });
    },

    // Mostrar formulario (nuevo o editar)
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
            esEdicion: !!id
        });
    },

    // Guardar producto
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

    // Cambiar estado
    async cambiarEstado(req, res) {
        const { id } = req.params;
        const { activo } = req.body;

        await Producto.update({ activo: activo === 'true' }, { where: { id } });
        res.redirect('/admin/dashboard?mensaje=Estado actualizado');
    }
};




const Producto = require('../models/productos');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

module.exports = {
    // ========================================
    // MOSTRAR FORMULARIO DE LOGIN
    // ========================================
    mostrarLogin(req, res) {
        res.render('admin/login', { 
            error: null 
        });
    },

    // ========================================
    // PROCESAR LOGIN
    // ========================================
    async procesarLogin(req, res) {
        try {
            const { correo, contraseña } = req.body;

            // 1. Buscar usuario
            const usuario = await Usuario.findOne({ where: { correo } });

            if (!usuario) {
                return res.render('admin/login', { 
                    error: 'Correo o contraseña incorrectos' 
                });
            }

            // 2. Verificar contraseña
            const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

            if (!contraseñaValida) {
                return res.render('admin/login', { 
                    error: 'Correo o contraseña incorrectos' 
                });
            }

            // 3. Guardar en sesión
            req.session.usuarioId = usuario.id;
            req.session.usuarioNombre = usuario.nombre;

            // 4. Redirigir al dashboard
            res.redirect('/admin/dashboard');

        } catch (error) {
            console.error('Error en login:', error);
            res.render('admin/login', { 
                error: 'Error al iniciar sesión' 
            });
        }
    },

    // ========================================
    // CERRAR SESIÓN
    // ========================================
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            }
            res.redirect('/admin/login');
        });
    },

    // ========================================
    // MOSTRAR DASHBOARD
    // ========================================
    async mostrarDashboard(req, res) {
        try {
            // Obtener todos los productos y separarlos por tipo
            const productos = await Producto.findAll();

            const suplementos = productos.filter(p => p.tipo_producto === 'Suplemento');
            const pesas = productos.filter(p => p.tipo_producto === 'Pesa');

            res.render('admin/dashboard', {
                usuario: {
                    nombre: req.session.usuarioNombre || 'Administrador'
                },
                suplementos,
                pesas,
                mensaje: req.query.mensaje || null
            });

        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            res.status(500).send('Error al cargar el dashboard');
        }
    },

    // ========================================
    // MOSTRAR FORMULARIO DE PRODUCTO (NUEVO/EDITAR)
    // ========================================
    async mostrarFormulario(req, res) {
        try {
            const { id } = req.params;
            let producto = null;

            if (id) {
                // Editar: buscar producto existente
                producto = await Producto.findByPk(id);
                if (!producto) {
                    return res.redirect('/admin/dashboard?mensaje=Producto no encontrado');
                }
            }

            res.render('admin/producto-form', {
                usuario: {
                    nombre: req.session.usuarioNombre || 'Administrador'
                },
                producto,
                esEdicion: !!id
            });

        } catch (error) {
            console.error('Error al cargar formulario:', error);
            res.status(500).send('Error al cargar el formulario');
        }
    },

    // ========================================
    // GUARDAR PRODUCTO (CREAR/ACTUALIZAR)
    // ========================================
    async guardarProducto(req, res) {
        try {
            const { id } = req.params;
            const { nombre, marca, precio, tipo_producto, peso, cantidad_gramos_ml } = req.body;
            
            // Si hay archivo nuevo, usar ese. Si no, mantener el existente (solo en edición)
            let imagenUrl = null;
            if (req.file) {
                // Se subió una nueva imagen
                imagenUrl = `/imagenes/${req.file.filename}`;
            } else if (id) {
                // Es edición y no se subió nueva imagen, mantener la existente
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
                // Actualizar producto existente
                await Producto.update(datosProducto, { where: { id } });
                res.redirect('/admin/dashboard?mensaje=Producto actualizado correctamente');
            } else {
                // Crear nuevo producto
                await Producto.create(datosProducto);
                res.redirect('/admin/dashboard?mensaje=Producto creado correctamente');
            }

        } catch (error) {
            console.error('Error al guardar producto:', error);
            res.status(500).send('Error al guardar el producto');
        }
    },

    // ========================================
    // CAMBIAR ESTADO (ACTIVAR/DESACTIVAR)
    // ========================================
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { activo } = req.body;

            await Producto.update(
                { activo: activo === 'true' },
                { where: { id } }
            );

            const mensaje = activo === 'true' 
                ? 'Producto activado correctamente' 
                : 'Producto desactivado correctamente';

            res.redirect(`/admin/dashboard?mensaje=${mensaje}`);

        } catch (error) {
            console.error('Error al cambiar estado:', error);
            res.status(500).send('Error al cambiar el estado del producto');
        }
    }
};




// back/controllers/productos.controller.js
const { Op } = require('sequelize');
const { Producto } = require('../models');

module.exports = {
    async listar(req, res, next) {
    /**
    Recibe
    req.query (opcional):
    q → texto de busqueda (matchea en nombre o marca)
    tipo → filtra por tipo_producto (Pesa | Suplemento)
    marca → filtra por marca

    Qué hace y cómo
    Construye un objeto where dinámico con esos filtros.
    Si llega q, usa Op.like para buscar parcial en nombre o marca.
    Ejecuta Producto.findAll({ where, order: [['id', 'ASC']] }).

    Devuelve
    200 OK con Array<Producto> (JSON).
    500 con { error } si algo falla (vía next(err)).
     */
        try {
        const { q, tipo, marca } = req.query;
        const where = {};
        if (q) {
            where[Op.or] = [
            { nombre: { [Op.like]: `%${q}%` } },
            { marca:  { [Op.like]: `%${q}%` } },
            ];
        }
        if (tipo)  where.tipo_producto = tipo;
        if (marca) where.marca = marca;

        const productos = await Producto.findAll({ where, order: [['id', 'ASC']] });
        res.json(productos);
        } catch (e) { next(e); }
    },
    
    async obtenerPorId(req, res, next) {
    /**
    Recibe
    req.params.id (numérico).

    Qué hace y cómo
    Convierte id a Number.
    Busca con Producto.findByPk(id).

    Devuelve
    200 OK con Producto (JSON) si existe.
    404 Not Found con { error: 'Producto no encontrado' } si no existe.
    500 si hay error inesperado.
    */
        try {
        const id = Number(req.params.id);
        const prod = await Producto.findByPk(id);
        if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(prod);
        } catch (e) { next(e); }
    },

    async crear(req, res, next) {

    /**Recivbbe
    req.body con:
    Obligatorios: nombre (string), marca (string), precio (number), tipo_producto (Pesa | Suplemento)
    Opcionales (según tipo):
    peso (para Pesa)
    cantidad_gramos_ml (para Suplemento)

    Qué hace y cómo
    Valida obligatorios; si falta alguno → corta con 400.
    Normaliza los campos variables:    Si tipo_producto === 'Pesa' → setea peso (Number) y cantidad_gramos_ml = null.
    Si tipo_producto === 'Suplemento' → setea cantidad_gramos_ml (Number) y peso = null.
    Inserta con Producto.create({...}).

    Devuelve
    201 Created con el Producto creado (JSON).
    400 Bad Request si faltan datos.s
    500 si hay error inmesperado. */
        try {
        const { nombre, marca, precio, tipo_producto, peso, cantidad_gramos_ml } = req.body;
        if (!nombre || !marca || precio == null || !tipo_producto) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        // Regla de consistesncia por tipo:
        // - Pesa: usa "peso" y deja "cantidad_gramos_ml" en null
        // - Suplemento: usa "cantidad_gramos_ml" y deja "peso" en null
        let _peso = null, _cantidad = null;
        if (tipo_producto === 'Pesa') _peso = Number(peso ?? 0);
        if (tipo_producto === 'Suplemento') _cantidad = Number(cantidad_gramos_ml ?? 0);

        const nuevo = await Producto.create({
            nombre,
            marca,
            precio: Number(precio),
            tipo_producto,
            peso: _peso,
            cantidad_gramos_ml: _cantidad,
        });

        res.status(201).json(nuevo);
        } catch (e) { next(e); }
    },

    async actualizar(req, res, next) {
    /**Recibe
    req.params.id (numérico).
    req.body con cualquier subset de campoas: nombre, marca, precio, tipo_producto, peso, cantidad_gramos_ml.

    Qués hace y cóomo
    Busca el prodsucto por PK. Si no existe → 404.
    Arma un objeto changes haciendo merge:
    Mantiene valores actuales si no llegan en el body.
    Reaplica la regla de consistencia según tipo_producto resultante:
    Pesa → defisne peso, pone cantidad_gramos_ml = null.
    Suplemento → define cantidad_gramobs_ml, pone peso = null.
    Ejecuta prod.update(changes).

    Devuelve
    200 OK con el Producto actualizado (JSON).
    404 si el id no existe.
    500 si hay error inesperado. */
        try {
        const id = Number(req.params.id);
        const prod = await Producto.findByPk(id);
        if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

        const { nombre, marca, precio, tipo_producto, peso, cantidad_gramos_ml } = req.body;

        let changes = {
            nombre: nombre ?? prod.nombre,
            marca:  marca  ?? prod.marca,
            precio: (precio == null ? prod.precio : Number(precio)),
            tipo_producto: tipo_producto ?? prod.tipo_producto,
        };

        if ((tipo_producto ?? prod.tipo_producto) === 'Pesa') {
            changes.peso = (peso === undefined ? prod.peso : Number(peso));
            changes.cantidad_gramos_ml = null;
        } else {
            changes.cantidad_gramos_ml = (cantidad_gramos_ml === undefined ? prod.cantidad_gramos_ml : Number(cantidad_gramos_ml));
            changes.peso = null;
        }

        await prod.update(changes);
        res.json(prod);
        } catch (e) { next(e); }
    },


    async cambiarEstado(req, res) {

    /**Recibe
    req.params.id (numérico).
    req.body.estado (boolean), si existiera el campo en el modelo.

    Qué hace y cómo (actual)
    Responde directo 501 Not Implemented explicando que el modelo no tiene estado.

    Devuelve
    501 Not Implemented con { error: 'Ruta no implementada: ...' }.
    Si más adelante agregggamos estado al modelo, esta funcin devberia:
    Validar que llegue estado en el body.
    Hacer findByPk(id); si no existe → 404.
    update({ estado: !!estado }).
    Devolver 200 OK con { id, estado }. */
        return res.status(501).json({ error: 'Ruta no implementada: el modelo Producto no tiene "estado"' });
    },
};

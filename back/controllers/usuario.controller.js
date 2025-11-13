const Usuario  = require('../models/usuario');

/**
    Recibe
    req.body con:
    Obligatorios: nombreUsuario (string), contraseña (string)
    
    Valida los datos obligatorios; si faltan -> 400.
    Crea usuario: Usuario.create({ nombreUsuario, contraseña }).
    (Más adelante: hashea contraseña con bcrypt y evita texto plano)

    Devuelve
    201 Created con { id, nombreUsuario }.
    (Nunca devuelve la contraseña.)
    400 si faltan datos.
    500 si hay error inesperado.
*/

module.exports = {
    async crear(req, res) {
        
        try {
            const { nombreUsuario, contraseña } = req.body; 
            if (!nombreUsuario || !contraseña) {
                return res.status(400).json({ error: 'Datos incompletos' });
            }
            const user = await Usuario.create({ nombreUsuario, contraseña });
            return res.status(201).json({ id: user.id, nombreUsuario: user.nombreUsuario });
        } catch (e) { 
            return res.status(500).send(e);
        }
    },

    /**
        Qué hace y cómo
        Lee todos los usuarios con atributos públicos:
        Usuario.findAll({ attributes: ['id', 'nombreUsuario'] }).

        Devuelve
        200 OK con Array<{ id, nombreUsuario }> (JSON).
        500 si hay error inesperado. 
    */
    async listar(req, res) {
        try {
            const usuarios = await Usuario.findAll({
            attributes: ['id', 'nombreUsuario'] 
        });
            return res.status(200).json(usuarios);
        } catch (e) { 
            return res.status(500).send(e);
        }
    },
};

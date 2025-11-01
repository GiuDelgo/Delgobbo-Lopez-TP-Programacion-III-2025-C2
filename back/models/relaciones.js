const Producto = require("./productos");
const Venta = require("./ventas");
const DetalleVenta = require("./detalleVenta");


Producto.belongsToMany(Venta, { through: DetalleVenta });
Venta.belongsToMany(Producto, { through: DetalleVenta });


module.exports = { Producto, Venta, DetalleVenta };
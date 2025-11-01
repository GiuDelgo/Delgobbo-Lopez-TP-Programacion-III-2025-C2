require('dotenv').config();
const express = require("express");
const app = express();
const cors = require ("cors");

const usuarioRoutes = require("./routes/usuario.routes");
const productosRoutes = require("./routes/usuario.routes");

app.use(express.json());
app.use(cors());
app.use(
    cors({
        origin: process.env.ORIGIN, 
    })
);

//app.use("/usuario", usuarioRoutes);
//app.use("/productos", productosRoutes);

////PROBANDO MODELOS BD/////////
const { Venta, Producto } = require("./models/relaciones");
const Usuario = require("./models/usuario");
///////////////////////////

app.listen(3000, () => {
    console.log("Corriendo");
});
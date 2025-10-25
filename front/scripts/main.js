import { Producto } from "./producto.js";

const rutaProductos = "/front/scripts/productos.json";
const maxProductos = 10;

async function traerProductos() {
  try {
    const res = await fetch(rutaProductos);
    const data = await res.json();

    const contenedorA = document.getElementById("filaA");
    const contenedorB = document.getElementById("filaB");

    data.filaA.slice(0, maxProductos).forEach(producto => {
        const productoINST = new Producto (producto.id, producto.nombre, producto.precio, producto.img);
        const cardElement = productoINST.crearCard();
        contenedorA.appendChild(cardElement);
    });

    data.filaB.slice(0, maxProductos).forEach(producto => {
        const productoINST = new Producto (producto.id, producto.nombre, producto.precio, producto.img)
        const cardElement = productoINST.crearCard();
        contenedorB.appendChild(cardElement);
    });

    Producto.inicializarEventos();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

traerProductos();




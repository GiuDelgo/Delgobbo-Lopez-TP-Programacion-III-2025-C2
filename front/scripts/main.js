import { Producto } from "./producto.js";

const rutaProductos = "http://localhost:3000/productos";
const maxProductos = 10;

async function traerProductos() {
  try {
    const res = await fetch(rutaProductos);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const productos = await res.json();

    const contenedorA = document.getElementById("filaA");
    const contenedorB = document.getElementById("filaB");
    if (!contenedorA || !contenedorB) return;

    const norm = s => (s ?? '').toString().trim().toLowerCase();
    const filaA = productos.filter(p => norm(p.tipo_producto) === 'suplemento').slice(0, maxProductos);
    const filaB = productos.filter(p => norm(p.tipo_producto) === 'pesa').slice(0, maxProductos);


    filaA.forEach(p => {
      const productoINST = new Producto(p.id, p.nombre, p.precio, p.imagen ?? null);
      const cardElement = productoINST.crearCard();
      contenedorA.appendChild(cardElement);
    });

    filaB.forEach(p => {
      const productoINST = new Producto(p.id, p.nombre, p.precio, p.imagen ?? null);
      const cardElement = productoINST.crearCard();
      contenedorB.appendChild(cardElement);
    });

    Producto.inicializarEventos();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

traerProductos();
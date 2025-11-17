import { Producto } from "./producto.js";

const rutaProductos = "http://localhost:3000/productos";
const baseUrlBackend = "http://localhost:3000";

function construirUrlImagen(imagen) {
  if (!imagen) return null;
  if (imagen.startsWith('http://')) {
    return imagen;
  }
  if (imagen.startsWith('/')) {
    return `${baseUrlBackend}${imagen}`;
  }
  return `${baseUrlBackend}/${imagen}`;
}

async function traerProductos() {
  try {
    const res = await fetch(rutaProductos);
    const productos = await res.json();

    const contenedorA = document.getElementById("filaA");
    const contenedorB = document.getElementById("filaB");

    const norm = s => (s ?? '').toString().trim().toLowerCase();//funct anónima para normalizar los tipos de producto
    const filaA = productos.filter(p => norm(p.tipo_producto) === 'suplemento');
    const filaB = productos.filter(p => norm(p.tipo_producto) === 'pesa');


    filaA.forEach(p => {
      
        const imagenUrl = construirUrlImagen(p.imagen);
        const productoINST = new Producto(p.id, p.nombre, p.precio, p.activo, imagenUrl);
        const cardElement = productoINST.crearCard();
        contenedorA.appendChild(cardElement);
      }      
    );

    filaB.forEach(p => {

        const imagenUrl = construirUrlImagen(p.imagen);
        const productoINST = new Producto(p.id, p.nombre, p.precio, p.activo, imagenUrl);
        const cardElement = productoINST.crearCard();
        contenedorB.appendChild(cardElement);
      }
    );

    Producto.inicializarEventos();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

traerProductos();
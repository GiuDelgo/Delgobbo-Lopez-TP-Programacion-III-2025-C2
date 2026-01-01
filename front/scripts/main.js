import { Producto } from "./producto.js";

let baseUrlBackend = "";
let rutaProductos = "";
const archivoDeAmbiente = "./env.json";

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
    console.log("Intentando cargar productos desde:", rutaProductos);
    const res = await fetch(rutaProductos);
    
    if (!res.ok) {
      console.error("Error en respuesta del servidor:", res.status, res.statusText);
      const errorText = await res.text();
      console.error("Contenido del error:", errorText);
      return;
    }
    
    const productos = await res.json();
    console.log("Productos recibidos:", productos.length);

    const contenedorA = document.getElementById("filaA");
    const contenedorB = document.getElementById("filaB");

    if (!contenedorA || !contenedorB) {
      console.error("No se encontraron los contenedores filaA o filaB");
      return;
    }

    const norm = s => (s ?? '').toString().trim().toLowerCase();//funct anónima para normalizar los tipos de producto
    const filaA = productos.filter(p => norm(p.tipo_producto) === 'suplemento');
    const filaB = productos.filter(p => norm(p.tipo_producto) === 'pesa');

    console.log("Suplementos:", filaA.length, "Pesas:", filaB.length);

    filaA.forEach(p => {
        const imagenUrl = construirUrlImagen(p.imagen);
        const productoINST = new Producto(p.id, p.nombre, p.precio, p.activo, imagenUrl);
        const cardElement = productoINST.crearCard();
        contenedorA.appendChild(cardElement);
    });

    filaB.forEach(p => {
        const imagenUrl = construirUrlImagen(p.imagen);
        const productoINST = new Producto(p.id, p.nombre, p.precio, p.activo, imagenUrl);
        const cardElement = productoINST.crearCard();
        contenedorB.appendChild(cardElement);
    });

    Producto.inicializarEventos();
  } catch (error) {
    console.error("Error cargando productos:", error);
    console.error("Stack trace:", error.stack);
  }
}

document.addEventListener ("DOMContentLoaded", async () =>{
  try {
    const respuestaAmbiente = await fetch(archivoDeAmbiente);

    if (!respuestaAmbiente.ok){
      console.error("Archivo de ambiente del front no configurado");
      baseUrlBackend = "http://localhost:3000"; // Fallback
    } else {
      const ambiente = await respuestaAmbiente.json();
      baseUrlBackend = ambiente.api_url || "http://localhost:3000";
    }
    
    rutaProductos = `${baseUrlBackend}/productos`;
    console.log("URL del backend:", baseUrlBackend);
    console.log("Ruta productos:", rutaProductos);

    traerProductos();
  } catch (error) {
    console.error("Error cargando configuración:", error);
    baseUrlBackend = "http://localhost:3000"; // Fallback
    rutaProductos = `${baseUrlBackend}/productos`;
    traerProductos();
  }
})


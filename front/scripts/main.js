async function cargarProductos() {
  try {
    const res = await fetch("/front/scripts/productos.json");
    const data = await res.json();

    const contenedorA = document.getElementById("filaA");
    const contenedorB = document.getElementById("filaB");

    function crearCard(p) {
      return `
            <div class="card">
            <img src="${p.img}" alt="${p.nombre}">
            <div class="card-body">
                <h5 class="card-title">${p.nombre}</h5>
                <p class="card-text">$${p.precio}</p>
                <input type="number" value="0" min="0">
                <button class="btn-agregar">Agregar</button>
            </div>
            </div>
        `;
    }

    contenedorA.innerHTML = data.filaA.map(crearCard).join("");
    contenedorB.innerHTML = data.filaB.map(crearCard).join("");
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

cargarProductos();

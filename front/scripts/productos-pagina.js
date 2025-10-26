function moverFila(idFila, dir) {
    const fila = document.getElementById(idFila);
    const width = fila.clientWidth;
    fila.scrollBy({ left: dir * width, behavior: "smooth" });
}

function inicializarScroll() {
    const botones = document.querySelectorAll(".btn-mover");
    botones.forEach(btn => {
        btn.addEventListener("click", () => {
        const fila = btn.dataset.fila;
        const dir = Number(btn.dataset.dir);
        moverFila(fila, dir);
        });
    });
}

function inicializarBotonCarrito() {
    const btnCarrito = document.getElementById("button-addon2");
    if (!btnCarrito) return;

    btnCarrito.addEventListener("click", () => {
        window.location.href = "./carrito.html";
    });
}

function mostrarNombreUsuario() {
    const nombre = localStorage.getItem("nombreUsuarioPapota");
    const destino = document.getElementById("nombre-usuario");
    if (nombre && destino) destino.textContent = `Que onda, ${nombre} `;
    }

    document.addEventListener("DOMContentLoaded", () => {
    mostrarNombreUsuario();
});



document.addEventListener("DOMContentLoaded", () => {
    inicializarScroll();
    inicializarBotonCarrito();
});
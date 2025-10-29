function getCarrito() {
    return JSON.parse(localStorage.getItem("carritoDeCompras")) ?? [];
}

function saveCarrito(carrito) {
    localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
}

function renderCarrito() {
    const tbody = document.getElementById("carrito-body");
    const totalGeneralEl = document.getElementById("total-general");
    const carrito = getCarrito();

    if (!carrito || carrito.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-light py-5">
            Tu carrito está vacío perrito
            </td>
        </tr>`;
        totalGeneralEl.textContent = "0";
        return;
    }

    let total = 0;

    tbody.innerHTML = carrito.map((item, index) => {
        const p = item.producto;
        const subtotal = p.precio * item.cantidad;
        total += subtotal;
        return `
            <tr>
            <td style="width:80px">
                <img src="${p.img}" alt="${p.nombre}"
                    style="width:70px; height:70px; object-fit:cover; border-radius:8px;">
            </td>
            <td class="text-light">${p.nombre}</td>
            <td class="text-light">$${p.precio}</td>
            <td>
                <input type="number" class="form-control cantidad-carrito"
                    min="1" value="${item.cantidad}" data-index="${index}"
                    style="width:80px">
            </td>
            <td class="text-light">$${subtotal}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-eliminar" data-index="${index}">
                Eliminar
                </button>
            </td>
            </tr>`;
    }).join("");

    totalGeneralEl.textContent = total;

    document.querySelectorAll(".cantidad-carrito").forEach(input => {
            input.addEventListener("change", e => {
            const i = Number(e.target.dataset.index);
            let nuevaCant = Number(e.target.value);
            if (isNaN(nuevaCant) || nuevaCant < 1) nuevaCant = 1;
            const carritoActual = getCarrito();
            carritoActual[i].cantidad = nuevaCant;
            saveCarrito(carritoActual);
            renderCarrito();
            });
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = Number(e.target.dataset.index);
            const carritoActual = getCarrito();
            carritoActual.splice(i, 1);
            saveCarrito(carritoActual);
            renderCarrito();
            });
        });
}

function setupConfirmar() {
    const btn = document.getElementById("btn-confirmar");
    if (!btn) return;
    btn.addEventListener("click", () => {        
        window.location.href = "./ticket.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCarrito();
    setupConfirmar();
});

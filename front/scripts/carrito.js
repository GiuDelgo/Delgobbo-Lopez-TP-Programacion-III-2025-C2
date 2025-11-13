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

    const confirmarBtn = document.getElementById("btn-confirmar");
    if (confirmarBtn) {
        confirmarBtn.disabled = carrito.length === 0;
    }

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

    const modalEl = document.getElementById('confirmModal');
    const btnModalConfirmar = document.getElementById('btn-modal-confirmar');

    btn.addEventListener("click", () => {
        const carrito = getCarrito();
        if (!carrito.length) return; // opcional: deshabilitar si vacío

        // Muestro modal (Bootstrap)
        if (modalEl && window.bootstrap?.Modal) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();

            btnModalConfirmar.onclick = async () => {
                btnModalConfirmar.disabled = true;//1 solo click

                try {
                    const nombreCliente = localStorage.getItem("nombreUsuarioPapota");
                    const carritoDeCompras = getCarrito().filter(it => (it?.cantidad ?? 0) > 0);//Saco lo que tiene cantidad 0 del array

                    const res = await fetch("http://localhost:3000/ventas", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nombreCliente, carritoDeCompras })
                    });

                    btnModalConfirmar.disabled = false;
                    
                    modal.hide();
                    window.location.href = "./ticket.html";
                } catch (e) {
                    console.error("Error al registrar la venta:", e);
                    alert("Error de red al registrar la venta.");
                    btnModalConfirmar.disabled = false;
                }
            };
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCarrito();
    setupConfirmar();
});

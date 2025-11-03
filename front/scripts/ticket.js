const fecha = new Date();
let año = fecha.getFullYear();
let mes = fecha.getMonth() + 1;     
let dia = fecha.getDate();
let hora = fecha.getHours();
let minutos = fecha.getMinutes();

const info = document.getElementById("fecha_hora");
const pFecha = document.createElement("p");
const pHora = document.createElement("p");

pFecha.innerText = `${dia} - ${mes} - ${año}`;
pHora.innerText = `${hora}:${minutos}`;

info.appendChild(pFecha);
info.appendChild(pHora);

function getUsuario() {
    return localStorage.getItem("nombreUsuarioPapota") ?? " ";
}

const usuario = getUsuario();

const divUsuario = document.getElementById("info_usuario");
const pUsuario = document.createElement("p");
pUsuario.innerText = usuario;

divUsuario.appendChild(pUsuario);


function getCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) ?? [];
    return carrito.filter(item => item.cantidad > 0);
}

const carritoActual = getCarrito();

const productosLista = document.getElementById("productos");

let total = 0;

carritoActual.forEach(elemento => {
    const itemCarrito = elemento;
    const producto = itemCarrito.producto;
    const cantidadComprada = itemCarrito.cantidad;

    total += (cantidadComprada * producto.precio);

    let itemLista = document.createElement("li");
    let divisor = document.createElement("hr");
    itemLista.innerHTML = `
    <span>${producto.nombre} - ${cantidadComprada} x $${producto.precio.toLocaleString()}</span>
    <span>$${(cantidadComprada * producto.precio)}</span>`;
    productosLista.appendChild(itemLista);
    productosLista.appendChild(divisor);
});

const totalP = document.createElement("p");
const totalP2 = document.createElement("p");
const divTotal = document.getElementById("total");

totalP2.innerHTML = `<span>${"Total"}</span>`;
totalP.innerHTML = `<span>$${total}</span>`;

divTotal.appendChild(totalP2);
divTotal.appendChild(totalP);

async function registrarVentaSiCorresponde() {
    try {
        if (sessionStorage.getItem("ventaEnviada") === "1") return;
        if (!carritoActual.length) return;

        const body = {
            nombreCliente: usuario || "Cliente",
            carritoDeCompras: carritoActual
        };

        const res = await fetch("http://localhost:3000/ventas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("Fallo al registrar venta:", res.status, txt);
            return;
        }

        const ventaCreada = await res.json();
        sessionStorage.setItem("ventaEnviada", "1");
        // Vaciar carrito una vez registrada la venta
        localStorage.setItem("carritoDeCompras", JSON.stringify([]));

        // Mostrar nro de venta si querés:
        const nroVentaEl = document.getElementById("nro_venta");
        if (nroVentaEl && ventaCreada?.id) {
            nroVentaEl.textContent = `Venta #${ventaCreada.id}`;
        }
    } catch (e) {
        console.error("Error al registrar la venta:", e);
    }
}

function setupFinalizar() {
    const btn = document.getElementById("inicio");
    if (!btn) return;
    btn.addEventListener("click", () => {
        window.location.href = "./bienvenida.html";
    });
}

(async function init() {
    await registrarVentaSiCorresponde();
    setupFinalizar();
})();
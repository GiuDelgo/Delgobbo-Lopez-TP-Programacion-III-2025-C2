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

async function registrarVenta() {
    try {

         // Evitar duplicados
         if (sessionStorage.getItem("ventaEnviada") === "1") {
            console.log("Venta ya registrada, omitiendo...");
            return;
        }
        
        const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) ?? [];
        const carritoDeCompras = carrito.filter(it => (it?.cantidad ?? 0) > 0);
        if (!carritoDeCompras.length) return;

        const nombreCliente = localStorage.getItem("nombreUsuarioPapota") || "Cliente";

        const res = await fetch("http://localhost:3000/ventas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombreCliente, carritoDeCompras })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("Fallo al registrar venta:", res.status, txt);
            return;
        }

        const ventaCreada = await res.json();
        
        // Marcar como enviada para evitar duplicados
        sessionStorage.setItem("ventaEnviada", "1");
        if (ventaCreada?.id) {
            sessionStorage.setItem("ventaId", String(ventaCreada.id));
        }
        
    } catch (e) {
        console.error("Error al registrar la venta:", e);
    }
}

function setupFinalizar() {
    const btn = document.getElementById("inicio");
    if (!btn) return;
    btn.addEventListener("click", () => {
        localStorage.setItem("carritoDeCompras", JSON.stringify([]));
        window.location.href = "./bienvenida.html";
    });
}

registrarVenta();
setupFinalizar();

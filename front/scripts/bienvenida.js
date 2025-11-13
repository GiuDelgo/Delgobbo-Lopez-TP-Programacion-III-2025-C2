document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input-nombre");
    const btn = document.getElementById("btn-ingresar");

    btn.addEventListener("click", () => {
        const nombre = input.value.trim();

        if (nombre === "") {
            alert("Ingresa tu nombre BRO");
        return;
        }

        localStorage.setItem("nombreUsuarioPapota", nombre);

        window.location.href = "./productos.html";
    });
});

// Función para mostrar mensajes en modal
function mostrarMensajeModal(titulo, mensaje, tipo = 'info') {
    const modalEl = document.getElementById('mensajeModal');
    if (!modalEl || !window.bootstrap?.Modal) {
        // Fallback a alert si Bootstrap no está disponible
        alert(mensaje);
        return;
    }

    const modalTitle = document.getElementById('mensajeModalLabel');
    const modalBody = document.getElementById('mensajeModalBody');
    
    modalTitle.textContent = titulo;
    modalBody.textContent = mensaje;
    
    // Cambiar color del header según el tipo
    const modalHeader = modalEl.querySelector('.modal-header');
    modalHeader.className = 'modal-header';
    if (tipo === 'error') {
        modalHeader.classList.add('bg-danger', 'text-white');
    } else if (tipo === 'success') {
        modalHeader.classList.add('bg-success', 'text-white');
    } else {
        modalHeader.classList.add('bg-dark', 'text-light');
    }
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input-nombre");
    const btn = document.getElementById("btn-ingresar");

    let toggle = document.getElementById('container');
    let body = document.querySelector('body');

    let temaGuardado = JSON.parse(localStorage.getItem('tema'))?.estado || ' ';

    if (temaGuardado === 'active'){
        toggle.classList.add('active');
        body.classList.add('active');
    }

    toggle.onclick = () => {        
        toggle.classList.toggle('active');
        body.classList.toggle('active');

        if (toggle.classList.contains('active')){
            localStorage.setItem('tema',JSON.stringify({'estado':'active'}));
        }else{
            localStorage.setItem('tema',JSON.stringify({'estado':' '}));
        }
    }

    btn.addEventListener("click", () => {
        const nombre = input.value.trim();

        if (nombre === "") {
            mostrarMensajeModal('Atención', "Ingresa tu nombre BRO", 'info');
            return;
        }

        localStorage.setItem("nombreUsuarioPapota", nombre);

        window.location.href = "./productos.html";
    });
});

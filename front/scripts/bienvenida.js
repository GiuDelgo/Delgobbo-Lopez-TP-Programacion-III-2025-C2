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
            alert("Ingresa tu nombre BRO");
        return;
        }

        localStorage.setItem("nombreUsuarioPapota", nombre);

        window.location.href = "./productos.html";
    });
});

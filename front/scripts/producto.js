export class Producto{
    constructor (id=null, nombre = null, precio = null, img = null){
        this.id= id;
        this.nombre =nombre;
        this.precio =precio;
        this.img = img || 'https://via.placeholder.com/300x200?text=Producto';
    }

    static actualizarCarrito (producto, cantidad) {
        let carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras")) ?? [];
        
        const nuevaCantidad = cantidad;

        const itemEncontradoIndex = carritoDeCompras.findIndex(item => item.producto.id === producto.id);
        
        if (itemEncontradoIndex !== -1) {
            carritoDeCompras[itemEncontradoIndex].cantidad = nuevaCantidad;
        } else {
            carritoDeCompras.push({
                producto: producto,
                cantidad: nuevaCantidad,
            });
        }

        localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras));
    };     

    crearCard() {
        // Crear el elemento principal
        const card = document.createElement('div');
        card.className = 'card';

        // Crear y configurar la imagen
        const img = document.createElement('img');
        img.src = this.img;
        img.alt = this.nombre;

        // Crear el cuerpo de la tarjeta
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Crear título
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = this.nombre;

        // Crear precio
        const price = document.createElement('p');
        price.className = 'card-text';
        price.textContent = `$${this.precio}`;

        // Crear input
        const input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.min = '0';

        // Crear botón
        const button = document.createElement('button');
        button.className = 'btn-actualizar';
        button.textContent = 'Actualizar';

        button.dataset.producto = JSON.stringify(this); // Almacenar el producto como dato JSON en el botón ---

        // Ensamblar los elementos dentro del card-body
        cardBody.appendChild(title);
        cardBody.appendChild(price);
        cardBody.appendChild(input);
        cardBody.appendChild(button);

        // Ensamblar la imagen y el card-body dentro de la card
        card.appendChild(img);
        card.appendChild(cardBody);

        // Devolver el elemento del DOM completamente construido
        return card;
    }

    static inicializarEventos() {
        const botonesActualizar = document.getElementsByClassName('btn-actualizar');
        
        Array.from(botonesActualizar).forEach(boton => {
            boton.addEventListener ('click', (event) =>{
                const botonPresionado = event.currentTarget;
                
                // 1. Obtener Producto (p)
                const productoJSON = botonPresionado.dataset.producto;
                const producto = JSON.parse(productoJSON);
                
                // 2. Obtener Cantidad
                const cardElement = botonPresionado.closest('.card');
                const inputCantidad = cardElement.querySelector('input[type="number"]');
                const cantidad = parseInt(inputCantidad.value) || 0;
                
                // 3. Llamar a la función estática con los datos requeridos
                Producto.actualizarCarrito(producto, cantidad);
            })
            
        });
    }
}


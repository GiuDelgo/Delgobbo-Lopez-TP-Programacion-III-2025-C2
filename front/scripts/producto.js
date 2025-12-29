export class Producto{
    constructor (id=null, nombre = null, precio = null, activo = null, img = null){
        this.id= id;
        this.nombre =nombre;
        this.precio =precio;
        this.activo = activo;
        this.img = img;
    }

    static mostrarModalProductoAgregado(producto, cantidad, esActualizacion = false) {
        const modalEl = document.getElementById('productoAgregadoModal');
        if (!modalEl || !window.bootstrap?.Modal) {
            
            alert(`${esActualizacion ? 'Actualizado' : 'Agregado'}: ${producto.nombre} x${cantidad}`);
            return;
        }

        const modalBody = document.getElementById('productoAgregadoModalBody');
        const modalTitle = document.getElementById('productoAgregadoModalLabel');
        const btnIrCarrito = document.getElementById('btn-ir-carrito');

        
        modalTitle.textContent = esActualizacion ? '✓ Producto actualizado' : '✓ Producto agregado';

        
        const mensaje = esActualizacion 
            ? `Se actualizó la cantidad de <strong>${producto.nombre}</strong> a <strong>${cantidad}</strong> unidad${cantidad !== 1 ? 'es' : ''} en tu carrito.`
            : `Se agregó <strong>${producto.nombre}</strong> x<strong>${cantidad}</strong> al carrito.`;
        
        modalBody.innerHTML = mensaje;

        
        btnIrCarrito.onclick = () => {
            window.location.href = './carrito.html';
        };

       
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }

    static actualizarCarrito (producto, cantidad) {
        let carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras")) ?? [];
        
        const nuevaCantidad = cantidad;

        
        if (nuevaCantidad === 0) {
            const itemEncontradoIndex = carritoDeCompras.findIndex(item => item.producto.id === producto.id);
            if (itemEncontradoIndex !== -1) {
                carritoDeCompras.splice(itemEncontradoIndex, 1);
            }
            localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras));
            return;
        }

        const itemEncontradoIndex = carritoDeCompras.findIndex(item => item.producto.id === producto.id);
        const esActualizacion = itemEncontradoIndex !== -1;
        
        if (esActualizacion) {
            carritoDeCompras[itemEncontradoIndex].cantidad = nuevaCantidad;
        } else {
            carritoDeCompras.push({
                producto: producto,
                cantidad: nuevaCantidad,
            });
        }

        localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras));
        

        if (nuevaCantidad > 0) {
            Producto.mostrarModalProductoAgregado(producto, nuevaCantidad, esActualizacion);
        }
    };     
    
    crearCard() {
        
        const card = document.createElement('div');
        card.className = 'card';

        
        const img = document.createElement('img');
        img.src = this.img;
        img.alt = this.nombre;

        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = this.nombre;

        
        const price = document.createElement('p');
        price.className = 'card-text';
        price.textContent = `$${this.precio}`;

        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.min = '0';

        
        const button = document.createElement('button');
        button.className = 'btn-actualizar';
        button.textContent = 'Actualizar';

        button.dataset.producto = JSON.stringify(this); // Almacena el producto como dato JSON en el botón

        cardBody.appendChild(title);
        cardBody.appendChild(price);
        cardBody.appendChild(input);
        cardBody.appendChild(button);
        card.appendChild(img);
        card.appendChild(cardBody);

        return card;
    }

    static inicializarEventos() {
        const botonesActualizar = document.getElementsByClassName('btn-actualizar');
        
        Array.from(botonesActualizar).forEach(boton => {
            boton.addEventListener ('click', (event) =>{
                const botonPresionado = event.currentTarget;
                
                
                const productoJSON = botonPresionado.dataset.producto;
                const producto = JSON.parse(productoJSON);
                
                
                const cardElement = botonPresionado.closest('.card');//contenedor principal card del boton
                const inputCantidad = cardElement.querySelector('input[type="number"]');
                const cantidad = parseInt(inputCantidad.value) || 0;
                
                
                Producto.actualizarCarrito(producto, cantidad);
            })
            
        });
    }
}


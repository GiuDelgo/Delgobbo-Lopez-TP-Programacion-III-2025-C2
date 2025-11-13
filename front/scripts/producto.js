export class Producto{
    constructor (id=null, nombre = null, precio = null, activo = null, img = null){
        this.id= id;
        this.nombre =nombre;
        this.precio =precio;
        this.activo = activo;
        this.img = img;
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
        // Elemento principal
        const card = document.createElement('div');
        card.className = 'card';

        // Imagen
        const img = document.createElement('img');
        img.src = this.img;
        img.alt = this.nombre;

        // Cuerpo de la tarjeta
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Título
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = this.nombre;

        // Precio
        const price = document.createElement('p');
        price.className = 'card-text';
        price.textContent = `$${this.precio}`;

        // Input
        const input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.min = '0';

        // Botón
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
                
                //Obtengo el Producto
                const productoJSON = botonPresionado.dataset.producto;
                const producto = JSON.parse(productoJSON);
                
                //Obtengo la  Cantidad
                const cardElement = botonPresionado.closest('.card');
                const inputCantidad = cardElement.querySelector('input[type="number"]');
                const cantidad = parseInt(inputCantidad.value) || 0;
                
                //Llamo a la función con los datos requeridos
                Producto.actualizarCarrito(producto, cantidad);
            })
            
        });
    }
}


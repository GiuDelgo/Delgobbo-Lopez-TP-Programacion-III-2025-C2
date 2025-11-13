// Función para cambiar estado con confirmación
function cambiarEstado(id, activar) {
	const mensaje = activar ? '¿Activar este producto?' : '¿Desactivar este producto?';
	
	if (confirm(mensaje)) {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = `/admin/producto/${id}/cambiar-estado`;

		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'activo';
		input.value = activar;

		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}

// Cambia campos según tipo de producto
function cambiarTipoProducto() {
	const tipo = document.getElementById('tipo_producto').value;
	const campoPeso = document.getElementById('campo-peso');
	const campoCantidad = document.getElementById('campo-cantidad');

	if (tipo === 'Pesa') {
		campoPeso.style.display = 'block';
		campoCantidad.style.display = 'none';
		document.getElementById('peso').required = true;
		document.getElementById('cantidad_gramos_ml').required = false;
	} else if (tipo === 'Suplemento') {
		campoPeso.style.display = 'none';
		campoCantidad.style.display = 'block';
		document.getElementById('peso').required = false;
		document.getElementById('cantidad_gramos_ml').required = true;
	}
}

// Preview de imagen
function mostrarPreview() {
	const input = document.getElementById('imagen');
	const file = input.files[0];
	
	if (file) {
		const preview = document.getElementById('imagen-preview');
		const container = document.getElementById('preview-container');
		preview.src = URL.createObjectURL(file);
		container.style.display = 'block';
	}
}

// Acceso rápido para login
function accesoRapido() {
	document.getElementById('correo').value = 'admin@papota.com';
	document.getElementById('contraseña').value = 'admin123';
}

// Inicializo eventos
document.addEventListener('DOMContentLoaded', function () {
	// Select de tipo de producto
	const tipoSelect = document.getElementById('tipo_producto');
	if (tipoSelect) {
		tipoSelect.addEventListener('change', cambiarTipoProducto);
		cambiarTipoProducto();
	}

	// Input de imagen
	const inputImagen = document.getElementById('imagen');
	if (inputImagen) {
		inputImagen.addEventListener('change', mostrarPreview);
	}

	// Botón acceso rápido
	const btnAcceso = document.getElementById('btnAccesoRapido');
	if (btnAcceso) {
		btnAcceso.addEventListener('click', accesoRapido);
	}
});



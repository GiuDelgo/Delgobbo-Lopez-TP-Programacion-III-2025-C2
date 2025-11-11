let productoSeleccionadoID = null;
let estadoSeleccionado = null;

function openEstadoModal(productoId, activar) {
	productoSeleccionadoID = productoId;
	estadoSeleccionado = activar;

	const mensajeModal = activar
		? '¿Está seguro de que desea activar este producto?'
		: '¿Está seguro de que desea desactivar este producto?';

	const msgElemento = document.getElementById('mensajeModal');
	if (msgElemento) msgElemento.textContent = mensajeModal;

	const modalEl = document.getElementById('modalConfirmacion');
	if (modalEl && window.bootstrap) {
		const modal = new bootstrap.Modal(modalEl);
		modal.show();
	}
}

function wireModalConfirm() {
	const btn = document.getElementById('btnConfirmar');
	if (!btn) return;
	btn.addEventListener('click', function () {
		if (productoSeleccionadoID === null || estadoSeleccionado === null) return;
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = `/admin/producto/${productoSeleccionadoID}/cambiar-estado`;
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'activo';
		input.value = String(estadoSeleccionado);
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	});
}

function cambiarTipoProducto() {
	const tipoSelect = document.getElementById('tipo_producto');
	if (!tipoSelect) return;
	const tipo = tipoSelect.value;
	const campoPeso = document.getElementById('campo-peso');
	const campoCantidad = document.getElementById('campo-cantidad');
	const inputPeso = document.getElementById('peso');
	const inputCantidad = document.getElementById('cantidad_gramos_ml');

	if (tipo === 'Pesa') {
		if (campoPeso) campoPeso.style.display = 'block';
		if (campoCantidad) campoCantidad.style.display = 'none';
		if (inputPeso) inputPeso.required = true;
		if (inputCantidad) inputCantidad.required = false;
		if (inputCantidad) inputCantidad.value = '';
	} else if (tipo === 'Suplemento') {
		if (campoPeso) campoPeso.style.display = 'none';
		if (campoCantidad) campoCantidad.style.display = 'block';
		if (inputPeso) inputPeso.required = false;
		if (inputCantidad) inputCantidad.required = true;
		if (inputPeso) inputPeso.value = '';
	} else {
		if (campoPeso) campoPeso.style.display = 'none';
		if (campoCantidad) campoCantidad.style.display = 'none';
		if (inputPeso) inputPeso.required = false;
		if (inputCantidad) inputCantidad.required = false;
	}
}

function wireTipoProducto() {
	const tipoSelect = document.getElementById('tipo_producto');
	if (!tipoSelect) return;
	tipoSelect.addEventListener('change', cambiarTipoProducto);
	cambiarTipoProducto();
}


function wireImagenPreview() {
	const input = document.getElementById('imagen');
	if (!input) return;
	const preview = document.getElementById('imagen-preview');
	const container = document.getElementById('preview-container');

	function showPreviewFromFile(file) {
		if (!file || !preview || !container) return;
		const url = URL.createObjectURL(file);
		preview.src = url;
		container.style.display = 'block';
		preview.onload = function () {
			URL.revokeObjectURL(url);
		};
		preview.onerror = function () {
			container.style.display = 'none';
		};
	}

	input.addEventListener('change', function () {
		const file = input.files && input.files[0];
		if (file) {
			showPreviewFromFile(file);
		} else if (container) {
			container.style.display = 'none';
		}
	});

	// Si hay imagen ya existente (edición), mantener visible si el src ya viene seteado
	if (preview && preview.getAttribute('src')) {
		if (container) container.style.display = 'block';
	}
}

// Acceso rápido login
function wireAccesoRapido() {
	const btn = document.getElementById('btnAccesoRapido');
	if (!btn) return;
	btn.addEventListener('click', function () {
		const correo = document.getElementById('correo');
		const pass = document.getElementById('contraseña');
		if (correo) correo.value = 'admin@papota.com';
		if (pass) pass.value = 'admin123';
	});
}


window.cambiarEstado = openEstadoModal;
window.cambiarTipoProducto = cambiarTipoProducto;

document.addEventListener('DOMContentLoaded', function () {
	wireModalConfirm();
	wireTipoProducto();
	wireImagenPreview();
	wireAccesoRapido();
});



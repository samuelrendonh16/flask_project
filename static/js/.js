document.addEventListener('DOMContentLoaded', function() {
    const inventarioLista = document.getElementById('inventarioLista');
    const ordenesCompraPanel = document.getElementById('ordenesCompraPanel');
    const API_BASE_URL = 'https://migsistemasweb.com';

    // Botones
    const btnNuevoOrdenCompra = document.getElementById('btnNuevoOrdenCompra');
    const btnGuardarOrdenCompra = document.getElementById('btnGuardarOrdenCompra');
    const btnEditarOrdenCompra = document.getElementById('btnEditarOrdenCompra');
    const btnCancelarOrdenCompra = document.getElementById('btnCancelarOrdenCompra');
    const btnBuscarOrdenCompra = document.getElementById('btnBuscarOrdenCompra');
    const btnCerrarOrdenCompra = document.getElementById('btnCerrarOrdenCompra');
    const tablaOrdenesCompra = document.querySelector('#detallesOrdenCompraTable tbody');

    if (inventarioLista) {
        inventarioLista.addEventListener('click', function(e) {
            const targetElement = e.target.closest('li');
            if (!targetElement) return;

            const text = targetElement.textContent.trim();
            if (text === "Órdenes de compras") {
                mostrarOrdenesCompra();
            }
        });
    }

    function mostrarOrdenesCompra() {
        console.log("Mostrando Órdenes de Compras");
        ocultarTodosPaneles();
        ordenesCompraPanel.style.display = 'block';
        cargarProveedoresDisponibles();
        cargarBodegasDisponibles();
        cargarConsecutivosOrdenesCompra();
        inicializarTablaOrdenesCompra();
    }

    function ocultarTodosPaneles() {
        const paneles = document.querySelectorAll('.panel');
        paneles.forEach(panel => panel.style.display = 'none');
    }

    function cargarProveedoresDisponibles() {
        fetch(`${API_BASE_URL}/api/proveedores`)
            .then(response => response.json())
            .then(data => {
                const selectProveedor = document.getElementById('proveedorOrdenCompra');
                selectProveedor.innerHTML = '<option value="">Seleccione un proveedor</option>';
                data.forEach(proveedor => {
                    const option = document.createElement('option');
                    option.value = proveedor.Nit;
                    option.textContent = proveedor.RazonSocial;
                    selectProveedor.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar proveedores:', error));
    }

    function cargarBodegasDisponibles() {
        fetch(`${API_BASE_URL}/api/bodegas_disponibles`)
            .then(response => response.json())
            .then(data => {
                const selectBodega = document.getElementById('bodegaOrdenCompra');
                selectBodega.innerHTML = '<option value="">Seleccione una bodega</option>';
                data.forEach(bodega => {
                    const option = document.createElement('option');
                    option.value = bodega.IdBodega;
                    option.textContent = bodega.Descripcion;
                    selectBodega.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar bodegas:', error));
    }

    function cargarConsecutivosOrdenesCompra() {
        fetch(`${API_BASE_URL}/api/consecutivos_ordenes_compra`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('consecutivoOrdenCompra');
                select.innerHTML = '<option value="">Seleccione un consecutivo</option>';
                data.forEach(consecutivo => {
                    const option = document.createElement('option');
                    option.value = consecutivo.IdConsecutivo;
                    option.textContent = `${consecutivo.Descripcion} - ${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
                    select.appendChild(option);
                });
    
                if (data.length > 0) {
                    select.value = data[0].IdConsecutivo;
                    actualizarNumeroOrdenCompra(data[0]);
                }
            })
            .catch(error => console.error('Error al cargar consecutivos:', error));
    }

    function actualizarNumeroOrdenCompra(consecutivo) {
        const numeroOrdenCompra = document.getElementById('numeroOrdenCompra');
        numeroOrdenCompra.value = `${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
    }

    function inicializarTablaOrdenesCompra() {
        tablaOrdenesCompra.innerHTML = '';
        agregarFilaVacia();
    }

    function agregarFilaVacia() {
        const newRow = tablaOrdenesCompra.insertRow();
        for (let i = 0; i < 9; i++) {
            const cell = newRow.insertCell();
            if (i === 0) {
                cell.setAttribute('tabindex', '0');
            }
        }
    }

    function nuevoOrdenCompra() {
        console.log("Nueva orden de compra");
        limpiarFormularioOrdenCompra();
        habilitarCamposOrdenCompra(true);
        document.getElementById('fechaOrdenCompra').valueAsDate = new Date();
        document.querySelector('#detallesOrdenCompraTable').style.display = 'table';
        agregarFilaVacia();
    }

    function guardarOrdenCompra() {
        // Implementar la lógica para guardar la orden de compra
        console.log("Guardando orden de compra");
    }

    function editarOrdenCompra() {
        console.log("Editando orden de compra");
        // Implementar la lógica para editar la orden de compra
    }

    function cancelarOrdenCompra() {
        console.log("Cancelando orden de compra");
        limpiarFormularioOrdenCompra();
        habilitarCamposOrdenCompra(false);
    }

    function buscarOrdenCompra() {
        console.log("Buscando orden de compra");
        // Implementar la lógica para buscar órdenes de compra
    }

    function cerrarOrdenCompra() {
        console.log("Cerrando panel de órdenes de compra");
        ordenesCompraPanel.style.display = 'none';
    }

    function limpiarFormularioOrdenCompra() {
        document.getElementById('ordenCompraForm').reset();
        tablaOrdenesCompra.innerHTML = '';
        // Resetear totales
        document.getElementById('totalUnidades').textContent = '0.00';
        document.getElementById('subtotal').textContent = '0.00';
        document.getElementById('valorDescuento').textContent = '0.00';
        document.getElementById('totalImpuestos').textContent = '0.00';
        document.getElementById('totalDocumento').textContent = '0.00';
    }

    function habilitarCamposOrdenCompra(habilitar) {
        const campos = document.querySelectorAll('#ordenCompraForm input, #ordenCompraForm select, #ordenCompraForm textarea');
        campos.forEach(campo => campo.disabled = !habilitar);
        
        btnNuevoOrdenCompra.disabled = habilitar;
        btnGuardarOrdenCompra.disabled = !habilitar;
        btnEditarOrdenCompra.disabled = true;
        btnCancelarOrdenCompra.disabled = !habilitar;
    }

    // Event listeners para los botones
    btnNuevoOrdenCompra.addEventListener('click', nuevoOrdenCompra);
    btnGuardarOrdenCompra.addEventListener('click', guardarOrdenCompra);
    btnEditarOrdenCompra.addEventListener('click', editarOrdenCompra);
    btnCancelarOrdenCompra.addEventListener('click', cancelarOrdenCompra);
    btnBuscarOrdenCompra.addEventListener('click', buscarOrdenCompra);
    btnCerrarOrdenCompra.addEventListener('click', cerrarOrdenCompra);

    // Inicialización
    habilitarCamposOrdenCompra(false);
});
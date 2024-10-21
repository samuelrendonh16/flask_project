document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://migsistemasweb.com';
    const panel = document.getElementById('estadoProductoPanel');
    const tabla = document.getElementById('estadosProductoTable').getElementsByTagName('tbody')[0];
    const inputBuscar = document.getElementById('buscarEstadoProducto');

    const btnNuevo = document.getElementById('btnNuevoEstadoProducto');
    const btnGuardar = document.getElementById('btnGuardarEstadoProducto');
    const btnEditar = document.getElementById('btnEditarEstadoProducto');
    const btnEliminar = document.getElementById('btnEliminarEstadoProducto');
    const btnCancelar = document.getElementById('btnCancelarEstadoProducto');
    const btnCerrar = document.getElementById('btnCerrarEstadoProducto');

    const inputCodigo = document.getElementById('codigoEstadoProducto');
    const inputDescripcion = document.getElementById('descripcionEstadoProducto');
    const inputEstado = document.getElementById('estadoEstadoProducto');

    let modoEdicion = false;
    let estadoProductoSeleccionado = null;

    function cargarEstadosProducto() {
        console.log('Cargando estados de producto...');
        fetch(`${API_BASE_URL}/api/estado_producto`)
            .then(handleResponse)
            .then(data => {
                console.log('Estados de producto cargados:', data);
                tabla.innerHTML = '';
                data.forEach(estado => {
                    const row = tabla.insertRow();
                    row.insertCell(0).textContent = estado.IdEstadoProducto;
                    row.insertCell(1).textContent = estado.EstadoProducto;
                    row.insertCell(2).textContent = estado.Estado ? 'Activo' : 'Inactivo';
                    row.addEventListener('click', () => seleccionarEstadoProducto(estado));
                });
            })
            .catch(handleError);
    }

    function seleccionarEstadoProducto(estado) {
        console.log('Estado de producto seleccionado:', estado);
        estadoProductoSeleccionado = estado;
        inputCodigo.value = estado.IdEstadoProducto;
        inputDescripcion.value = estado.EstadoProducto;
        inputEstado.checked = estado.Estado;
        
        btnEditar.disabled = false;
        btnEliminar.disabled = false;
        habilitarEdicion(false);
    }

    function limpiarFormulario() {
        inputCodigo.value = '';
        inputDescripcion.value = '';
        inputEstado.checked = false;
        estadoProductoSeleccionado = null;
        btnEditar.disabled = true;
        btnEliminar.disabled = true;
    }

    function habilitarEdicion(habilitar) {
        inputCodigo.disabled = !habilitar || modoEdicion;
        inputDescripcion.disabled = !habilitar;
        inputEstado.disabled = !habilitar;
        btnGuardar.disabled = !habilitar;
        btnCancelar.disabled = !habilitar;
    }

    btnNuevo.addEventListener('click', () => {
        console.log('Iniciando nuevo estado de producto');
        modoEdicion = false;
        limpiarFormulario();
        habilitarEdicion(true);
        inputCodigo.focus();
    });

    btnEditar.addEventListener('click', () => {
        if (estadoProductoSeleccionado) {
            console.log('Editando estado de producto:', estadoProductoSeleccionado);
            modoEdicion = true;
            habilitarEdicion(true);
            inputDescripcion.focus();
        }
    });

    btnGuardar.addEventListener('click', () => {
        const estadoProducto = {
            IdEstadoProducto: inputCodigo.value,
            EstadoProducto: inputDescripcion.value,
            Estado: inputEstado.checked
        };
        console.log('Guardando estado de producto:', estadoProducto);

        const url = modoEdicion 
            ? `${API_BASE_URL}/api/estado_producto/${estadoProducto.IdEstadoProducto}` 
            : `${API_BASE_URL}/api/estado_producto`;
        const method = modoEdicion ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(estadoProducto),
        })
        .then(handleResponse)
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                cargarEstadosProducto();
                limpiarFormulario();
                habilitarEdicion(false);
                Swal.fire(modoEdicion ? 'Estado de Producto actualizado exitosamente' : 'Estado de Producto creado exitosamente');
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        })
        .catch(handleError);
    });

    document.getElementById('btnEstadoProducto').addEventListener('click', function() {
        console.log('Abriendo panel de estados de producto');
        panel.style.display = 'block';
        cargarEstadosProducto();
    });

    btnEliminar.addEventListener('click', () => {
        if (estadoProductoSeleccionado && confirm('¿Está seguro de eliminar este Estado de Producto?')) {
            console.log('Eliminando estado de producto:', estadoProductoSeleccionado);
            fetch(`${API_BASE_URL}/api/estado_producto/${estadoProductoSeleccionado.IdEstadoProducto}`, {
                method: 'DELETE',
            })
            .then(handleResponse)
            .then(data => {
                console.log('Respuesta del servidor:', data);
                if (data.success) {
                    cargarEstadosProducto();
                    limpiarFormulario();
                    Swal.fire('Estado de Producto eliminado exitosamente');
                } else {
                    throw new Error(data.message || 'Error desconocido');
                }
            })
            .catch(handleError);
        }
    });

    btnCancelar.addEventListener('click', () => {
        console.log('Cancelando edición');
        limpiarFormulario();
        habilitarEdicion(false);
    });

    btnCerrar.addEventListener('click', () => {
        console.log('Cerrando panel de estados de producto');
        panel.style.display = 'none';
    });

    inputBuscar.addEventListener('input', () => {
        const filtro = inputBuscar.value.toLowerCase();
        Array.from(tabla.getElementsByTagName('tr')).forEach(row => {
            const textoFila = row.textContent.toLowerCase();
            row.style.display = textoFila.includes(filtro) ? '' : 'none';
        });
    });

    function handleResponse(response) {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    }

    function handleError(error) {
        console.error('Error:', error);
        Swal.fire('Error: ' + (error.message || 'Ocurrió un error desconocido'));
    }

    // Cargar los estados de producto al iniciar
    cargarEstadosProducto();
});
document.addEventListener('DOMContentLoaded', function() {
    const inventarioLista = document.getElementById('inventarioLista');
    const ordenesCompraPanel = document.getElementById('ordenesCompraPanel');
    const baseUrl = 'https://migsistemasweb.com';

    // Botones
    const btnNuevoOrdenCompra = document.getElementById('btnNuevoOrdenCompra');
    const btnGuardarOrdenCompra = document.getElementById('btnGuardarOrdenCompra');
    const btnEditarOrdenCompra = document.getElementById('btnEditarOrdenCompra');
    const btnCancelarOrdenCompra = document.getElementById('btnCancelarOrdenCompra');
    const btnBuscarOrdenCompra = document.getElementById('btnBuscarOrdenCompra');
    const btnCerrarOrdenCompra = document.getElementById('btnCerrarOrdenCompra');
    const btnBuscarProveedor = document.getElementById('btnBuscarProveedor');
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
        cargarBodegasDisponiblesOrdenCompras();
        cargarConsecutivosOrdenesCompra();
        inicializarTablaOrdenesCompra();
        limpiarFormularioOrdenCompra();
        habilitarCamposOrdenCompra(false);
        actualizarNumeroOrdenCompra();
    }

    function ocultarTodosPaneles() {
        const paneles = document.querySelectorAll('.panel');
        paneles.forEach(panel => panel.style.display = 'none');
    }

    function cargarProveedoresDisponibles() {
        fetch(`${baseUrl}/api/proveedores`)
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

    function cargarBodegasDisponiblesOrdenCompras() {
        fetch(`${baseUrl}/api/bodegas_disponibles`)
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
        fetch(`${baseUrl}/api/consecutivos_ordenes_compra`)
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

                select.addEventListener('change', function() {
                    const selectedConsecutivo = data.find(c => c.IdConsecutivo == this.value);
                    if (selectedConsecutivo) {
                        actualizarNumeroOrdenCompra();
                    }
                });
            })
            .catch(error => console.error('Error al cargar consecutivos:', error));
    }

    function obtenerUltimoConsecutivo() {
        return fetch(`${baseUrl}/api/ultimo_consecutivo_ordenes_compra`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    return data.ultimoConsecutivo;
                } else {
                    throw new Error('Error al obtener el último consecutivo');
                }
            });
    }

    function actualizarNumeroOrdenCompra() {
        obtenerUltimoConsecutivo()
            .then(ultimoConsecutivo => {
                document.getElementById('numeroOrdenCompra').value = ultimoConsecutivo;
            })
            .catch(error => {
                console.error('Error al actualizar el número de orden de compra:', error);
                mostrarMensaje('Error al obtener el número de orden de compra', 'error');
            });
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
                cell.addEventListener('click', function() {
                    abrirModalBusquedaReferencias(this);
                });
            } else if (i === 3) {
                cell.contentEditable = true;
                cell.addEventListener('input', function() {
                    actualizarSubtotalFilaOrdenCompra(newRow);
                });
            }
        }
        const deleteCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'btn-eliminar';
        deleteBtn.onclick = function() {
            tablaOrdenesCompra.removeChild(newRow);
            actualizarTotalesOrdenCompra();
        };
        deleteCell.appendChild(deleteBtn);
    }

    function abrirModalBusquedaReferencias(cell) {
        console.log("Abriendo modal de búsqueda de referencias");
        const modal = document.getElementById('busquedaReferenciasModal');
        modal.style.display = 'block';
        cargarReferenciasOrdenCompra();
        modal.dataset.cellTarget = cell.cellIndex + '-' + cell.parentElement.rowIndex;
        console.log("Cell target:", modal.dataset.cellTarget);
    }

    function cargarReferenciasOrdenCompra(filtro = '') {
        console.log("Cargando referencias con filtro:", filtro);
        fetch(`${baseUrl}/api/referencias?filtro=${encodeURIComponent(filtro)}`)
            .then(response => response.json())
            .then(data => {
                console.log("Referencias cargadas:", data);
                const tabla = document.querySelector('#referenciasTable tbody');
                tabla.innerHTML = '';
                data.forEach(ref => {
                    let row = tabla.insertRow();
                    row.innerHTML = `
                        <td>${ref.IdReferencia}</td>
                        <td>${ref.Referencia}</td>
                        <td>${ref.PrecioVenta1}</td>
                        <td>${ref.IVA}</td>
                        <td>${ref.Ubicacion}</td>
                        <td>${ref.idbodega}</td>
                        <td>${ref.IdUnidad}</td>
                    `;
                    row.addEventListener('click', () => seleccionarReferenciaOrdenCompra(ref));
                });
            })
            .catch(error => console.error('Error al cargar referencias:', error));
    }

    function seleccionarReferenciaOrdenCompra(referencia) {
        const modal = document.getElementById('busquedaReferenciasModal');
        const [cellIndex, rowIndex] = modal.dataset.cellTarget.split('-');
        const row = tablaOrdenesCompra.rows[rowIndex];

        if (!row) {
            console.error('Fila no encontrada. Añadiendo nueva fila.');
            agregarFilaVacia();
            const newRowIndex = tablaOrdenesCompra.rows.length - 1;
            const newRow = tablaOrdenesCompra.rows[newRowIndex];
            llenarFilaConReferencia(newRow, referencia);
        } else {
            llenarFilaConReferencia(row, referencia);
        }

        modal.style.display = 'none';
    }

    function llenarFilaConReferencia(row, referencia) {
        row.cells[0].textContent = referencia.IdReferencia;
        row.cells[1].textContent = referencia.Referencia;
        row.cells[2].textContent = referencia.IdUnidad;
        row.cells[3].textContent = '1';
        row.cells[4].textContent = referencia.PrecioVenta1;
        const valorConIVA = (parseFloat(referencia.PrecioVenta1) * (1 + parseFloat(referencia.IVA) / 100)).toFixed(2);
        row.cells[5].textContent = valorConIVA;
        row.cells[6].textContent = '0';
        row.cells[7].textContent = referencia.IVA;

        actualizarSubtotalFilaOrdenCompra(row);
    }

    function actualizarSubtotalFilaOrdenCompra(row) {
        const cantidad = parseFloat(row.cells[3].textContent) || 0;
        const valorConIVA = parseFloat(row.cells[5].textContent) || 0;
        const descuento = parseFloat(row.cells[6].textContent) || 0;
        const subtotal = (cantidad * valorConIVA) - descuento;
        row.cells[8].textContent = subtotal.toFixed(2);
        actualizarTotalesOrdenCompra();
    }

    function actualizarTotalesOrdenCompra() {
        let totalUnidades = 0;
        let subtotal = 0;
        let totalDescuento = 0;
        let totalImpuestos = 0;

        tablaOrdenesCompra.querySelectorAll('tr').forEach(row => {
            const cantidad = parseFloat(row.cells[3].textContent) || 0;
            const valorSinIVA = parseFloat(row.cells[4].textContent) || 0;
            const descuento = parseFloat(row.cells[6].textContent) || 0;
            const iva = parseFloat(row.cells[7].textContent) || 0;

            totalUnidades += cantidad;
            subtotal += cantidad * valorSinIVA;
            totalDescuento += descuento;
            totalImpuestos += (cantidad * valorSinIVA * iva / 100);
        });

        const totalDocumento = subtotal - totalDescuento + totalImpuestos;

        document.getElementById('totalUnidadesOrdenCompra').value = totalUnidades.toFixed(2);
        document.getElementById('subtotalOrdenCompra').value = subtotal.toFixed(2);
        document.getElementById('valorDescuentoOrdenCompra').value = totalDescuento.toFixed(2);
        document.getElementById('totalImpuestosOrdenCompra').value = totalImpuestos.toFixed(2);
        document.getElementById('totalDocumentoOrdenCompra').value = totalDocumento.toFixed(2);
    }

    function nuevoOrdenCompra() {
        console.log("Nueva orden de compra");
        limpiarFormularioOrdenCompra();
        habilitarCamposOrdenCompra(true);
        document.getElementById('fechaOrdenCompra').valueAsDate = new Date();
        document.querySelector('#detallesOrdenCompraTable').style.display = 'table';
        agregarFilaVacia();
        actualizarNumeroOrdenCompra();
    }

    function guardarOrdenCompra() {
        console.log("Guardando orden de compra");
        const ordenCompra = {
            numero: document.getElementById('numeroOrdenCompra').value,
            fecha: document.getElementById('fechaOrdenCompra').value,
            proveedor: document.getElementById('proveedorOrdenCompra').value,
            bodega: document.getElementById('bodegaOrdenCompra').value,
            observaciones: document.getElementById('observacionesOrdenCompra').value,
            totalUnidades: document.getElementById('totalUnidadesOrdenCompra').value,
            subtotal: document.getElementById('subtotalOrdenCompra').value,
            valorDescuento: document.getElementById('valorDescuentoOrdenCompra').value,
            totalImpuestos: document.getElementById('totalImpuestosOrdenCompra').value,
            totalDocumento: document.getElementById('totalDocumentoOrdenCompra').value
        };
    
        if (!ordenCompra.proveedor) {
            mostrarMensaje('Por favor, seleccione un proveedor', 'error');
            return;
        }
    
        const detalles = [];
        tablaOrdenesCompra.querySelectorAll('tr').forEach(row => {
            const idReferencia = row.cells[0].textContent.trim();
            if (idReferencia) {
                const cantidad = parseFloat(row.cells[3].textContent) || 0;
                const valorUnitario = parseFloat(row.cells[4].textContent) || 0;
                const iva = parseFloat(row.cells[7].textContent) || 0;
                
                detalles.push({
                    idReferencia: idReferencia,
                    descripcion: row.cells[1].textContent.trim(),
                    unidad: row.cells[2].textContent.trim(),
                    cantidad: cantidad,
                    valorUnitario: valorUnitario,
                    valorTotal: cantidad * valorUnitario,
                    descuento: parseFloat(row.cells[6].textContent) || 0,
                    iva: iva,
                    subtotal: (cantidad * valorUnitario * (1 + iva / 100)).toFixed(2)
                });
            }
        });
    
        if (detalles.length === 0) {
            mostrarMensaje('La orden de compra debe tener al menos un detalle', 'error');
            return;
        }
    
        console.log("Datos a enviar:", { ordenCompra, detalles });
    
        fetch(`${baseUrl}/api/guardar_orden_compra`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ordenCompra, detalles })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del servidor:", data);
            if (data.success) {
                mostrarMensaje('Orden de compra guardada y enviada por correo exitosamente', 'success');
                actualizarNumeroOrdenCompra();
                habilitarCamposOrdenCompra(false);
            } else {
                mostrarMensaje('Error al guardar la orden de compra: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al guardar la orden de compra: ' + error.message, 'error');
        });
    }

    function mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.textContent = mensaje;
        mensajeDiv.className = `mensaje-${tipo}`;
        mensajeDiv.style.position = 'fixed';
        mensajeDiv.style.top = '10px';
        mensajeDiv.style.left = '50%';
        mensajeDiv.style.transform = 'translateX(-50%)';
        mensajeDiv.style.padding = '10px';
        mensajeDiv.style.borderRadius = '5px';
        mensajeDiv.style.zIndex = '1000';

        if (tipo === 'success') {
            mensajeDiv.style.backgroundColor = '#4CAF50';
            mensajeDiv.style.color = 'white';
        } else if (tipo === 'error') {
            mensajeDiv.style.backgroundColor = '#f44336';
            mensajeDiv.style.color = 'white';
        }

        document.body.appendChild(mensajeDiv);

        setTimeout(() => {
            document.body.removeChild(mensajeDiv);
        }, 5000);
    }

    function editarOrdenCompra() {
        console.log("Editando orden de compra");
        habilitarCamposOrdenCompra(true);
    }

    function cancelarOrdenCompra() {
        console.log("Cancelando orden de compra");
        limpiarFormularioOrdenCompra();
        habilitarCamposOrdenCompra(false);
    }

    function cerrarOrdenCompra() {
        console.log("Cerrando panel de órdenes de compra");
        ordenesCompraPanel.style.display = 'none';
        limpiarFormularioOrdenCompra();
        habilitarCamposOrdenCompra(false);
    }

    function limpiarFormularioOrdenCompra() {
        document.getElementById('ordenCompraForm').reset();
        document.getElementById('numeroOrdenCompra').value = '';
        tablaOrdenesCompra.innerHTML = '';
        document.getElementById('totalUnidadesOrdenCompra').value = '0';
        document.getElementById('subtotalOrdenCompra').value = '0';
        document.getElementById('valorDescuentoOrdenCompra').value = '0.00';
        document.getElementById('totalImpuestosOrdenCompra').value = '0.00';
        document.getElementById('totalDocumentoOrdenCompra').value = '0';
    }

    function habilitarCamposOrdenCompra(habilitar) {
        const campos = document.querySelectorAll('#ordenCompraForm input, #ordenCompraForm select, #ordenCompraForm textarea');
        campos.forEach(campo => {
            campo.disabled = !habilitar;
            if (campo.id === 'numeroOrdenCompra') {
                campo.readOnly = true;
            }
        });

        if (btnNuevoOrdenCompra) btnNuevoOrdenCompra.disabled = habilitar;
        if (btnGuardarOrdenCompra) btnGuardarOrdenCompra.disabled = !habilitar;
        if (btnEditarOrdenCompra) btnEditarOrdenCompra.disabled = habilitar;
        if (btnCancelarOrdenCompra) btnCancelarOrdenCompra.disabled = !habilitar;
    }

    function buscarProveedor() {
        console.log("Buscando proveedor");
        let modal = document.getElementById('proveedoresModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'proveedoresModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Seleccionar Proveedor</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <input type="text" id="buscarProveedorInput" placeholder="Buscar proveedor...">
                        <table id="proveedoresTable">
                            <thead>
                                <tr>
                                    <th>NIT</th>
                                    <th>Razón Social</th>
                                    <th>Dirección</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const span = modal.querySelector('.close');
        const table = modal.querySelector('#proveedoresTable tbody');
        const input = modal.querySelector('#buscarProveedorInput');

        table.innerHTML = '';

        fetch(`${baseUrl}/api/proveedores`)
            .then(response => response.json())
            .then(data => {
                data.forEach(proveedor => {
                    let row = table.insertRow();
                    row.innerHTML = `
                        <td>${proveedor.Nit}</td>
                        <td>${proveedor.RazonSocial}</td>
                        <td>${proveedor.Email}</td>
                        <td>${proveedor.Direccion || ''}</td>
                        <td>${proveedor.Telefono1 || ''}</td>
                        <td>${proveedor.Estado ? 'Activo' : 'Inactivo'}</td>
                    `;
                    row.addEventListener('click', function() {
                        document.getElementById('proveedorOrdenCompra').value = proveedor.Nit;
                        document.getElementById('proveedorOrdenCompraDescripcion').value = proveedor.RazonSocial;
                        modal.style.display = "none";
                    });
                });
            })
            .catch(error => console.error('Error:', error));

        modal.style.display = "block";

        span.onclick = function() {
            modal.style.display = "none";
        }

        input.onkeyup = function() {
            let filter = input.value.toUpperCase();
            let rows = table.getElementsByTagName("tr");
            for (let i = 0; i < rows.length; i++) {
                let td = rows[i].getElementsByTagName("td")[1]; // Filtra por Razón Social
                if (td) {
                    let txtValue = td.textContent || td.innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        rows[i].style.display = "";
                    } else {
                        rows[i].style.display = "none";
                    }
                }
            }
        }
    }

    // Event listeners
    if (btnNuevoOrdenCompra) btnNuevoOrdenCompra.addEventListener('click', nuevoOrdenCompra);
    if (btnGuardarOrdenCompra) btnGuardarOrdenCompra.addEventListener('click', guardarOrdenCompra);
    if (btnEditarOrdenCompra) btnEditarOrdenCompra.addEventListener('click', editarOrdenCompra);
    if (btnCancelarOrdenCompra) btnCancelarOrdenCompra.addEventListener('click', cancelarOrdenCompra);
    if (btnBuscarOrdenCompra) btnBuscarOrdenCompra.addEventListener('click', buscarOrdenCompra);
    if (btnCerrarOrdenCompra) btnCerrarOrdenCompra.addEventListener('click', cerrarOrdenCompra);
    if (btnBuscarProveedor) btnBuscarProveedor.addEventListener('click', buscarProveedor);

    // Event listeners para la tabla de detalles
    tablaOrdenesCompra.addEventListener('input', function(e) {
        if (e.target.cellIndex >= 3 && e.target.cellIndex <= 7) {
            actualizarSubtotalFilaOrdenCompra(e.target.closest('tr'));
        }
    });

    document.getElementById('btnAgregarDetalle').addEventListener('click', agregarFilaVacia);

    document.getElementById('btnBuscarReferencia').addEventListener('click', function() {
        const filtro = document.getElementById('buscarReferenciaInput').value;
        cargarReferenciasOrdenCompra(filtro);
    });

    // Cerrar el modal de búsqueda de referencias
    document.querySelector('#busquedaReferenciasModal .close').addEventListener('click', function() {
        document.getElementById('busquedaReferenciasModal').style.display = 'none';
    });

    // Inicialización
    habilitarCamposOrdenCompra(false);

    // Exponer la función mostrarOrdenesCompra globalmente
    window.mostrarOrdenesCompra = mostrarOrdenesCompra;
});
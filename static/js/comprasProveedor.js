document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded para Compras de Proveedor');

    const inventarioLista = document.getElementById('inventarioLista');
    const comprasProveedorPanel = document.getElementById('comprasProveedorPanel');
    const btnCerrarCompra = document.getElementById('btnCerrarCompra');
    const tablaCompras = document.querySelector('#detallesCompraTable tbody');
    const API_BASE_URL = 'https://migsistemasweb.com';

    // Botones
    const btnNuevoCompra = document.getElementById('btnNuevoCompra');
    const btnGuardarCompra = document.getElementById('btnGuardarCompra');
    const btnEditarCompra = document.getElementById('btnEditarCompra');
    const btnCancelarCompra = document.getElementById('btnCancelarCompra');
    const btnAnularCompra = document.getElementById('btnAnularCompra');
    const btnBuscarCompra = document.getElementById('btnBuscarCompra');
    const btnImprimirCompra = document.getElementById('btnImprimirCompra');

    // Modal de búsqueda de referencias
    const modalReferencias = document.getElementById('busquedaReferenciasModal');
    const spanCerrarReferencias = modalReferencias.querySelector(".close");
    const buscarReferenciaInput = document.getElementById('buscarReferencia');
    const btnBuscarReferencia = document.getElementById('btnBuscarReferencia');

    function mostrarComprasProveedor() {
        console.log("Mostrando Compras de Proveedor");
        ocultarTodosPaneles();
        comprasProveedorPanel.style.display = 'block';
        cargarConsecutivosCompra();
        cargarProveedoresCompras();
        cargarBodegasCompras();
        inicializarTablaCompras();
        inicializarTotalesCompraCompra();
    }

    function ocultarTodosPaneles() {
        const paneles = document.querySelectorAll('.panel');
        paneles.forEach(panel => panel.style.display = 'none');
    }

    function cargarConsecutivosCompra() {
        console.log("Cargando consecutivos de compras de proveedor");
        fetch(`${API_BASE_URL}/api/consecutivos_compra`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Consecutivos cargados:", data);
                const select = document.getElementById('consecutivoCompra');
                select.innerHTML = '<option value="">Seleccione un consecutivo</option>';
                data.forEach(consecutivo => {
                    const option = document.createElement('option');
                    option.value = consecutivo.IdConsecutivo;
                    option.textContent = `${consecutivo.Descripcion} - ${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
                    select.appendChild(option);
                });

                if (data.length > 0) {
                    select.value = data[0].IdConsecutivo;
                    actualizarNumeroCompra(data[0]);
                }
            })
            .catch(error => {
                console.error('Error al cargar consecutivos:', error);
                alert(`Error al cargar consecutivos: ${error.message}`);
            });
    }

    function actualizarNumeroCompra(consecutivo) {
        console.log("Actualizando número de compra", consecutivo);
        const numeroCompra = document.getElementById('numeroCompra');
        numeroCompra.value = `${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
    }

    function cargarProveedoresCompras() {
        fetch(`${API_BASE_URL}/api/proveedores`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('proveedorCompra');
                select.innerHTML = '<option value="">Seleccione un proveedor</option>';
                data.forEach(proveedor => {
                    const option = document.createElement('option');
                    option.value = proveedor.Nit;
                    option.textContent = proveedor.RazonSocial;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar proveedores:', error));
    }

    function cargarBodegasCompras() {
        fetch(`${API_BASE_URL}/api/bodegas_disponibles`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('bodegaCompra');
                select.innerHTML = '<option value="">Seleccione una bodega</option>';
                data.forEach(bodega => {
                    const option = document.createElement('option');
                    option.value = bodega.IdBodega;
                    option.textContent = bodega.Descripcion;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar bodegas:', error));
    }

    function inicializarTotalesCompraCompra() {
        const totales = [
            'totalUnidadesCompra', 'subtotalCompra', 'valorDescuentoCompra', 'totalIVACompra', 
            'totalImpoconsumoCompra', 'totalICUICompra', 'totalIBUACompra', 'totalIPCCompra', 
            'totalDocumentoCompra', 'retefuenteCompra', 'reteIVACompra', 'reteICACompra',
            'totalFleteCompra', 'descuentoPorcentajeCompra'
        ];

        totales.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = '0.00';
                if (id !== 'reteIVACompra' && id !== 'reteICACompra') {
                    elemento.readOnly = true;
                }
            }
        });

        ['totalFleteCompra', 'descuentoPorcentajeCompra'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.readOnly = false;
                elemento.addEventListener('input', actualizarTotalesCompra);
            }
        });
    }

    async function nuevaCompra() {
        console.log("Nueva compra");
        limpiarFormularioCompra();
        habilitarCamposCompra(true);
        await cargarUltimoConsecutivoCompras();
        document.getElementById('fechaDocumento').valueAsDate = new Date();
        document.querySelector('#detallesCompraTable').style.display = 'table';
        agregarFilaVaciaCompras();
        inicializarTotalesCompraCompra();
    }

    async function guardarCompra() {
        console.log('Guardando compra');
        if (!(await verificarReferencias())) {
            return;
        }
    
        const datosCompra = recogerDatosFormularioCompra();
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/guardar_compra`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosCompra)
            });
            const data = await response.json();
    
            if (data.success) {
                await Swal.fire('Éxito', 'Compra guardada correctamente', 'success');
                actualizarInterfazDespuesDeGuardar(data);
                await actualizarConsecutivoCompra();
            } else {
                throw new Error(data.message || 'Error al guardar la compra');
            }
        } catch (error) {
            console.error('Error al guardar la compra:', error);
            Swal.fire('Error', `Error al guardar la compra: ${error.message}`, 'error');
        }
    }

    function editarCompra() {
        console.log('Editando compra');
        habilitarCamposCompra(true);
    }

    function cancelarCompra() {
        console.log('Cancelando operación de compra');
        limpiarFormularioCompra();
        habilitarCamposCompra(false);
    }

    function anularCompra() {
        console.log('Anulando compra');
        Swal.fire({
            title: '¿Está seguro de anular esta compra?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const numeroCompra = document.getElementById('numeroCompra').value;
                fetch(`${API_BASE_URL}/api/anular_compra`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ numero: numeroCompra })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Anulada', 'La compra ha sido anulada.', 'success');
                        actualizarInterfazDespuesDeAnular();
                    } else {
                        throw new Error(data.message || 'Error al anular la compra');
                    }
                })
                .catch(error => {
                    console.error('Error al anular la compra:', error);
                    Swal.fire('Error', `Error al anular la compra: ${error.message}`, 'error');
                });
            }
        });
    }

    function buscarCompra() {
        console.log('Buscando compra');
        // Implementar lógica para buscar compras existentes
    }

    function imprimirCompra() {
        console.log('Imprimiendo compra');
        const numeroCompra = document.getElementById('numeroCompra').value;
        if (!numeroCompra) {
            Swal.fire('Error', 'No hay una compra seleccionada para imprimir', 'error');
            return;
        }
        window.open(`${API_BASE_URL}/api/imprimir_compra/${numeroCompra}`, '_blank');
    }

    function limpiarFormularioCompra() {
        console.log('Limpiando formulario de compra');
        document.getElementById('compraProveedorForm').reset();
        limpiarTablaDetallesCompras();
        inicializarTotalesCompraCompra();
    }

    function limpiarTablaDetallesCompras() {
        const tablaDetalles = document.querySelector('#detallesCompraTable tbody');
        if (tablaDetalles) {
            tablaDetalles.innerHTML = '';
            agregarFilaVaciaCompras();
        } else {
            console.error('Tabla de detalles no encontrada');
        }
    }

    function habilitarCamposCompra(habilitar) {
        const campos = comprasProveedorPanel.querySelectorAll('input, select, textarea');
        campos.forEach(campo => {
            campo.disabled = !habilitar;
        });

        btnNuevoCompra.disabled = habilitar;
        btnGuardarCompra.disabled = !habilitar;
        btnEditarCompra.disabled = habilitar;
        btnCancelarCompra.disabled = !habilitar;
        btnAnularCompra.disabled = !habilitar;

        // Asegurar que Total Flete y Descuento % siempre estén habilitados
        document.getElementById('totalFleteCompra').disabled = false;
        document.getElementById('descuentoPorcentajeCompra').disabled = false;
    }

    function recogerDatosFormularioCompra() {
        const fechaDocumento = document.getElementById('fechaDocumento').value;
        return {
            compra1: {
                Numero: document.getElementById('numeroCompra').value || null,
                Mes: obtenerMes(fechaDocumento),
                Anulado: false, // Por defecto, la nueva compra no está anulada
                Fecha: fechaDocumento || null,
                FechaCreacion: new Date().toISOString(),
                fechamodificacion: new Date().toISOString(),
                Observaciones: document.getElementById('observacionesCompra').value || null,
                IdUsuario: 'MIG', // Asumiendo un usuario por defecto, ajusta según necesites
                IdBodega: document.getElementById('bodegaCompra').value || null,
                Nit: document.getElementById('proveedorCompra').value || null,
                NumFactura: document.getElementById('numeroFactura').value || null,
                IdConsecutivo: document.getElementById('consecutivoCompra').value || null,
                descuento: parseFloat(document.getElementById('descuentoPorcentajeCompra').value) || 0,
                retefuente: parseFloat(document.getElementById('retefuenteCompra').value) || 0,
                reteica: document.getElementById('reteICACompra').checked,
                reteiva: document.getElementById('reteIVACompra').checked,
                total: parseFloat(document.getElementById('totalDocumentoCompra').value) || 0,
                totaliva: parseFloat(document.getElementById('totalIVACompra').value) || 0,
                subtotal: parseFloat(document.getElementById('subtotalCompra').value) || 0,
                totaldescuento: parseFloat(document.getElementById('valorDescuentoCompra').value) || 0,
                flete: parseFloat(document.getElementById('totalFleteCompra').value) || 0,
                totalipc: parseFloat(document.getElementById('totalIPCCompra').value) || 0,
                total_ibua: parseFloat(document.getElementById('totalIBUACompra').value) || 0,
                total_icui: parseFloat(document.getElementById('totalICUICompra').value) || 0,
                // Campos adicionales que podrías necesitar, ajusta según tus requerimientos
                IdCentroCosto: null,
                idimpuesto: null,
                porcretefuente: null,
                documento1: null,
                cantidadmetaldisponible: null,
                totalcantidadmetal: null,
                topemaximo: null,
                acumulado: null,
                totalcompras: null,
                tipoempresa: null,
                tipoproveedor: null,
                calculareteiva: false,
                calculareteica: false,
                porcuotas: false,
                valorindustriacomercio: 0,
                transmitido: false
            },
            compras2: obtenerDetallesCompra()
        };
    }

    function obtenerDetallesCompra() {
        const detalles = [];
        const filas = document.querySelectorAll('#detallesCompraTable tbody tr');
        filas.forEach((fila, index) => {
            if (fila.cells[0].textContent.trim() !== '') {
                detalles.push({
                    ID: `${document.getElementById('numeroCompra').value}_${(index + 1).toString().padStart(3, '0')}`,
                    Numero: document.getElementById('numeroCompra').value,
                    IdReferencia: fila.cells[0].textContent.trim(),
                    Descripcion: fila.cells[1].textContent,
                    Cantidad: parseFloat(fila.cells[3].textContent) || 0,
                    Valor: parseFloat(fila.cells[4].textContent) || 0,
                    IVA: parseFloat(fila.cells[6].textContent) || 0,
                    Descuento: parseFloat(fila.cells[7].textContent) || 0,
                    idunidad: fila.cells[2].textContent,
                    ipc: parseFloat(fila.cells[8].textContent) || 0,
                    imp_ibua: parseFloat(fila.cells[9].textContent) || 0,
                    imp_icui: parseFloat(fila.cells[10].textContent) || 0,
                    precioventa1: parseFloat(fila.cells[14].textContent) || 0,
                    margen: parseFloat(fila.cells[15].textContent) || 0,
                    NumOrdenCompra: null,
                    NumEntradaCia: null,
                    idfuente: null,
                    IdCentroCosto: null,
                    descuentounitario: null,
                    ley: null,
                    peso: null,
                    tipo: null,
                    lote: null
                });
            }
        });
        return detalles;
    }

    function inicializarTablaCompras() {
        tablaCompras.innerHTML = '';
        agregarFilaVaciaCompras();
        tablaCompras.addEventListener('click', manejarClickEnTabla);
        tablaCompras.addEventListener('input', manejarInputEnTabla);
    }

    function agregarFilaVaciaCompras() {
        const newRow = tablaCompras.insertRow();
        for (let i = 0; i < 17; i++) {
            const cell = newRow.insertCell();
            if (i === 0) {
                cell.setAttribute('tabindex', '0');
                cell.classList.add('celda-interactiva');
            }
        }
        // Añadir botón de eliminar
        const deleteCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'btn-eliminar';
        deleteBtn.onclick = function() {
            tablaCompras.removeChild(newRow);
            actualizarTotalesCompra();
        };
        deleteCell.appendChild(deleteBtn);
    }

    function manejarClickEnTabla(event) {
        if (event.target.cellIndex === 0) {
            abrirModalReferencias();
        }
    }

    function manejarInputEnTabla(event) {
        const fila = event.target.closest('tr');
        if (fila) {
            calcularTotalesFilaCompra(fila);
            actualizarTotalesCompra();
        }
    }

    function abrirModalReferencias() {
        console.log('Abriendo modal de búsqueda de referencias');
        const idBodega = document.getElementById('bodegaCompra').value;
        if (!idBodega) {
            Swal.fire({
                title: 'Atención',
                text: 'Por favor, seleccione una bodega primero.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        modalReferencias.style.display = "block";
        if (window.innerWidth <= 768) {
            modalReferencias.classList.add('modal-fullscreen');
        }
        cargarReferencias();
    }

    function cargarReferencias(filtro = '') {
        const idBodega = document.getElementById('bodegaCompra').value;
        fetch(`${API_BASE_URL}/api/referencias?filtro=${encodeURIComponent(filtro)}&idBodega=${idBodega}`)
            .then(response => response.json())
            .then(data => {
                console.log("Referencias cargadas:", data);
                const tabla = modalReferencias.querySelector('#referenciasTable tbody');
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
                        <td>${ref.Saldo}</td>
                    `;
                    row.addEventListener('click', () => seleccionarReferencia(ref));
                });
            })
            .catch(error => console.error('Error al cargar referencias:', error));
    }

    function seleccionarReferencia(ref) {
        agregarProductoACompra(ref);
        cerrarModalReferencias();
    }

    function cerrarModalReferencias() {
        modalReferencias.style.display = 'none';
        if (window.innerWidth <= 768) {
            modalReferencias.classList.remove('modal-fullscreen');
        }
    }

    function agregarProductoACompra(producto) {
        const tbody = document.querySelector('#detallesCompraTable tbody');
        const filaExistente = Array.from(tbody.rows).find(row => row.cells[0].textContent === producto.IdReferencia);

        if (filaExistente) {
            const cantidadCell = filaExistente.cells[3];
            const cantidadActual = parseFloat(cantidadCell.textContent) || 0;
            cantidadCell.textContent = (cantidadActual + 1).toString();
            calcularTotalesFilaCompra(filaExistente);
        } else {
            const newRow = tbody.insertRow();
            newRow.innerHTML = `
                <td>${producto.IdReferencia}</td>
                <td>${producto.Referencia}</td>
                <td>${producto.IdUnidad}</td>
                <td contenteditable="true">1</td>
                <td contenteditable="true">${producto.PrecioVenta1}</td>
                <td></td>
                <td>${producto.IVA}</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">0</td>
                <td></td>
                <td></td>
                <td></td>
                <td contenteditable="true">${producto.PrecioVenta1}</td>
                <td contenteditable="true">0</td>
                <td>${producto.PrecioVenta1}</td>
                <td><button class="btn-eliminar">X</button></td>
            `;

            const editableCells = newRow.querySelectorAll('td[contenteditable="true"]');
            editableCells.forEach(cell => {
                cell.addEventListener('input', function() {
                    calcularTotalesFilaCompra(newRow);
                    actualizarTotalesCompra();
                });
            });

            newRow.querySelector('.btn-eliminar').addEventListener('click', function() {
                tbody.removeChild(newRow);
                actualizarTotalesCompra();
            });
        }

        actualizarTotalesCompra();
    }

    function calcularTotalesFilaCompra(fila) {
        const cantidad = parseFloat(fila.cells[3].textContent) || 0;
        const valorConIVA = parseFloat(fila.cells[4].textContent) || 0;
        const iva = parseFloat(fila.cells[6].textContent) || 0;
        const descuento = parseFloat(fila.cells[7].textContent) || 0;

        const valorSinIVA = valorConIVA / (1 + iva / 100);
        const subtotal = cantidad * valorSinIVA * (1 - descuento / 100);

        fila.cells[5].textContent = valorSinIVA.toFixed(2); // Valor sin IVA
        fila.cells[16].textContent = subtotal.toFixed(2); // Subtotal
    }

    function actualizarTotalesCompra() {
        let totalUnidades = 0;
        let subtotal = 0;
        let totalIVA = 0;
        let totalDescuento = 0;
        let totalIPC = 0;
        let totalIBUA = 0;
        let totalICUI = 0;
        let totalImpoconsumo = 0;

        const filas = document.querySelectorAll('#detallesCompraTable tbody tr');
        filas.forEach(fila => {
            const cantidad = parseFloat(fila.cells[3].textContent) || 0;
            const valorSinIVA = parseFloat(fila.cells[5].textContent) || 0;
            const iva = parseFloat(fila.cells[6].textContent) || 0;
            const descuento = parseFloat(fila.cells[7].textContent) || 0;
            const ipc = parseFloat(fila.cells[8].textContent) || 0;
            const icui = parseFloat(fila.cells[9].textContent) || 0;
            const ibua = parseFloat(fila.cells[10].textContent) || 0;

            totalUnidades += cantidad;
            const subtotalFila = cantidad * valorSinIVA * (1 - descuento / 100);
            subtotal += subtotalFila;
            totalIVA += (subtotalFila * iva) / 100;
            totalDescuento += (cantidad * valorSinIVA * descuento) / 100;
            totalIPC += (subtotalFila * ipc) / 100;
            totalICUI += (subtotalFila * icui) / 100;
            totalIBUA += (subtotalFila * ibua) / 100;
        });

        const descuentoPorcentaje = parseFloat(document.getElementById('descuentoPorcentajeCompra').value) || 0;
        const totalFlete = parseFloat(document.getElementById('totalFleteCompra').value) || 0;
        const valorDescuento = (subtotal * descuentoPorcentaje) / 100;

        const totalDocumento = subtotal + totalIVA + totalIPC + totalIBUA + totalICUI + totalImpoconsumo + totalFlete - valorDescuento;

        // Calcular retenciones
        const retefuente = subtotal * 0.025; // 2.5% de retención en la fuente
        const reteIVA = totalIVA * 0.15; // 15% de retención de IVA
        const reteICA = subtotal * 0.006; // 0.6% de retención de ICA

        // Actualizar los campos
        actualizarCampoCompra('totalUnidadesCompra', totalUnidades);
        actualizarCampoCompra('subtotalCompra', subtotal);
        actualizarCampoCompra('valorDescuentoCompra', valorDescuento);
        actualizarCampoCompra('totalIVACompra', totalIVA);
        actualizarCampoCompra('totalImpoconsumoCompra', totalImpoconsumo);
        actualizarCampoCompra('totalIPCCompra', totalIPC);
        actualizarCampoCompra('totalIBUACompra', totalIBUA);
        actualizarCampoCompra('totalICUICompra', totalICUI);
        actualizarCampoCompra('totalDocumentoCompra', totalDocumento);
        actualizarCampoCompra('retefuenteCompra', retefuente);
    }

    function actualizarCampoCompra(id, valor) {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = valor.toFixed(2);
        } else {
            console.error(`Campo ${id} no encontrado`);
        }
    }

    async function cargarUltimoConsecutivoCompras() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ultimo_consecutivo_compras`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                document.getElementById('numeroCompra').value = data.ultimoConsecutivo;
            } else {
                console.error('Error al cargar el último consecutivo:', data.message);
            }
        } catch (error) {
            console.error('Error al cargar el último consecutivo:', error);
            alert(`Error al cargar el último consecutivo: ${error.message}`);
        }
    }

    function actualizarInterfazDespuesDeGuardar(data) {
        document.getElementById('numeroCompra').value = data.numeroCompra;
        habilitarCamposCompra(false);
    }

    function actualizarInterfazDespuesDeAnular() {
        limpiarFormularioCompra();
        habilitarCamposCompra(false);
    }

    async function verificarReferencias() {
        const referencias = Array.from(document.querySelectorAll('#detallesCompraTable tbody tr'))
            .map(row => {
                const ref = row.cells[0].textContent.trim();
                return ref.replace(/[^\w\s-]/gi, '').trim();
            })
            .filter(ref => ref !== '');

        if (referencias.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'No hay referencias válidas para verificar',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/verificar_referencias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ referencias })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            if (!data.success) {
                Swal.fire({
                    title: 'Error',
                    text: `Referencias inválidas: ${data.invalid_references ? data.invalid_references.join(', ') : 'Desconocidas'}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error al verificar referencias:', error);
            Swal.fire({
                title: 'Error',
                text: `No se pudieron verificar las referencias: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return false;
        }
    }

    async function actualizarConsecutivoCompra() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/actualizar_consecutivo_compras`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                document.getElementById('numeroCompra').value = data.nuevoConsecutivo;
                
                // Actualizar el select de consecutivos
                const selectConsecutivo = document.getElementById('consecutivoCompra');
                const opcionSeleccionada = selectConsecutivo.options[selectConsecutivo.selectedIndex];
                if (opcionSeleccionada) {
                    const partes = opcionSeleccionada.textContent.split(' - ');
                    opcionSeleccionada.textContent = `${partes[0]} - ${data.nuevoConsecutivo}`;
                }
                
                console.log('Consecutivo actualizado:', data.nuevoConsecutivo);
            } else {
                console.error('Error al actualizar consecutivo:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    function obtenerMes(fecha) {
        const date = new Date(fecha);
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    function buscarProveedorCompra() {
        console.log("Función buscarProveedor llamada");
        let modal = document.getElementById('proveedoresModal');

        if (!modal) {
            console.log("Creando modal de proveedores");
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
                                    <th>Email</th>
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

        console.log("Cargando proveedores desde la API");
        fetch(`${API_BASE_URL}/api/proveedores`)
            .then(response => response.json())
            .then(data => {
                console.log(`${data.length} proveedores cargados`);
                data.forEach(proveedor => {
                    let row = table.insertRow();
                    row.innerHTML = `
                        <td>${proveedor.Nit}</td>
                        <td>${proveedor.RazonSocial}</td>
                        <td>${proveedor.Email || ''}</td>
                        <td>${proveedor.Direccion || ''}</td>
                        <td>${proveedor.Telefono1 || ''}</td>
                        <td>${proveedor.Estado ? 'Activo' : 'Inactivo'}</td>
                    `;
                    row.addEventListener('click', function() {
                        console.log(`Proveedor seleccionado: ${proveedor.Nit}`);
                        document.getElementById('proveedorCompra').value = proveedor.Nit;
                        modal.style.display = "none";
                    });
                });
            })
            .catch(error => console.error('Error al cargar proveedores:', error));

        console.log("Mostrando modal de proveedores");
        modal.style.display = "block";

        span.onclick = function() {
            console.log("Cerrando modal de proveedores");
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

    function cerrarComprasProveedor() {
        comprasProveedorPanel.style.display = 'none';
        limpiarFormularioCompra();
    }

    // Event listeners
    if (btnNuevoCompra) btnNuevoCompra.addEventListener('click', nuevaCompra);
    if (btnGuardarCompra) btnGuardarCompra.addEventListener('click', guardarCompra);
    if (btnEditarCompra) btnEditarCompra.addEventListener('click', editarCompra);
    if (btnCancelarCompra) btnCancelarCompra.addEventListener('click', cancelarCompra);
    if (btnAnularCompra) btnAnularCompra.addEventListener('click', anularCompra);
    if (btnBuscarCompra) btnBuscarCompra.addEventListener('click', buscarCompra);
    if (btnImprimirCompra) btnImprimirCompra.addEventListener('click', imprimirCompra);
    if (btnCerrarCompra) btnCerrarCompra.addEventListener('click', cerrarComprasProveedor);

    const btnBuscarProveedorCompra = document.getElementById('btnBuscarProveedorCompras');
    if (btnBuscarProveedorCompra) {
        console.log('Añadiendo event listener al botón de búsqueda de proveedor');
        btnBuscarProveedorCompra.addEventListener('click', buscarProveedorCompra);
    } else {
        console.error('Botón de búsqueda de proveedor no encontrado');
    }

    document.getElementById('totalFleteCompra').addEventListener('input', actualizarTotalesCompra);
    document.getElementById('descuentoPorcentajeCompra').addEventListener('input', actualizarTotalesCompra);

    document.getElementById('consecutivoCompra').addEventListener('change', function() {
        const consecutivoSeleccionado = this.options[this.selectedIndex];
        const [descripcion, numero] = consecutivoSeleccionado.textContent.split(' - ');
        document.getElementById('numeroCompra').value = numero;
    });

    // Event listeners para el modal de referencias
    spanCerrarReferencias.onclick = cerrarModalReferencias;
    window.onclick = function(event) {
        if (event.target == modalReferencias) {
            cerrarModalReferencias();
        }
    }

    buscarReferenciaInput.addEventListener('input', function() {
        cargarReferencias(this.value);
    });

    btnBuscarReferencia.addEventListener('click', function() {
        const filtro = buscarReferenciaInput.value;
        cargarReferencias(filtro);
    });

    // Manejo de edición en línea para la tabla de compras
    tablaCompras.addEventListener('dblclick', function(e) {
        const cell = e.target;
        if (cell.cellIndex >= 3 && cell.cellIndex <= 10) { // Solo celdas editables
            const originalContent = cell.textContent;
            cell.contentEditable = true;
            cell.focus();

            function finishEditing() {
                cell.contentEditable = false;
                if (isNaN(parseFloat(cell.textContent))) {
                    cell.textContent = originalContent;
                }
                calcularTotalesFilaCompra(cell.closest('tr'));
                actualizarTotalesCompra();
            }

            cell.addEventListener('blur', finishEditing, { once: true });
            cell.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finishEditing();
                }
            });
        }
    });

    // Inicialización
    if (inventarioLista) {
        inventarioLista.addEventListener('click', function(e) {
            const targetElement = e.target.closest('li');
            if (!targetElement) return;

            const text = targetElement.textContent.trim();
            if (text === "Compras proveedor") {
                mostrarComprasProveedor();
            }
        });
    }

    habilitarCamposCompra(false);

    console.log('Configuración de eventos completada para Compras de Proveedor');
});
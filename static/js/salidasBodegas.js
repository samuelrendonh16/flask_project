document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado para Salidas a Bodegas");
    const baseUrl = 'https://migsistemasweb.com';

    const inventarioLista = document.getElementById('inventarioLista');
    const salidasInventarioPanel = document.getElementById('salidasInventarioPanel');
    const tablaSalidas = document.querySelector('#detallesSalidaTable tbody');
    const modal = document.getElementById('busquedaReferenciasModal');
    const span = modal.querySelector(".close");
    const buscarReferenciaInput = document.getElementById('buscarReferencia');

    // Botones
    const btnNuevoSalida = document.getElementById('btnNuevoSalida');
    const btnGuardarSalida = document.getElementById('btnGuardarSalida');
    const btnEditarSalida = document.getElementById('btnEditarSalida');
    const btnCancelarSalida = document.getElementById('btnCancelarSalida');
    const btnBuscarSalida = document.getElementById('btnBuscarSalida');
    const btnCerrarSalida = document.getElementById('btnCerrarSalida');

    function mostrarSalidasInventario() {
        console.log("Función mostrarSalidasInventario llamada");
        ocultarTodosPanelesSalidas();
        if (salidasInventarioPanel) {
            salidasInventarioPanel.style.display = 'block';
            console.log("Panel de Salidas mostrado");
            cargarBodegasDisponiblesSalidas();
            cargarConsecutivosSalidasInventario();
            inicializarTablaSalidas();
        } else {
            console.error("El panel de Salidas de Inventario no se encontró");
        }
    }

    function ocultarTodosPanelesSalidas() {
        console.log("Ocultando todos los paneles");
        const paneles = document.querySelectorAll('.panel');
        paneles.forEach(panel => {
            panel.style.display = 'none';
            console.log(`Panel ocultado: ${panel.id}`);
        });
    }

    function agregarFilaVaciaSalidas() {
        console.log("Agregando fila vacía");
        const newRow = tablaSalidas.insertRow();
        for (let i = 0; i < 10; i++) {
            const cell = newRow.insertCell();
            if (i === 0) {
                cell.setAttribute('tabindex', '0');
                cell.classList.add('celda-interactiva');
                
                const btnBuscar = document.createElement('button');
                btnBuscar.textContent = '🔍';
                btnBuscar.classList.add('btn-buscar-movil');
                btnBuscar.addEventListener('click', function(e) {
                    e.stopPropagation();
                    abrirModalReferenciasSalidas();
                });
                cell.appendChild(btnBuscar);

                cell.addEventListener('click', function(e) {
                    e.stopPropagation();
                    abrirModalReferenciasSalidas();
                });
            }
        }
        const deleteCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'btn-eliminar';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            tablaSalidas.removeChild(newRow);
            actualizarTotalesSalidas();
        };
        deleteCell.appendChild(deleteBtn);
    }

    function inicializarTablaSalidas() {
        console.log("Inicializando tabla de salidas");
        tablaSalidas.innerHTML = '';
        agregarFilaVaciaSalidas();
    }

    function abrirModalReferenciasSalidas() {
        console.log("Abriendo modal de referencias");
        if (!salidasInventarioPanel || salidasInventarioPanel.style.display !== 'block') {
            console.log("No estamos en el contexto de Salidas a Bodegas, ignorando");
            return;
        }

        const idBodega = document.getElementById('bodegaSalida').value;
        if (!idBodega) {
            Swal.fire({
                title: 'Atención',
                text: 'Por favor, seleccione una bodega primero.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        if (modal) {
            modal.style.display = "block";
            if (window.innerWidth <= 768) {
                modal.classList.add('modal-fullscreen');
            }
            cargarReferenciasSalidas();
        } else {
            console.error("El modal de referencias no se encontró");
        }
    }

    function cargarBodegasDisponiblesSalidas() {
        console.log("Cargando bodegas disponibles");
        fetch(`${baseUrl}/api/bodegas_disponibles`)
            .then(response => response.json())
            .then(data => {
                console.log("Bodegas cargadas:", data);
                const selectBodega = document.getElementById('bodegaSalida');
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

    function cargarConsecutivosSalidasInventario() {
        console.log("Cargando consecutivos de salidas de inventario");
        fetch(`${baseUrl}/api/consecutivos_salidas_inventario`)
            .then(response => response.json())
            .then(data => {
                console.log("Consecutivos cargados:", data);
                const select = document.getElementById('consecutivoSalida');
                select.innerHTML = '<option value="">Seleccione un consecutivo</option>';
                data.forEach(consecutivo => {
                    const option = document.createElement('option');
                    option.value = consecutivo.IdConsecutivo;
                    option.textContent = `${consecutivo.Descripcion} - ${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
                    select.appendChild(option);
                });
    
                if (data.length > 0) {
                    select.value = data[0].IdConsecutivo;
                    actualizarNumeroSalida(data[0]);
                }
            })
            .catch(error => console.error('Error al cargar consecutivos:', error));
    }

    function actualizarNumeroSalida(consecutivo) {
        console.log("Actualizando número de salida", consecutivo);
        const numeroSalida = document.getElementById('numeroSalida');
        numeroSalida.value = `${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
    }

    document.getElementById('consecutivoSalida').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption) {
            const [descripcion, numero] = selectedOption.textContent.split(' - ');
            document.getElementById('numeroSalida').value = numero;
        }
    });

    function cargarReferenciasSalidas(filtro = '') {
        if (!salidasInventarioPanel || salidasInventarioPanel.style.display !== 'block') {
            console.log("No estamos en el contexto de Salidas a Bodegas, ignorando cargarReferenciasSalidas");
            return;
        }

        const idBodega = document.getElementById('bodegaSalida').value;
        if (!idBodega) {
            console.log("Bodega no seleccionada en Salidas a Bodegas");
            return;
        }
    
        console.log("Cargando referencias con filtro:", filtro);
        fetch(`${baseUrl}/api/referencias?filtro=${encodeURIComponent(filtro)}&idBodega=${idBodega}`)
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
                    row.addEventListener('click', () => seleccionarReferenciaSalidas(ref));
                });
            })
            .catch(error => console.error('Error al cargar referencias:', error));
    }

    function seleccionarReferenciaSalidas(referencia) {
        console.log("Referencia seleccionada:", referencia);
        
        const saldoDisponible = parseFloat(referencia.Saldo);
        if (saldoDisponible <= 0) {
            Swal.fire({
                title: 'Inventario Insuficiente',
                text: `La referencia ${referencia.IdReferencia} no tiene inventario disponible. Saldo disponible: ${saldoDisponible}, por favor verifique!`,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }
    
        agregarProductoATablaSalidas(referencia, saldoDisponible);
        if (modal) {
            modal.style.display = 'none';
            if (window.innerWidth <= 768) {
                modal.classList.remove('modal-fullscreen');
            }
        }
    }

    function agregarProductoATablaSalidas(referencia, saldoDisponible) {
        const tbody = document.querySelector('#detallesSalidaTable tbody');
        const newRow = tbody.insertRow();
        newRow.innerHTML = `
            <td>${referencia.IdReferencia}</td>
            <td>${referencia.Referencia}</td>
            <td>${referencia.IdUnidad}</td>
            <td contenteditable="true">1</td>
            <td contenteditable="true">${referencia.PrecioVenta1}</td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">0</td>
            <td>${referencia.PrecioVenta1}</td>
            <td><button class="btn-eliminar">X</button></td>
        `;

        newRow.dataset.saldoDisponible = saldoDisponible;

        newRow.querySelector('.btn-eliminar').addEventListener('click', function(e) {
            e.stopPropagation();
            tbody.removeChild(newRow);
            actualizarTotalesSalidas();
        });

        const editableCells = newRow.querySelectorAll('td[contenteditable="true"]');
        editableCells.forEach(cell => {
            cell.addEventListener('input', () => {
                actualizarSubtotalFilaSalidas(newRow);
                actualizarTotalesSalidas();
            });
        });

        actualizarSubtotalFilaSalidas(newRow);
        actualizarTotalesSalidas();
    }

    function actualizarSubtotalFilaSalidas(row) {
        const cantidad = parseFloat(row.cells[3].textContent) || 0;
        const valor = parseFloat(row.cells[4].textContent) || 0;
        const subtotal = cantidad * valor;
        row.cells[9].textContent = subtotal.toFixed(2);
        actualizarTotalesSalidas();
    }

    function actualizarTotalesSalidas() {
        let totalUnidades = 0;
        let subtotal = 0;
        let totalImpoconsumo = 0;
        let totalIPC = 0;
        let totalIBUA = 0;
        let totalICUI = 0;
    
        document.querySelectorAll('#detallesSalidaTable tbody tr').forEach(row => {
            const cantidad = parseFloat(row.cells[3].textContent) || 0;
            const valor = parseFloat(row.cells[4].textContent) || 0;
            const impoconsumo = parseFloat(row.cells[5].textContent) || 0;
            const ipc = parseFloat(row.cells[6].textContent) || 0;
            const imp_ibua = parseFloat(row.cells[7].textContent) || 0;
            const imp_icui = parseFloat(row.cells[8].textContent) || 0;
    
            totalUnidades += cantidad;
            subtotal += cantidad * valor;
            totalImpoconsumo += impoconsumo;
            totalIPC += ipc;
            totalIBUA += imp_ibua;
            totalICUI += imp_icui;
        });
    
        const totalDocumento = subtotal + totalImpoconsumo + totalIPC + totalIBUA + totalICUI;
    
        document.getElementById('totalUnidadesSalida').value = totalUnidades.toFixed(2);
        document.getElementById('subtotalSalida').value = subtotal.toFixed(2);
        document.getElementById('totalImpoconsumoSalida').value = totalImpoconsumo.toFixed(2);
        document.getElementById('totalIPCSalida').value = totalIPC.toFixed(2);
        document.getElementById('totalIBUASalida').value = totalIBUA.toFixed(2);
        document.getElementById('totalICUISalida').value = totalICUI.toFixed(2);
        document.getElementById('totalDocumentoSalida').value = totalDocumento.toFixed(2);
    }

    function nuevoSalida() {
        console.log("Iniciando nueva salida");
        limpiarFormularioSalida();
        document.getElementById('fechaSalida').valueAsDate = new Date();
        document.getElementById('fechaCreacionSalida').valueAsDate = new Date();
        document.querySelector('#detallesSalidaTable').style.display = 'table';
        inicializarTablaSalidas();
        habilitarCamposSalida(true);
        cargarUltimoConsecutivoSalida();
    }
    
    async function verificarReferenciasSalidas() {
        const referencias = Array.from(document.querySelectorAll('#detallesSalidaTable tbody tr'))
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
            const response = await fetch(`${baseUrl}/api/verificar_referencias`, {
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
    
    async function guardarSalida() {
        console.log("Guardando salida");
    
        if (!(await verificarReferenciasSalidas())) {
            return;
        }
    
        const fechaActual = new Date();
        const salida1 = {
            Numero: document.getElementById('numeroSalida').value,
            Mes: obtenerMes(document.getElementById('fechaSalida').value),
            Anulado: document.getElementById('anuladoSalida').checked ? 1 : 0,
            IdBodega: document.getElementById('bodegaSalida').value,
            CuentaDebito: '',
            CuentaCredito: '',
            Observaciones: document.getElementById('observacionesSalida').value,
            FechaCreacion: formatearFecha(fechaActual),
            IdUsuario: 'MIG',
            Recibe: '',
            idproyecto: '',
            fechamodificacion: formatearFecha(fechaActual),
            IdConsecutivo: document.getElementById('consecutivoSalida').value,
            op: formatearFecha(fechaActual),
            fecha: formatearFecha(document.getElementById('fechaSalida').value),
            subtotal: parseFloat(document.getElementById('subtotalSalida').value) || 0,
            total_iva: parseFloat(document.getElementById('totalIVASalida').value) || 0,
            total_impoconsumo: parseFloat(document.getElementById('totalImpoconsumoSalida').value) || 0,
            total_ipc: parseFloat(document.getElementById('totalIPCSalida').value) || 0,
            total_ibua: parseFloat(document.getElementById('totalIBUASalida').value) || 0,
            total_icui: parseFloat(document.getElementById('totalICUISalida').value) || 0,
            total: parseFloat(document.getElementById('totalDocumentoSalida').value) || 0
        };
    
        const salidas2 = [];
        document.querySelectorAll('#detallesSalidaTable tbody tr').forEach((row, index) => {
            const idReferencia = row.cells[0].textContent.trim().replace(/[^\w\s-]/gi, '').trim();
            if (idReferencia) {  // Solo agregar si hay un IdReferencia válido
                salidas2.push({
                    ID: `${salida1.Numero}_${(index + 1).toString().padStart(3, '0')}`,
                    Numero: salida1.Numero,
                    IdReferencia: idReferencia,
                    Descripcion: row.cells[1].textContent.trim(),
                    Cantidad: parseFloat(row.cells[3].textContent) || 0,
                    Valor: parseFloat(row.cells[4].textContent) || 0,
                    IVA: 0,
                    Descuento: 0,
                    lote: '',
                    idunidad: row.cells[2].textContent.trim(),
                    impoconsumo: parseFloat(row.cells[5].textContent) || 0,
                    ipc: parseFloat(row.cells[6].textContent) || 0,
                    imp_ibua: parseFloat(row.cells[7].textContent) || 0,
                    imp_icui: parseFloat(row.cells[8].textContent) || 0
                });
            }
        });
    
        console.log('Datos a enviar:', JSON.stringify({ salida1, salidas2 }, null, 2));
    
        try {
            const response = await fetch(`${baseUrl}/api/guardar_salida`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ salida1, salidas2 })
            });
            const data = await response.json();
    
            if (data.success) {
                await Swal.fire({
                    title: 'Éxito',
                    text: 'Salida guardada con éxito. El documento se descargará automáticamente.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
    
                // Descargar el documento
                const byteCharacters = atob(data.doc_content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = data.documento;
                link.click();
    
                await actualizarConsecutivoSalida();
                limpiarFormularioSalida();
                habilitarCamposSalida(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: `Error al guardar la salida: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    function editarSalida() {
        console.log("Editando salida");
        habilitarCamposSalida(true);
    }

    function cancelarSalida() {
        console.log("Cancelando salida");
        limpiarFormularioSalida();
        habilitarCamposSalida(false);
    }

    function buscarSalida() {
        console.log("Buscando salida");
        // Implementar lógica para buscar salidas
    }

    function cerrarSalida() {
        console.log("Cerrando panel de salidas");
        salidasInventarioPanel.style.display = 'none';
    }

    function limpiarFormularioSalida() {
        console.log("Limpiando formulario de salida");
        document.getElementById('salidaInventarioForm').reset();
        inicializarTablaSalidas();
        
        ['totalUnidadesSalida', 'subtotalSalida', 'totalIVASalida', 'totalImpoconsumoSalida', 'totalICUISalida', 'totalIBUASalida', 'totalIPCSalida', 'totalDocumentoSalida'].forEach(id => {
            document.getElementById(id).value = '0.00';
        });
    }

    function habilitarCamposSalida(habilitar) {
        const campos = document.querySelectorAll('#salidaInventarioForm input, #salidaInventarioForm select, #salidaInventarioForm textarea');
        campos.forEach(campo => campo.disabled = !habilitar);
        
        btnNuevoSalida.disabled = habilitar;
        btnGuardarSalida.disabled = !habilitar;
        btnEditarSalida.disabled = true;
        btnCancelarSalida.disabled = !habilitar;
    }

    function cargarUltimoConsecutivoSalida() {
        fetch(`${baseUrl}/api/ultimo_consecutivo_salidas`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('numeroSalida').value = data.ultimoConsecutivo;
                const selectConsecutivo = document.getElementById('consecutivoSalida');
                for (let i = 0; i < selectConsecutivo.options.length; i++) {
                    if (selectConsecutivo.options[i].textContent.includes(data.ultimoConsecutivo)) {
                        selectConsecutivo.selectedIndex = i;
                        break;
                    }
                }
            } else {
                console.error('Error al cargar el último consecutivo:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    async function actualizarConsecutivoSalida() {
        try {
            const response = await fetch(`${baseUrl}/api/actualizar_consecutivo_salidas_inventario`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                document.getElementById('numeroSalida').value = data.nuevoConsecutivo;
                const selectConsecutivo = document.getElementById('consecutivoSalida');
                const selectedOption = selectConsecutivo.options[selectConsecutivo.selectedIndex];
                if (selectedOption) {
                    const [descripcion, _] = selectedOption.textContent.split(' - ');
                    selectedOption.textContent = `${descripcion} - ${data.nuevoConsecutivo}`;
                }
                console.log('Consecutivo actualizado:', data.nuevoConsecutivo);
            } else {
                throw new Error(data.message || 'Error al actualizar consecutivo');
            }
        } catch (error) {
            console.error('Error al actualizar consecutivo:', error);
            Swal.fire({
                title: 'Error',
                text: `Error al actualizar consecutivo: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    function obtenerMes(fecha) {
        const date = new Date(fecha);
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    function formatearFecha(fecha) {
        if (fecha instanceof Date) {
            return fecha.toISOString();
        } else if (typeof fecha === 'string') {
            return new Date(fecha).toISOString();
        }
        return null;
    }

    // Event Listeners
    btnNuevoSalida.addEventListener('click', nuevoSalida);
    btnGuardarSalida.addEventListener('click', guardarSalida);
    btnEditarSalida.addEventListener('click', editarSalida);
    btnCancelarSalida.addEventListener('click', cancelarSalida);
    btnBuscarSalida.addEventListener('click', buscarSalida);
    btnCerrarSalida.addEventListener('click', cerrarSalida);

    if (inventarioLista) {
        inventarioLista.addEventListener('click', function(e) {
            console.log("Clic en inventarioLista");
            const targetElement = e.target.closest('li');
            if (!targetElement) {
                console.log("No se encontró un elemento li");
                return;
            }

            const text = targetElement.textContent.trim();
            console.log("Texto del elemento clickeado:", text);
            
            if (text === "Salidas a Bodegas") {
                console.log("Clic en Salidas a Bodegas detectado");
                mostrarSalidasInventario();
            }
        });
    } else {
        console.error("El elemento inventarioLista no se encontró");
    }

    const btnSalidasBodegas = document.getElementById('btnSalidasBodegas');
    if (btnSalidasBodegas) {
        console.log("Botón de Salidas a Bodegas encontrado");
        btnSalidasBodegas.addEventListener('click', function() {
            console.log("Clic en botón de Salidas a Bodegas");
            mostrarSalidasInventario();
        });
    } else {
        console.error("El botón de Salidas a Bodegas no se encontró");
    }

    // Manejo del modal de referencias
    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    buscarReferenciaInput.addEventListener('input', function(e) {
        e.stopPropagation();
        if (salidasInventarioPanel && salidasInventarioPanel.style.display === 'block') {
            cargarReferenciasSalidas(this.value);
        }
    });

    document.getElementById('btnBuscarReferencia').addEventListener('click', function(e) {
        e.stopPropagation();
        if (salidasInventarioPanel && salidasInventarioPanel.style.display === 'block') {
            const filtro = document.getElementById('buscarReferencia').value;
            cargarReferenciasSalidas(filtro);
        }
    });

    // Manejo de edición en línea para la tabla de salidas
    tablaSalidas.addEventListener('dblclick', function(e) {
        const cell = e.target;
        if (cell.cellIndex >= 3 && cell.cellIndex <= 9) { // Solo celdas editables
            const originalContent = cell.textContent;
            cell.contentEditable = true;
            cell.focus();

            function finishEditing() {
                cell.contentEditable = false;
                if (isNaN(parseFloat(cell.textContent))) {
                    cell.textContent = originalContent;
                }
                actualizarTotalesSalidas();
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
    habilitarCamposSalida(false);

    console.log("Configuración de Salidas a Bodegas completada");
});
document.addEventListener('DOMContentLoaded', function() {
    const inventarioLista = document.getElementById('inventarioLista');
    const entradasInventarioPanel = document.getElementById('entradasInventarioPanel');

    // Botones
    const btnNuevoEntrada = document.getElementById('btnNuevoEntrada');
    const btnGuardarEntrada = document.getElementById('btnGuardarEntrada');
    const btnEditarEntrada = document.getElementById('btnEditarEntrada');
    const btnCancelarEntrada = document.getElementById('btnCancelarEntrada');
    const btnBuscarEntrada = document.getElementById('btnBuscarEntrada');
    const btnCerrarEntrada = document.getElementById('btnCerrarEntrada');
    const tablaEntradas = document.querySelector('#detallesEntradaTable tbody');
    const modal = document.getElementById('busquedaReferenciasModal');
    const span = modal.querySelector(".close");
    const buscarReferenciaInput = document.getElementById('buscarReferencia');
    const baseUrl = 'https://migsistemasweb.com';

    if (inventarioLista) {
        inventarioLista.addEventListener('click', function(e) {
            const targetElement = e.target.closest('li');
            if (!targetElement) return;

            const text = targetElement.textContent.trim();
            if (text === "Entradas a Bodegas") {
                mostrarEntradasInventario();
            }
        });
    }

    function cargarBodegasDisponibles() {
        fetch(`${baseUrl}/api/bodegas_disponibles`)
            .then(response => response.json())
            .then(data => {
                const selectBodega = document.getElementById('bodegaEntrada');
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

    function cargarConsecutivosEntradasInventario() {
        fetch(`${baseUrl}/api/consecutivos_entradas_inventario`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('consecutivoEntrada');
                select.innerHTML = '<option value="">Seleccione un consecutivo</option>';
                data.forEach(consecutivo => {
                    const option = document.createElement('option');
                    option.value = consecutivo.IdConsecutivo;
                    option.textContent = `${consecutivo.Descripcion} - ${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
                    select.appendChild(option);
                });
    
                if (data.length > 0) {
                    select.value = data[0].IdConsecutivo;
                    actualizarNumeroEntrada(data[0]);
                }
            })
            .catch(error => console.error('Error al cargar consecutivos:', error));
    }

    function cargarUltimoConsecutivo() {
        fetch(`${baseUrl}/api/ultimo_consecutivo_entradas`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('numeroEntrada').value = data.ultimoConsecutivo;
            } else {
                console.error('Error al cargar el último consecutivo:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function actualizarConsecutivo() {
        fetch(`${baseUrl}/api/actualizar_consecutivo_entradas`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('numeroEntrada').value = data.nuevoConsecutivo;
                cargarConsecutivosEntradasInventario();
            } else {
                console.error('Error al actualizar consecutivo:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function actualizarNumeroEntrada(consecutivo) {
        const numeroEntrada = document.getElementById('numeroEntrada');
        numeroEntrada.value = `${consecutivo.Prefijo}${consecutivo.Actual.padStart(2, '0')}`;
    }
    
    function mostrarEntradasInventario() {
        console.log("Mostrando Entradas a Bodegas");
        ocultarTodosPaneles();
        entradasInventarioPanel.style.display = 'block';
        cargarBodegasDisponibles();
        cargarConsecutivosEntradasInventario();
        inicializarTablaEntradas();
    }

    tablaEntradas.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.cellIndex === 0) {
            e.preventDefault();
            abrirModalReferencias();
        }
    });

    document.getElementById('consecutivoEntrada').addEventListener('change', function() {
        const consecutivoSeleccionado = this.options[this.selectedIndex];
        const [descripcion, numero] = consecutivoSeleccionado.textContent.split(' - ');
        document.getElementById('numeroEntrada').value = numero;
    });

    function ocultarTodosPaneles() {
        const paneles = document.querySelectorAll('.panel');
        paneles.forEach(panel => panel.style.display = 'none');
    }

    function nuevoEntrada() {
        console.log("Nuevo entrada");
        limpiarFormularioEntrada();
        habilitarCamposEntrada(true);
        cargarUltimoConsecutivo();
        document.getElementById('fechaEntrada').valueAsDate = new Date();
        document.getElementById('fechaCreacionEntrada').valueAsDate = new Date();
        document.querySelector('#detallesEntradaTable').style.display = 'table';
        agregarFilaVacia();
    }

    function guardarEntrada() {
        const fechaActual = new Date();
        const entrada1 = {
            Numero: document.getElementById('numeroEntrada').value,
            Mes: obtenerMes(document.getElementById('fechaEntrada').value),
            Anulado: document.getElementById('anuladoEntrada').checked,
            IdBodega: document.getElementById('bodegaEntrada').value,
            Observaciones: document.getElementById('observacionesEntrada').value,
            FechaCreacion: fechaActual.toISOString(),
            IdUsuario: 'MIG',
            IdConsecutivo: document.getElementById('consecutivoEntrada').value,
            fecha: document.getElementById('fechaEntrada').value,
            subtotal: document.getElementById('subtotal').value,
            total_iva: document.getElementById('totalIVA').value,
            total_impoconsumo: document.getElementById('totalImpoconsumo').value,
            total_ipc: document.getElementById('totalIPC').value,
            total_ibua: document.getElementById('totalIBUA').value,
            total_icui: document.getElementById('totalICUI').value,
            total: document.getElementById('totalDocumento').value
        };
    
        const entradas2 = [];
        document.querySelectorAll('#detallesEntradaTable tbody tr').forEach((row, index) => {
            const idReferencia = row.cells[0].textContent.trim();
            if (idReferencia) {
                const valor = parseFloat(row.cells[4].textContent.replace(',', '.'));
                entradas2.push({
                    ID: `${entrada1.Numero}_${(index + 1).toString().padStart(3, '0')}`,
                    Numero: entrada1.Numero,
                    IdReferencia: idReferencia,
                    Descripcion: row.cells[1].textContent.trim(),
                    Cantidad: parseFloat(row.cells[3].textContent) || 0,
                    Valor: isNaN(valor) ? 0 : valor,
                    IVA: parseFloat(row.cells[5].textContent) || 0,
                    impoconsumo: parseFloat(row.cells[6].textContent) || 0,
                    ipc: parseFloat(row.cells[7].textContent) || 0,
                    imp_ibua: parseFloat(row.cells[8].textContent) || 0,
                    imp_icui: parseFloat(row.cells[9].textContent) || 0,
                    idunidad: row.cells[2].textContent.trim(),
                });
            }
        });
    
        console.log('Datos a enviar:', JSON.stringify({ entrada1, entradas2 }, null, 2));
    
        fetch(`${baseUrl}/api/guardar_entrada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entrada1, entradas2 })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Entrada guardada con éxito. El documento se descargará automáticamente.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
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
                });
                actualizarConsecutivo();
                limpiarFormularioEntrada();
                habilitarCamposEntrada(false);
                btnNuevoEntrada.disabled = false;
            } else {
                console.error('Error del servidor:', data.error);
                console.error('Traza del error:', data.trace);
                Swal.fire({
                    title: 'Error',
                    text: `Error al guardar la entrada: ${data.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error en la comunicación con el servidor',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    }
    
    function obtenerMes(fecha) {
        const date = new Date(fecha);
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    function editarEntrada() {
        console.log("Editando entrada");
        // Aquí iría la lógica para editar la entrada
    }

    function cancelarEntrada() {
        console.log("Cancelando entrada");
        limpiarFormularioEntrada();
        habilitarCamposEntrada(false);
    }

    function buscarEntrada() {
        console.log("Buscando entrada");
        // Aquí iría la lógica para buscar entradas
    }

    function cerrarEntrada() {
        console.log("Cerrando panel de entradas");
        entradasInventarioPanel.style.display = 'none';
    }

    function limpiarFormularioEntrada() {
        document.getElementById('entradaInventarioForm').reset();
        const tbody = document.querySelector('#detallesEntradaTable tbody');
        tbody.innerHTML = '';
        document.getElementById('totalUnidades').value = '0.00';
        document.getElementById('subtotal').value = '0.00';
        document.getElementById('totalIVA').value = '0.00';
        document.getElementById('totalImpoconsumo').value = '0.00';
        document.getElementById('totalICUI').value = '0.00';
        document.getElementById('totalIBUA').value = '0.00';
        document.getElementById('totalIPC').value = '0.00';
        document.getElementById('totalDocumento').value = '0.00';
    }

    function habilitarCamposEntrada(habilitar) {
        const campos = document.querySelectorAll('#entradaInventarioForm input, #entradaInventarioForm select, #entradaInventarioForm textarea');
        campos.forEach(campo => campo.disabled = !habilitar);
        
        btnNuevoEntrada.disabled = habilitar;
        btnGuardarEntrada.disabled = !habilitar;
        btnEditarEntrada.disabled = true;
        btnCancelarEntrada.disabled = !habilitar;
    }

    function agregarFilaVacia() {
        const newRow = tablaEntradas.insertRow();
        for (let i = 0; i < 11; i++) {
            const cell = newRow.insertCell();
            if (i === 0) {
                cell.setAttribute('tabindex', '0');
                cell.classList.add('celda-interactiva');
            }
        }
    }
    function inicializarTablaEntradas() {
        tablaEntradas.innerHTML = '';
        agregarFilaVacia();
    }

    function abrirModalReferencias() {
        modal.style.display = "block";
        cargarReferenciasEntradas();
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function cargarReferenciasEntradas(filtro = '') {
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
                        <td>${ref.Saldo}</td>
                    `;
                    row.addEventListener('click', () => seleccionarReferencia(ref));
                });
            })
            .catch(error => console.error('Error al cargar referencias:', error));
    }

    document.querySelector('#referenciasTable tbody').addEventListener('click', function(e) {
        const row = e.target.closest('tr');
        if (row) {
            const cells = row.cells;
            const productoSeleccionado = {
                IdReferencia: cells[0].textContent,
                Descripcion: cells[1].textContent,
                IdUnidad: cells[6].textContent,
                PrecioVenta1: cells[2].textContent,
                IVA: cells[3].textContent
            };
            agregarProductoAEntrada(productoSeleccionado);
            cerrarModalReferencias();
        }
    });

    function cerrarModalReferencias() {
        modal.style.display = 'none';
    }

    function agregarProductoAEntrada(producto) {
        const tbody = document.querySelector('#detallesEntradaTable tbody');
        
        // Verificar si el producto ya existe en la tabla
        const filaExistente = Array.from(tbody.rows).find(row => row.cells[0].textContent === producto.IdReferencia);
        
        if (filaExistente) {
            // Si el producto ya existe, incrementar la cantidad
            const cantidadCell = filaExistente.cells[3];
            const cantidadActual = parseFloat(cantidadCell.textContent) || 0;
            cantidadCell.textContent = (cantidadActual + 1).toString();
            actualizarSubtotalFila(filaExistente);
        } else {
            // Si el producto no existe, agregar una nueva fila
            const newRow = tbody.insertRow();
            newRow.innerHTML = `
                <td>${producto.IdReferencia}</td>
                <td>${producto.Descripcion}</td>
                <td>${producto.IdUnidad}</td>
                <td contenteditable="true">1</td>
                <td contenteditable="true">${producto.PrecioVenta1}</td>
                <td>${producto.IVA}</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>${producto.PrecioVenta1}</td>
                <td><button class="btn-eliminar">X</button></td>
            `;
    
            newRow.querySelector('.btn-eliminar').addEventListener('click', function() {
                tbody.removeChild(newRow);
                actualizarTotalesEntradas();
            });
            
            const cantidadCell = newRow.cells[3];
            const valorCell = newRow.cells[4];
            
            [cantidadCell, valorCell].forEach(cell => {
                cell.addEventListener('input', function() {
                    actualizarSubtotalFila(newRow);
                    actualizarTotalesEntradas();
                });
            });
        }
    
        actualizarTotalesEntradas();
    }

    function actualizarSubtotalFila(row) {
        const cantidad = parseFloat(row.cells[3].textContent) || 0;
        const valor = parseFloat(row.cells[4].textContent) || 0;
        const subtotal = cantidad * valor;
        row.cells[10].textContent = subtotal.toFixed(2);
    }

    function actualizarTotalesEntradas() {
        const filas = document.querySelectorAll('#detallesEntradaTable tbody tr');
        let totalUnidades = 0;
        let subtotal = 0;
        let totalIVA = 0;
        let totalImpoconsumo = 0;
        let totalICUI = 0;
        let totalIBUA = 0;
        let totalIPC = 0;
    
        filas.forEach(fila => {
            const cantidad = parseFloat(fila.cells[3].textContent) || 0;
            const valor = parseFloat(fila.cells[4].textContent) || 0;
            const iva = parseFloat(fila.cells[5].textContent) || 0;
            const impoconsumo = parseFloat(fila.cells[6].textContent) || 0;
            const ipc = parseFloat(fila.cells[7].textContent) || 0;
            const ibua = parseFloat(fila.cells[8].textContent) || 0;
            const icui = parseFloat(fila.cells[9].textContent) || 0;
    
            totalUnidades += cantidad;
            subtotal += cantidad * valor;
            totalIVA += (cantidad * valor * iva) / 100;
            totalImpoconsumo += impoconsumo;
            totalICUI += icui;
            totalIBUA += ibua;
            totalIPC += ipc;
        });
    
        document.getElementById('totalUnidades').value = totalUnidades.toFixed(2);
        document.getElementById('subtotal').value = subtotal.toFixed(2);
        document.getElementById('totalIVA').value = totalIVA.toFixed(2);
        document.getElementById('totalImpoconsumo').value = totalImpoconsumo.toFixed(2);
        document.getElementById('totalICUI').value = totalICUI.toFixed(2);
        document.getElementById('totalIBUA').value = totalIBUA.toFixed(2);
        document.getElementById('totalIPC').value = totalIPC.toFixed(2);
        document.getElementById('totalDocumento').value = (subtotal + totalIVA + totalImpoconsumo + totalICUI + totalIBUA + totalIPC).toFixed(2);
    }

    document.querySelector('#detallesEntradaTable').addEventListener('click', function(e) {
        if (e.target.cellIndex === 0) {
            abrirModalReferencias();
        }
    });

    document.querySelector('#detallesEntradaTable').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.cellIndex === 0) {
            e.preventDefault();
            abrirModalReferencias();
        }
    });

    document.querySelector('#busquedaReferenciasModal .close').addEventListener('click', function() {
        cerrarModalReferencias();
    });

    buscarReferenciaInput.addEventListener('input', function() {
        cargarReferenciasEntradas(this.value);
    });

    document.getElementById('btnBuscarReferencia').addEventListener('click', function() {
        const filtro = document.getElementById('buscarReferencia').value;
        cargarReferenciasEntradas(filtro);
    });

    // Event listeners para los botones
    btnNuevoEntrada.addEventListener('click', nuevoEntrada);
    btnGuardarEntrada.addEventListener('click', guardarEntrada);
    btnEditarEntrada.addEventListener('click', editarEntrada);
    btnCancelarEntrada.addEventListener('click', cancelarEntrada);
    btnBuscarEntrada.addEventListener('click', buscarEntrada);
    btnCerrarEntrada.addEventListener('click', cerrarEntrada);

    // Inicialización
    habilitarCamposEntrada(false);

    // Función para seleccionar una referencia (que faltaba en el código original)
    function seleccionarReferencia(ref) {
        agregarProductoAEntrada({
            IdReferencia: ref.IdReferencia,
            Descripcion: ref.Referencia,
            IdUnidad: ref.IdUnidad,
            PrecioVenta1: ref.PrecioVenta1,
            IVA: ref.IVA
        });
        cerrarModalReferencias();
    }
});
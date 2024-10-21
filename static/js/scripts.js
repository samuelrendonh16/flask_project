document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado y analizado');
    // Elementos del DOM
    const API_BASE_URL = 'https://migsistemasweb.com';
    const btnInventario = document.getElementById('btnInventario');
    const btnMaestros = document.getElementById('btnMaestros');
    const btnLicencia = document.getElementById('btnLicencia');
    const inventarioPanel = document.getElementById('inventarioPanel');
    const gruposPanel = document.getElementById('gruposPanel');
    const btnGruposFamiliasCategorias = document.querySelector('#maestrosLista .sub-menu li:first-child');
    const maestrosPanel = document.getElementById('maestrosPanel');
    const licenciaPanel = document.getElementById('licenciaPanel');
    const inventarioLista = document.getElementById('inventarioLista');
    const maestrosLista = document.getElementById('maestrosLista');
    const btnClose = document.querySelectorAll('.btn-close');
    const btnBodegas = document.getElementById('btnBodegas');
    const bodegasPanel = document.getElementById('bodegasPanel');
    const btnConfiguracion = document.getElementById('btnConfiguracion');
    const passwordModal = document.getElementById('passwordModal');
    const configPanel = document.getElementById('configPanel');
    const submitPassword = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('passwordInput');
    const cancelPassword = document.getElementById('cancelPassword');
    const licenciaForm = document.getElementById('licenciaForm');
    const licenciaInfo = document.getElementById('licenciaInfo');
    const ciudadSelect = document.getElementById('ciudad');
    const tipoLicenciaSelect = document.getElementById('tipoLicencia');
    const fechaVencimientoContainer = document.getElementById('fechaVencimientoContainer');
    const fechaVencimientoInput = document.getElementById('fechaVencimiento');
    const detallesEntradaTable = document.getElementById('detallesEntradaTable');
    const tbody = detallesEntradaTable.querySelector('tbody');
    const maestroReferenciasPanel = document.getElementById('maestroReferencias');
    const salidasInventarioPanel = document.getElementById('salidasInventarioPanel');
    const entradasInventarioPanel = document.getElementById('entradasInventarioPanel');
    const btnSalidasBodegas = document.getElementById('btnSalidasBodegas');
    const btnEntradasBodegas = document.getElementById('btnEntradasBodegas');
    const btnNuevoBodega = document.getElementById('btnNuevoBodega');
    const btnGuardarBodega = document.getElementById('btnGuardarBodega');
    const btnEditarBodega = document.getElementById('btnEditarBodega');
    const btnCancelarBodega = document.getElementById('btnCancelarBodega');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    const btnGuardarProducto = document.getElementById('btnGuardarProducto');
    const btnEditarProducto = document.getElementById('btnEditarProducto');
    const btnCancelarProducto = document.getElementById('btnCancelarProducto');
    const btnCerrarProducto = document.getElementById('btnCerrarProducto');
    const formInputs = document.querySelectorAll('#maestroReferencias input, #maestroReferencias select');

    const elements = {
        btnNuevoGrupo: document.getElementById('btnNuevoGrupo'),
        btnGuardarGrupo: document.getElementById('btnGuardarGrupo'),
        btnEditarGrupo: document.getElementById('btnEditarGrupo'),
        btnEliminarGrupo: document.getElementById('btnEliminarGrupo'),
        btnCancelarGrupo: document.getElementById('btnCancelarGrupo'),
        btnCerrarGrupo: document.getElementById('btnCerrarGrupo'),
        formGrupo: document.querySelector('#gruposPanel .form-container'),
        codigoGrupo: document.getElementById('codigoGrupo'),
        descripcionGrupo: document.getElementById('descripcionGrupo'),
        estadoGrupo: document.getElementById('estadoGrupo'),
        ventaGrupo: document.getElementById('ventaGrupo'),
        gruposTable: document.getElementById('gruposTable')
    };

    let grupoSeleccionado = null;

    console.log('btnSalidasBodegas:', btnSalidasBodegas);
    console.log('salidasInventarioPanel:', salidasInventarioPanel);

    if (!btnSalidasBodegas) {
        console.error('El botón de Salidas a Bodegas no se encontró');
    }
    
    if (!salidasInventarioPanel) {
        console.error('El panel de Salidas a Bodegas no se encontró');
    }

    // Verificación de elementos críticos
    if (!inventarioPanel) console.error("inventarioPanel no encontrado");
    if (!entradasInventarioPanel) console.error("entradasInventarioPanel no encontrado");
    if (!consultaInventarioPanel) console.error("consultaInventarioPanel no encontrado");
    if (!inventarioLista) console.error("inventarioLista no encontrado");
    if (!btnGruposFamiliasCategorias) {
        console.error('No se encontró el botón de Grupos - Familias - Categorías');
    }
    if (!gruposPanel) {
        console.error('No se encontró el panel de Grupos');
    }

    // Evento para manejar el Enter en la tabla
    tbody.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'TD' && e.target.cellIndex === 0) {
            e.preventDefault();
            console.log('Enter presionado en la primera columna');
            abrirModalBusquedaReferencias();
        }
    });

    

    const ciudadesColombia = [
        "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
        "Santa Marta", "Ibagué", "Pasto", "Manizales", "Neiva", "Villavicencio", "Armenia", "Valledupar",
        "Montería", "Sincelejo", "Popayán", "Tunja", "Riohacha", "Quibdó", "Florencia", "Mocoa", "Yopal",
        "San José del Guaviave", "Inírida", "Mitú", "Puerto Carreño", "Arauca", "Leticia", "San Andrés"
    ];

    ciudadesColombia.forEach(ciudad => {
        const option = document.createElement('option');
        option.value = ciudad;
        option.textContent = ciudad;
        ciudadSelect.appendChild(option);
    });

    tipoLicenciaSelect.addEventListener('change', function() {
        if (this.value === 'RENTA') {
            fechaVencimientoContainer.style.display = 'block';
            fechaVencimientoInput.required = true;
        } else {
            fechaVencimientoContainer.style.display = 'none';
            fechaVencimientoInput.required = false;
            fechaVencimientoInput.value = '';
        }
    });

    // Evento para manejar clics en el menú de Maestros
    maestrosLista.addEventListener('click', function(e) {
        handleMenuExpansion(e);
        
        // Manejar clic en "Productos - Artículos - Referencias"
        if (e.target.closest('#btnProductosArticulosReferencias')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en Productos - Artículos - Referencias');
            
            // Ocultar todos los paneles excepto maestrosPanel
            document.querySelectorAll('.panel').forEach(panel => {
                if (panel !== maestrosPanel) {
                    panel.style.display = 'none';
                }
            });

            // Mostrar el panel de Maestro de Referencias
            if (maestroReferenciasPanel) {
                maestroReferenciasPanel.style.display = 'block';
            } else {
                console.error('El panel de Maestro de Referencias no se encontró');
            }
        }

                // Manejar clic en "Grupos - Familias - Categorías"
        if (e.target.closest('#btnGruposFamiliasCategorias')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en Grupos - Familias - Categorías');
            
            ocultarTodosPaneles();
            if (gruposPanel) {
                gruposPanel.style.display = 'block';
            } else {
                console.error('El panel de Grupos no se encontró');
            }
        }
    });

    function obtenerCaracteristicasEquipo() {
        const navegador = navigator.userAgent;
        const plataforma = navigator.platform;
        const memoria = navigator.deviceMemory || 'Desconocida';
        const nucleos = navigator.hardwareConcurrency || 'Desconocido';
        const resolucion = `${screen.width}x${screen.height}`;
        const colorDepth = screen.colorDepth;
        
        const caracteristicas = `${navegador}|${plataforma}|${memoria}|${nucleos}|${resolucion}|${colorDepth}`;
        return btoa(caracteristicas);
    }

    function ocultarTodosPaneles() {
        console.log("Ocultando todos los paneles");
        const paneles = document.querySelectorAll('.panel');
        paneles.forEach(panel => {
            panel.style.display = 'none';
            console.log(`Panel ocultado: ${panel.id}`);
        });
    }

    btnInventario.addEventListener('click', function() {
        ocultarTodosPaneles();
        inventarioPanel.style.display = 'block';
        cargarInventario();
    });

    btnMaestros.addEventListener('click', function() {
        ocultarTodosPaneles();
        maestrosPanel.style.display = 'block';
    });

    document.addEventListener('DOMContentLoaded', function() {
        const bodegaHeader = document.querySelector('th:nth-child(8)'); // Asumiendo que Bodega es la 8va columna
        bodegaHeader.addEventListener('click', abrirFiltroBodegas);
    });

    function abrirFiltroBodegas() {
        // Obtener las bodegas únicas
        const bodegas = [...new Set(Array.from(document.querySelectorAll('td:nth-child(8)')).map(td => td.textContent))];
        
        // Crear y mostrar un modal con checkboxes para cada bodega
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Filtrar por Bodega</h3>
                ${bodegas.map(bodega => `
                    <label>
                        <input type="checkbox" value="${bodega}"> ${bodega}
                    </label>
                `).join('')}
                <button onclick="aplicarFiltroBodegas()">Aplicar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    btnEntradasBodegas.addEventListener('click', function() {
        console.log("Clic en Entradas a Bodegas");
        mostrarEntradasInventario();
    });

    document.getElementById('btnConsultaInventario').addEventListener('click', function() {
        console.log("Clic en Consulta Inventario");
        cargarConsultaInventario();
        document.getElementById('filtroInventario').value = ''; // Limpiar el filtro
    });

    function aplicarFiltros() {
    const filtroTexto = document.getElementById('filtroInventario').value.toLowerCase();
    const filtroTipo = document.querySelector('input[name="filter"]:checked').value;

    const datosFiltrados = inventarioData.filter(item => {
        const cumpleFiltroTexto = item.IDReferencia.toLowerCase().includes(filtroTexto) ||
                                item.Referencia.toLowerCase().includes(filtroTexto);
        
        let cumpleFiltroTipo = true;
        if (filtroTipo === 'conSaldo') {
            cumpleFiltroTipo = item.Saldo > 0;
        } else if (filtroTipo === 'servicio') {
            cumpleFiltroTipo = item.EsServicio; // Asegúrate de que este campo exista en tus datos
        }

        return cumpleFiltroTexto && cumpleFiltroTipo;
    });

    mostrarDatosInventario(datosFiltrados);
}

    // Agregar event listeners para los radio buttons
    document.querySelectorAll('input[name="filter"]').forEach(radio => {
        radio.addEventListener('change', aplicarFiltros);
    });

    // Modificar la función filtrarInventario para usar aplicarFiltros
    function filtrarInventario() {
        aplicarFiltros();
    }

    // Evento para cerrar el panel de Maestro de Referencias
    const btnCerrarMaestroReferencias = document.querySelector('#maestroReferencias #btnCerrar');
    if (btnCerrarMaestroReferencias) {
        btnCerrarMaestroReferencias.addEventListener('click', function() {
            maestroReferenciasPanel.style.display = 'none';
            maestrosPanel.style.display = 'block';
        });
    }

    btnLicencia.addEventListener('click', function() {
        ocultarTodosPaneles();
        licenciaPanel.style.display = 'block';
        cargarInformacionLicencia();
    });

    btnConfiguracion.addEventListener('click', function() {
        passwordModal.style.display = 'block';
    });

    submitPassword.addEventListener('click', function() {
        const password = passwordInput.value.toLowerCase();
        if (password === 'smig123*/') {
            passwordModal.style.display = 'none';
            ocultarTodosPaneles();
            configPanel.style.display = 'block';
            passwordInput.value = '';
        } else {
            Swal.fire('Contraseña incorrecta');
        }
    });

    btnClose.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.panel').style.display = 'none';
        });
    });

    // function cargarInventario() {
    //     fetch(`${API_BASE_URL}/api/inventario`)
    //         .then(response => response.json())
    //         .then(data => {
    //             const inventarioLista = document.getElementById('inventarioLista');
    //             inventarioLista.innerHTML = '';
    //             data.forEach(item => {
    //                 const li = document.createElement('li');
    //                 li.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
    //                 inventarioLista.appendChild(li);
    //             });
    //         })
    //         .catch(error => {
    //             console.error('Error al cargar el inventario:', error);
    //         });
    // }

    function mostrarDatosInventario(data) {
        const tableBody = document.querySelector('#inventarioTable tbody');
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = `
                <tr>
                    <td>${item.IDReferencia}</td>
                    <td>${item.Referencia}</td>
                    <td>${item.Marca}</td>
                    <td>${item.Precio_Venta}</td>
                    <td>${item.Ubicación}</td>
                    <td>${item.Grupo}</td>
                    <td>${item.ID_Unidad}</td>
                    <td>${item.Bodega}</td>
                    <td>${item.Saldo}</td>
                    <td>${item.Costo}</td>
                    <td>${item.EstadoProducto}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        ajustarScrollbar();
    }

    function filtrarInventario() {
        const filtro = document.getElementById('filtroInventario').value.toLowerCase();
        const datosFiltrados = inventarioData.filter(item => 
            item.IDReferencia.toLowerCase().includes(filtro) ||
            item.Referencia.toLowerCase().includes(filtro)
        );
        mostrarDatosInventario(datosFiltrados);
    }
    
    document.addEventListener('DOMContentLoaded', cargarInventario);
    document.getElementById('filtroInventario').addEventListener('input', filtrarInventario);

    function procesarArchivoExcel() {
        console.log('Procesando archivo Excel');
        const file = document.getElementById('excelFileInput').files[0];
        if (file) {
            console.log('Archivo seleccionado:', file.name);
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('Archivo leído');
                const data = new Uint8Array(e.target.result);
                try {
                    const workbook = XLSX.read(data, {type: 'array'});
                    console.log('Workbook creado:', workbook);
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
                    console.log('Datos JSON:', jsonData);
                    
                    // Procesamos los datos
                    procesarDatosExcel(jsonData);
                } catch (error) {
                    console.error('Error al procesar el archivo Excel:', error);
                    Swal.fire('Error al procesar el archivo Excel: ' + error.message);
                }
            };
            reader.onerror = function(error) {
                console.error('Error al leer el archivo:', error);
                Swal.fire('Error al leer el archivo: ' + error.message);
            };
            reader.readAsArrayBuffer(file);
        } else {
            console.log('No se ha seleccionado ningún archivo');
            Swal.fire('Por favor, seleccione un archivo Excel.');
        }
    }
    
    function procesarDatosExcel(data) {
        console.log('Procesando datos:', data);
        // Asumimos que la primera fila son los encabezados
        const headers = data[0];
        const productos = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const producto = {};
            for (let j = 0; j < headers.length; j++) {
                producto[headers[j]] = row[j];
            }
            productos.push(producto);
        }
    
        // Mapear los campos del Excel a los campos de la base de datos
        const productosMapeados = productos.map(p => ({
            IdReferencia: p['REFERENCIA'] || '',
            Referencia: p['ARTICULO'] || '',
            Marca: p['MARCA'] || '',
            EstadoProducto: p['ESTADO'] || '',
            IdGrupo: '', // Dejar en blanco o asignar un valor por defecto
            IdUnidad: p['UNIDAD'] || '',
            Ubicacion: '',
            Costo: 0, // Asignar un valor por defecto o dejarlo en 0
            PrecioVenta1: 0, // Asignar un valor por defecto o dejarlo en 0
            IVA: 0,
            Estado: true, // Asumir que todos los productos importados están activos
            Tipo: false, // Asumir que no son servicios por defecto
            ManejaInventario: true // Asumir que manejan inventario por defecto
        }));
    
        // Enviar los datos mapeados al servidor
        fetch(`${API_BASE_URL}/api/importar-productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productosMapeados)
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire(data.message);
            document.getElementById('importarExcelModal').style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Hubo un error al importar los productos');
        });
    }

    document.querySelector('#maestrosLista .sub-menu li:nth-child(1)').addEventListener('click', function() {
        ocultarTodosPaneles();
        document.getElementById('gruposPanel').style.display = 'block';
    });

    function cargarGrupos(esParaSelect = false) {
        fetch(`${API_BASE_URL}/api/grupos`)
        .then(response => response.json())
        .then(grupos => {
            if (esParaSelect) {
                const selectGrupo = document.getElementById('grupo');
                selectGrupo.innerHTML = '<option value="">Seleccione un grupo</option>';
                grupos.forEach(grupo => {
                    if (grupo.estado) {
                        const option = document.createElement('option');
                        option.value = grupo.codigo;
                        option.textContent = grupo.descripcion;
                        option.dataset.ultimoCodigo = grupo.ultimoCodigo || '0';
                        selectGrupo.appendChild(option);
                    }
                });

                selectGrupo.addEventListener('change', generarCodigoProducto);
                } else {
                    const tableBody = document.querySelector('#gruposTable tbody');
                    tableBody.innerHTML = '';
                    grupos.forEach(grupo => {
                        const row = `
                            <tr data-id="${grupo.codigo}">
                                <td>${grupo.codigo}</td>
                                <td>${grupo.descripcion}</td>
                                <td>${grupo.estado ? 'Activo' : 'Inactivo'}</td>
                                <td>${grupo.menupos ? 'Sí' : 'No'}</td>
                            </tr>
                        `;
                        tableBody.innerHTML += row;
                    });
                    agregarEventListenersFilas();
                }
            })
            .catch(error => {
                console.error('Error al cargar grupos:', error);
                mostrarMensaje('Error al cargar los grupos', 'error');
            });
    }

    function generarCodigoProducto() {
        const selectGrupo = document.getElementById('grupo');
        const codigoInput = document.getElementById('codigo');
        const grupoSeleccionado = selectGrupo.options[selectGrupo.selectedIndex];
    
        if (grupoSeleccionado && grupoSeleccionado.value) {
            const idGrupo = grupoSeleccionado.value;
            
            // Hacer una petición al backend para obtener y actualizar el último código
            fetch(`${API_BASE_URL}/api/grupos/${idGrupo}/siguiente-codigo`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.nuevoCodigo) {
                    codigoInput.value = data.nuevoCodigo;
                } else {
                    throw new Error('No se pudo generar un nuevo código');
                }
            })
            .catch(error => {
                console.error('Error al generar código:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo generar un nuevo código para el producto'
                });
            });
        } else {
            codigoInput.value = '';
        }
    }

    btnBodegas.addEventListener('click', function() {
        ocultarTodosPaneles();
        bodegasPanel.style.display = 'block';
        cargarBodegas();
    });

    const formBodega = document.getElementById('bodegaForm');
    let modoEdicion = false;

    btnNuevoBodega.addEventListener('click', habilitarFormularioBodega);
    btnGuardarBodega.addEventListener('click', guardarBodega);
    btnEditarBodega.addEventListener('click', habilitarEdicionBodega);
    btnCancelarBodega.addEventListener('click', cancelarEdicionBodega);

    function habilitarFormularioBodega() {
        modoEdicion = false;
        formBodega.reset();
        formBodega.elements.IdBodega.disabled = false;
        formBodega.elements.Descripcion.disabled = false;
        formBodega.elements.Estado.disabled = false;
        formBodega.elements.Email.disabled = false;
        formBodega.elements.nombrepunto.disabled = false;
        formBodega.elements.direccionpunto.disabled = false;
        formBodega.elements.telefonopunto.disabled = false;
        formBodega.elements.Encargado.disabled = false; // Habilitar el nuevo campo Encargado
        btnGuardarBodega.disabled = false;
        btnCancelarBodega.disabled = false;
        btnEditarBodega.disabled = true;
    }

    function habilitarEdicionBodega() {
        modoEdicion = true;
        formBodega.elements.Descripcion.disabled = false;
        formBodega.elements.Estado.disabled = false;
        formBodega.elements.Email.disabled = false;
        formBodega.elements.nombrepunto.disabled = false;
        formBodega.elements.direccionpunto.disabled = false;
        formBodega.elements.telefonopunto.disabled = false;
        formBodega.elements.Encargado.disabled = false; // Habilitar el nuevo campo Encargado
        btnGuardarBodega.disabled = false;
        btnCancelarBodega.disabled = false;
        btnEditarBodega.disabled = true;
    }

    function guardarBodega() {
        const bodega = {
            IdBodega: formBodega.elements.IdBodega.value,
            Descripcion: formBodega.elements.Descripcion.value,
            Estado: formBodega.elements.Estado.checked ? 1 : 0,
            Email: formBodega.elements.Email.value,
            nombrepunto: formBodega.elements.nombrepunto.value,
            direccionpunto: formBodega.elements.direccionpunto.value,
            telefonopunto: formBodega.elements.telefonopunto.value,
            Encargado: formBodega.elements.Encargado.value
        };

        const url = `${API_BASE_URL}/api/bodegas`;
        const method = modoEdicion ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodega),
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire(data.message);
            cargarBodegas();
            cancelarEdicionBodega();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function cancelarEdicionBodega() {
        formBodega.reset();
        formBodega.elements.IdBodega.disabled = true;
        formBodega.elements.Descripcion.disabled = true;
        formBodega.elements.Estado.disabled = true;
        formBodega.elements.Email.disabled = true;
        formBodega.elements.nombrepunto.disabled = true;
        formBodega.elements.direccionpunto.disabled = true;
        formBodega.elements.telefonopunto.disabled = true;
        btnGuardarBodega.disabled = true;
        btnCancelarBodega.disabled = true;
        btnEditarBodega.disabled = true;
        modoEdicion = false;
    }

    function cargarBodegas() {
        fetch(`${API_BASE_URL}/api/bodegas`)
            .then(response => response.json())
            .then(bodegas => {
                const tableBodegas = document.querySelector('#bodegasTable tbody');
                tableBodegas.innerHTML = '';
                bodegas.forEach(bodega => {
                    const row = `
                        <tr data-id="${bodega.IdBodega}">
                            <td>${bodega.IdBodega}</td>
                            <td>${bodega.Descripcion}</td>
                            <td>${bodega.Estado ? 'Activo' : 'Inactivo'}</td>
                            <td>${bodega.Email || ''}</td>
                            <td>${bodega.nombrepunto || ''}</td>
                            <td>${bodega.direccionpunto || ''}</td>
                            <td>${bodega.telefonopunto || ''}</td>
                            <td>${bodega.Encargado || ''}</td>
                        </tr>
                    `;
                    tableBodegas.innerHTML += row;
                });
                agregarEventoClickFilas();
    
                const selectBodega = document.getElementById('bodega');
                if (selectBodega) {
                    selectBodega.innerHTML = '<option value="">Seleccione una bodega</option>';
                    bodegas.forEach(bodega => {
                        if (bodega.Estado) {
                            const option = document.createElement('option');
                            option.value = bodega.IdBodega;
                            option.textContent = bodega.Descripcion;
                            selectBodega.appendChild(option);
                        }
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function agregarEventoClickFilas() {
        const filas = document.querySelectorAll('#bodegasTable tbody tr');
        filas.forEach(fila => {
            fila.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const bodega = {
                    IdBodega: this.cells[0].textContent,
                    Descripcion: this.cells[1].textContent,
                    Estado: this.cells[2].textContent === 'Activo',
                    Email: this.cells[3].textContent,
                    nombrepunto: this.cells[4].textContent,
                    direccionpunto: this.cells[5].textContent,
                    telefonopunto: this.cells[6].textContent,
                    Encargado: this.cells[7].textContent  // Añadimos el campo Encargado
                };
    
                formBodega.elements.IdBodega.value = bodega.IdBodega;
                formBodega.elements.Descripcion.value = bodega.Descripcion;
                formBodega.elements.Estado.checked = bodega.Estado;
                formBodega.elements.Email.value = bodega.Email;
                formBodega.elements.nombrepunto.value = bodega.nombrepunto;
                formBodega.elements.direccionpunto.value = bodega.direccionpunto;
                formBodega.elements.telefonopunto.value = bodega.telefonopunto;
                formBodega.elements.Encargado.value = bodega.Encargado;  // Añadimos esta línea
    
                formBodega.elements.IdBodega.disabled = true;
                formBodega.elements.Descripcion.disabled = true;
                formBodega.elements.Estado.disabled = true;
                formBodega.elements.Email.disabled = true;
                formBodega.elements.nombrepunto.disabled = true;
                formBodega.elements.direccionpunto.disabled = true;
                formBodega.elements.telefonopunto.disabled = true;
                formBodega.elements.Encargado.disabled = true;  // Añadimos esta línea
    
                btnEditarBodega.disabled = false;
            });
        });
    }

    function ajustarScrollbar() {
        const tableContainers = document.querySelectorAll('.table-container');
        tableContainers.forEach(container => {
            if (container.scrollWidth > container.clientWidth) {
                container.style.overflowX = 'scroll';
            } else {
                container.style.overflowX = 'auto';
            }
        });
    }

    document.getElementById('btnImportarExcel').addEventListener('click', function() {
        console.log('Botón Importar Excel clickeado');
        document.getElementById('importarExcelModal').style.display = 'block';
    });

    if (btnImportarExcel && importarExcelModal) {
        btnImportarExcel.addEventListener('click', function() {
            console.log('Botón Importar Excel clickeado');
            importarExcelModal.style.display = 'block';
        });
    } else {
        console.error('No se encontró el botón de importar Excel o el modal');
    }
    
    document.getElementById('btnCerrarModal').addEventListener('click', function() {
        document.getElementById('importarExcelModal').style.display = 'none';
    });
    
    document.getElementById('btnProcesarExcel').addEventListener('click', function() {
        console.log('Botón Procesar Excel clickeado');
        procesarArchivoExcel();
    });

    const configList = document.getElementById('configList');
    configList.addEventListener('click', function(e) {
        const target = e.target.closest('.expandable');
        if (target) {
            e.stopPropagation();
            target.classList.toggle('expanded');
        }
    });

    window.onclick = function(event) {
        if (event.target == passwordModal) {
            passwordModal.style.display = "none";
        }
    }

    passwordInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            submitPassword.click();
        }
    });

    cancelPassword.addEventListener('click', function() {
        passwordModal.style.display = 'none';
    });

    window.addEventListener('resize', ajustarScrollbar);

    passwordModal.style.display = 'none';

    let bodegaSeleccionada = null;

    function seleccionarBodega(fila) {
        // Quitar la selección de todas las filas
        document.querySelectorAll('#bodegasTable tbody tr').forEach(f => {
            f.classList.remove('selected');
        });
        
        // Seleccionar la fila actual
        fila.classList.add('selected');
        
        // Función auxiliar para establecer valores de forma segura
        const setValueSafely = (id, value, isCheckbox = false) => {
            const element = document.getElementById(id);
            if (element) {
                if (isCheckbox) {
                    element.checked = value === 'Activo';
                } else {
                    element.value = value;
                }
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado`);
            }
        };
    
        // Establecer valores de forma segura
        bodegaSeleccionada = fila.getAttribute('data-id') || '';
        setValueSafely('IdBodega', fila.cells[0]?.textContent || '');
        setValueSafely('Descripcion', fila.cells[1]?.textContent || '');
        setValueSafely('Estado', fila.cells[2]?.textContent || '', true);
        setValueSafely('Email', fila.cells[3]?.textContent || '');
        setValueSafely('nombrepunto', fila.cells[4]?.textContent || '');
        setValueSafely('direccionpunto', fila.cells[5]?.textContent || '');
        setValueSafely('telefonopunto', fila.cells[6]?.textContent || '');
        setValueSafely('Encargado', fila.cells[7]?.textContent || '');
        
        // Habilitar botones de forma segura
        const btnEditar = document.getElementById('btnEditarBodega');
        if (btnEditar) btnEditar.disabled = false;
        
        const btnEliminar = document.getElementById('btnEliminarBodega');
        if (btnEliminar) btnEliminar.disabled = false;
    }

    function agregarEventoClickFilas() {
        const tabla = document.getElementById('bodegasTable');
        if (tabla) {
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach(fila => {
                fila.addEventListener('click', function() {
                    seleccionarBodega(this);
                });
            });
        } else {
            console.warn('Tabla de bodegas no encontrada');
        }
    }

    document.getElementById('btnEliminarBodega').addEventListener('click', function() {
        if (bodegaSeleccionada) {
            if (confirm('¿Está seguro de que desea eliminar esta bodega?')) {
                eliminarBodega(bodegaSeleccionada);
            }
        } else {
            Swal.fire('Por favor, seleccione una bodega para eliminar.');
        }
    });

    function eliminarBodega(idBodega) {
        fetch(`${API_BASE_URL}/api/bodegas/${idBodega}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Bodega eliminada exitosamente');
                cargarBodegas(); // Recargar la lista de bodegas
                limpiarFormularioBodega(); // Limpiar el formulario después de eliminar
            } else {
                Swal.fire('Error al eliminar la bodega: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error al eliminar la bodega');
        });
    }

    function limpiarFormularioBodega() {
        document.getElementById('bodegaForm').reset();
        document.getElementById('btnEditarBodega').disabled = true;
        document.getElementById('btnEliminarBodega').disabled = true;
        bodegaSeleccionada = null;
    }

    // Asegúrate de llamar a esta función después de cargar las bodegas
    cargarBodegas();

    function mostrarInformacionLicencia(data) {
        let contenidoLicencia = `
            <h2>Licenciamiento De Software MIG</h2>
            <p><strong>Señores:</strong> ${data.nombreComercial}</p>
            <p><strong>NIT:</strong> ${data.nit}</p>
            <p><strong>RAZÓN SOCIAL:</strong> ${data.razonSocial}</p>
            <p><strong>NOMBRE COMERCIAL:</strong> ${data.nombreComercial}</p>
            <p><strong>UBICACIÓN COMERCIAL:</strong> ${data.ubicacionComercial}</p>
            <p><strong>CIUDAD:</strong> ${data.ciudad}</p>
            <p><strong>TELÉFONO:</strong> ${data.telefono}</p>
            <p><strong>VERSIÓN:</strong> ${data.version}</p>
            <p><strong>NUMERO DE LICENCIA:</strong> ${data.numeroLicencia}</p>
            <p><strong>CANTIDAD DE USUARIOS:</strong> ${data.cantidadUsuarios}</p>
            <p><strong>TIPO LICENCIA:</strong> ${data.tipoLicencia}</p>
        `;

        if (data.tipoLicencia === 'RENTA') {
            contenidoLicencia += `<p><strong>FECHA DE VENCIMIENTO:</strong> ${data.fechaVencimiento}</p>`;
        }

        licenciaInfo.innerHTML = contenidoLicencia;
        licenciaForm.style.display = 'none';
        licenciaInfo.style.display = 'block';
    }

    function generarLicencia(e) {
        e.preventDefault();
        const formData = new FormData(licenciaForm);
        const data = Object.fromEntries(formData.entries());
        data.caracteristicas_equipo = obtenerCaracteristicasEquipo();
    
        fetch(`${API_BASE_URL}/api/licencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Licencia generada exitosamente. Por favor, revise su correo electrónico.');
                mostrarModalVerificacion(data.licencia.numeroLicencia, data.usuario, data.password);
            } else {
                Swal.fire('Error al generar la licencia: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error al procesar la solicitud');
        });
    }
    
    function mostrarModalVerificacion(licenciaGenerada, usuario, password) {
        const modal = document.getElementById('licenciaModal');
        const verificarBtn = document.getElementById('verificarLicencia');
        
        modal.style.display = 'block';
        
        verificarBtn.onclick = function() {
            const licenciaIngresada = document.getElementById('licenciaInput').value;
            verificarLicencia(licenciaIngresada, licenciaGenerada, usuario, password);
            modal.style.display = 'none';
        }
    
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
        
    licenciaForm.addEventListener('submit', generarLicencia);
    
    function verificarLicencia(licenciaIngresada, licenciaGenerada, usuario, password) {
        const caracteristicasEquipo = obtenerCaracteristicasEquipo();
        
        fetch(`${API_BASE_URL}/api/verificar_licencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                licencia: licenciaIngresada,
                caracteristicas_equipo: caracteristicasEquipo
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.valida) {
                Swal.fire('Licencia válida. Por favor, inicie sesión.');
                mostrarLogin(usuario, password);
            } else {
                Swal.fire('Licencia inválida. Por favor, intente nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error al verificar la licencia');
        });
    }

    function mostrarLogin(usuario, password) {
        const loginForm = `
            <h2>Iniciar Sesión</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Usuario" value="${usuario}" readonly>
                <input type="password" id="password" placeholder="Contraseña">
                <button type="submit">Iniciar Sesión</button>
            </form>
        `;
        
        licenciaInfo.innerHTML = loginForm;
        
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const inputPassword = document.getElementById('password').value;
            if (inputPassword === password) {
                Swal.fire('Inicio de sesión exitoso');
                mostrarImagenLicencia();
            } else {
                Swal.fire('Contraseña incorrecta');
            }
        });
    }

    function mostrarImagenLicencia() {
        const nit = document.getElementById('nit').value;
        fetch(`${API_BASE_URL}/api/generar_imagen_licencia/${nit}`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100%';
            licenciaInfo.innerHTML = '';
            licenciaInfo.appendChild(img);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error al generar la imagen de la licencia');
        });
    }

    // Cuando se abre el formulario de productos (por ejemplo, al hacer clic en "Nuevo Producto")
    document.getElementById('btnNuevoProducto').addEventListener('click', function() {
        habilitarCampos(true);
        limpiarCampos();
        cargarGrupos(true);
        document.getElementById('codigo').value = '';
        document.getElementById('grupo').value = '';
        document.getElementById('codigo').disabled = true;
    });

    const btnVolverFormulario = document.createElement('button');
    btnVolverFormulario.textContent = 'Volver al formulario';
    btnVolverFormulario.addEventListener('click', function() {
        licenciaForm.style.display = 'block';
        licenciaInfo.style.display = 'none';
        licenciaForm.reset();
    });
    licenciaInfo.appendChild(btnVolverFormulario);

    function centrarPanelLicencia() {
        const panelLicencia = document.getElementById('licenciaPanel');
        panelLicencia.style.position = 'fixed';
        panelLicencia.style.top = '50%';
        panelLicencia.style.left = '50%';
        panelLicencia.style.transform = 'translate(-50%, -50%)';
        panelLicencia.style.maxWidth = '80%';
        panelLicencia.style.maxHeight = '80%';
        panelLicencia.style.overflow = 'auto';
    }

    centrarPanelLicencia();

    window.addEventListener('resize', centrarPanelLicencia);

    function cargarInformacionLicencia() {
        fetch(`${API_BASE_URL}/api/licencia`)
            .then(response => response.json())
            .then(data => {
                if (data.message === 'No se encontró información de licencia') {
                    licenciaForm.style.display = 'block';
                    licenciaInfo.style.display = 'none';
                } else {
                    mostrarInformacionLicencia(data);
                }
            })
            .catch(error => {
                console.error('Error al cargar la información de la licencia:', error);
                licenciaForm.style.display = 'block';
                licenciaInfo.style.display = 'none';
            });
    }

    cargarInformacionLicencia();

    // Inicializar el estado del campo de fecha de vencimiento
    tipoLicenciaSelect.dispatchEvent(new Event('change'));

    // Función para manejar la expansión de los menús
    function handleMenuExpansion(event) {
        const target = event.target.closest('.expandable');
        if (target) {
            event.stopPropagation();
            target.classList.toggle('expanded');
        }
    }

    // Botón menú (Hamburguesa responsive)
    const button = document.querySelector('.button');
    const nav = document.querySelector('.nav');

    button.addEventListener('click', () => {
        nav.classList.toggle('activo');
    });

    // Función para ajustar la altura de los paneles
    function ajustarAlturaPaneles() {
        const paneles = document.querySelectorAll('.panel');
        const alturaVentana = window.innerHeight;
        paneles.forEach(panel => {
            panel.style.maxHeight = `${alturaVentana - 100}px`;
        });
    }

    // Llamar a la función al cargar la página y al cambiar el tamaño de la ventana
    window.addEventListener('load', ajustarAlturaPaneles);
    window.addEventListener('resize', ajustarAlturaPaneles);

    // Función para mostrar mensajes de error o éxito
    function mostrarMensaje(mensaje, tipo) {
        console.log(`Mostrando mensaje: "${mensaje}" de tipo: ${tipo}`);
        const mensajeElement = document.createElement('div');
        mensajeElement.textContent = mensaje;
        mensajeElement.className = `mensaje ${tipo}`;
        document.body.appendChild(mensajeElement);
        setTimeout(() => {
            mensajeElement.remove();
            console.log(`Mensaje "${mensaje}" removido`);
        }, 3000);
    }

    // Función para validar formularios
    function validarFormulario(form) {
        let esValido = true;
        form.querySelectorAll('[required]').forEach(campo => {
            if (!campo.value) {
                esValido = false;
                campo.classList.add('campo-error');
            } else {
                campo.classList.remove('campo-error');
            }
        });
        return esValido;
    }

    function habilitarCampos(habilitar) {
        const campos = document.querySelectorAll('#maestroReferencias input, #maestroReferencias select');
        campos.forEach(campo => {
            campo.disabled = !habilitar;
        });
        
        // Habilitar o deshabilitar botones según corresponda
        document.getElementById('btnGuardarProducto').disabled = !habilitar;
        document.getElementById('btnCancelarProducto').disabled = !habilitar;
        document.getElementById('btnEditarProducto').disabled = habilitar;
    }

    document.getElementById('btnNuevoProducto').addEventListener('click', function() {
        habilitarCampos(true);
        limpiarCampos();
        cargarGrupos(true);
        document.getElementById('codigo').value = ''; // Limpiar el código
        document.getElementById('grupo').value = ''; // Resetear la selección de grupo
        document.getElementById('codigo').disabled = true; // Asegurar que el código esté deshabilitado
    });

    function limpiarCampos() {
        formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }

    btnCancelarProducto.addEventListener('click', function() {
        console.log('Cancelando producto');
        habilitarCampos(false);
        limpiarCampos();
        btnEditarProducto.disabled = true;
    });

    btnCerrarProducto.addEventListener('click', function() {
        console.log('Cerrando panel de producto');
        maestroReferenciasPanel.style.display = 'none';
        habilitarCampos(false);
        limpiarCampos();
        btnEditarProducto.disabled = true;
    });

    btnGuardarProducto.addEventListener('click', function() {
        console.log('Guardando producto');
        
        const productoData = {
            codigo: document.getElementById('codigo').value,
            grupo: document.getElementById('grupo').value,
            descripcion: document.getElementById('descripcion').value,
            unidad: document.getElementById('unidad').value,
            bodega: document.getElementById('bodega').value,
            costo: parseFloat(document.getElementById('costo').value) || 0,
            precioVenta1: parseFloat(document.getElementById('precioVenta1').value) || 0,
            iva: parseFloat(document.getElementById('iva').value) || 0,
            ubicacion: document.getElementById('ubicacion').value,
            marca: document.getElementById('marca').value,
            estadoProducto: document.getElementById('estadoProducto').value,
            activo: document.getElementById('activo').checked,
            esServicio: document.getElementById('esServicio').checked,
            agotado: document.getElementById('agotado').checked,
            modificaPrecio: document.getElementById('modificaPrecio').checked,
            subgrupo: document.getElementById('subgrupo').value || null,
            subcategoria: document.getElementById('subcategoria').value || null
        };
    
        console.log('Datos del producto a enviar:', productoData);
    
        // Validaciones
        if (!productoData.codigo) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El código del producto es obligatorio.'
            });
            return;
        }
    
        if (!productoData.descripcion) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La descripción del producto es obligatoria.'
            });
            return;
        }
    
        if (!productoData.grupo) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe seleccionar un grupo para el producto.'
            });
            return;
        }
    
        fetch(`${API_BASE_URL}/api/referencias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productoData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);
            verificarProductoGuardado(productoData.codigo);
            habilitarCampos(false);
            btnEditarProducto.disabled = false;
            limpiarCampos();
            
            // Actualizar el último código usado para el grupo
            const grupoSelect = document.getElementById('grupo');
            const grupoOption = grupoSelect.options[grupoSelect.selectedIndex];
            if (grupoOption) {
                const ultimoCodigo = parseInt(productoData.codigo.slice(-2));
                grupoOption.dataset.ultimoCodigo = ultimoCodigo.toString();
            }
        })
        .catch((error) => {
            console.error('Error completo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al guardar el producto: ${error.message || 'Error desconocido'}`
            });
        })
        .finally(() => {
            btnGuardarProducto.disabled = false;
        });
    });

    function verificarProductoGuardado(codigoProducto) {
        console.log('Producto guardado correctamente:', codigoProducto);
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `El producto con código ${codigoProducto} se guardó correctamente en la base de datos.`
        });
    }

    function cargarProductos() {
        console.log('Cargando productos...');
        
        // Hacer una petición al servidor para obtener la lista de productos
        fetch(`${API_BASE_URL}/api/referencias`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los productos');
                }
                return response.json();
            })
            .then(productos => {
                console.log('Productos cargados:', productos);
                
                // Obtener la referencia a la tabla o lista donde se muestran los productos
                const tablaProductos = document.getElementById('tablaProductos');
                
                // Limpiar la tabla existente
                tablaProductos.innerHTML = '';
                
                // Crear la cabecera de la tabla
                const cabecera = tablaProductos.createTHead();
                const filaCabecera = cabecera.insertRow();
                ['Código', 'Descripción', 'Grupo', 'Precio', 'Estado'].forEach(texto => {
                    const th = document.createElement('th');
                    th.textContent = texto;
                    filaCabecera.appendChild(th);
                });
                
                // Crear el cuerpo de la tabla
                const cuerpo = tablaProductos.createTBody();
                
                // Agregar cada producto a la tabla
                productos.forEach(producto => {
                    const fila = cuerpo.insertRow();
                    fila.insertCell().textContent = producto.IdReferencia;
                    fila.insertCell().textContent = producto.Referencia;
                    fila.insertCell().textContent = producto.IdGrupo;
                    fila.insertCell().textContent = producto.PrecioVenta1;
                    fila.insertCell().textContent = producto.Estado ? 'Activo' : 'Inactivo';
                    
                    // Añadir evento de clic a la fila para seleccionar el producto
                    fila.addEventListener('click', () => seleccionarProducto(producto));
                });
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los productos. Por favor, intente de nuevo.'
                });
            });
    }
    
    // Función para seleccionar un producto y mostrar sus detalles
    function seleccionarProducto(producto) {
        console.log('Producto seleccionado:', producto);
        
        // Rellenar el formulario con los datos del producto seleccionado
        document.getElementById('codigo').value = producto.IdReferencia;
        document.getElementById('descripcion').value = producto.Referencia;
        document.getElementById('grupo').value = producto.IdGrupo;
        document.getElementById('precioVenta1').value = producto.PrecioVenta1;
        document.getElementById('activo').checked = producto.Estado;
        
        // Aquí puedes agregar más campos según la estructura de tu producto
        
        // Habilitar el botón de editar y deshabilitar el de guardar
        document.getElementById('btnEditarProducto').disabled = false;
        document.getElementById('btnGuardarProducto').disabled = true;
        
        // Deshabilitar los campos del formulario
        habilitarCampos(false);
    }
    
    // No olvides llamar a esta función cuando se cargue la página
    document.addEventListener('DOMContentLoaded', cargarProductos);
    
    function actualizarPrecioConIVA() {
        const precioSinIVA = parseFloat(document.getElementById('precioVenta1').value) || 0;
        const iva = parseFloat(document.getElementById('iva').value) || 0;
        const precioConIVA = precioSinIVA * (1 + (iva / 100));
        document.getElementById('precioConIVA').textContent = precioConIVA.toFixed(2);
    }
    
    // Añade event listeners para los campos de precio e IVA
    document.getElementById('precioVenta1').addEventListener('input', actualizarPrecioConIVA);
    document.getElementById('iva').addEventListener('input', actualizarPrecioConIVA);

    function habilitarCamposGrupo(habilitar) {
        elements.codigoGrupo.disabled = !habilitar;
        elements.descripcionGrupo.disabled = !habilitar;
        elements.estadoGrupo.disabled = !habilitar;
        elements.ventaGrupo.disabled = !habilitar;
    }

    // Función para limpiar el formulario
    function limpiarFormularioGrupo() {
        elements.codigoGrupo.value = '';
        elements.descripcionGrupo.value = '';
        elements.estadoGrupo.checked = false;
        elements.ventaGrupo.checked = false;
        grupoSeleccionado = null;
    }

    let guardando = false;

    function guardarGrupo() {
        console.log('Iniciando guardado de grupo');
        if (guardando) return;
        guardando = true;
    
        if (!validarFormularioGrupo()) {
            mostrarMensaje('Por favor, complete todos los campos requeridos', 'error');
            guardando = false;
            return;
        }
    
        const grupoData = {
            codigo: elements.codigoGrupo.value,
            descripcion: elements.descripcionGrupo.value,
            estado: elements.estadoGrupo.checked,
            menupos: elements.ventaGrupo.checked
        };
    
        console.log('Datos del grupo a enviar:', grupoData);
    
        fetch(`${API_BASE_URL}/api/grupos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(grupoData)
        })
        .then(response => {
            console.log('Respuesta del servidor:', response);
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos del servidor:', data);
            guardando = false;
            if (data.success) {
                console.log('Operación exitosa');
                mostrarMensaje(data.message, 'success');
                cargarGrupos();
                limpiarFormularioGrupo();
                habilitarCamposGrupo(false);
            } else {
                console.log('Error en la respuesta del servidor');
                throw new Error(data.message || 'Error desconocido al guardar el grupo');
            }
        })
        .catch((error) => {
            debugger; // Esto pausará la ejecución cuando ocurra un error
            console.error('Error capturado:', error);
            guardando = false;
            mostrarMensaje('Error al guardar el grupo: ' + error.message, 'error');
        })
        .finally(() => {
            console.log('Proceso de guardado finalizado');
        });
    }

    function validarFormularioGrupo() {
        const codigo = document.getElementById('codigoGrupo').value;
        const descripcion = document.getElementById('descripcionGrupo').value;
        return codigo.trim() !== '' && descripcion.trim() !== '';
    }

    document.getElementById('btnNuevoGrupo').addEventListener('click', function() {
        console.log('Botón Nuevo presionado');
        modoEdicion = false;
        limpiarFormularioGrupo();
        habilitarCamposGrupo(true);
        document.getElementById('btnGuardarGrupo').disabled = false;
        document.getElementById('btnCancelarGrupo').disabled = false;
        document.getElementById('btnEditarGrupo').disabled = true;
        document.getElementById('btnEliminarGrupo').disabled = true;
    });

    document.getElementById('btnGuardarGrupo').addEventListener('click', function(e) {
        e.preventDefault();
        guardarGrupo();
    });

    setTimeout(() => {
        mostrarMensaje(data.message, 'success');
        cargarGrupos();
        limpiarFormularioGrupo();
        habilitarCamposGrupo(false);
    }, 100);

    document.addEventListener('DOMContentLoaded', cargarGrupos);

    let grupoAEliminar = null;

    function mostrarConfirmacionEliminar(idGrupo) {
        grupoAEliminar = idGrupo;
        document.getElementById('confirmDeleteModal').style.display = 'block';
    }

    // Función para eliminar el grupo
    function eliminarGrupo() {
        if (!grupoAEliminar) return;
    
        fetch(`${API_BASE_URL}/api/grupos/${grupoAEliminar}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Grupo eliminado exitosamente', 'success');
                cargarGrupos(); // Recargar la lista de grupos
            } else {
            mostrarNotificacion('Error al eliminar el grupo: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('Error al eliminar el grupo', 'error');
        })
        .finally(() => {
            document.getElementById('confirmDeleteModal').style.display = 'none';
            grupoAEliminar = null;
        });
    }

    function mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.textContent = mensaje;
        notificacion.className = `notification ${tipo}`;
        document.body.appendChild(notificacion);
    
        // Forzar un reflow para que la transición funcione
        notificacion.offsetHeight;
    
        notificacion.classList.add('show');
    
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 500);
        }, 3000);
    }

    // Event listeners
    document.getElementById('btnEliminarGrupo').addEventListener('click', function() {
        if (grupoSeleccionado) {
        mostrarConfirmacionEliminar(grupoSeleccionado);
        } else {
        mostrarNotificacion('Por favor, seleccione un grupo para eliminar.', 'error');
        }
    });
    
    document.getElementById('confirmDelete').addEventListener('click', eliminarGrupo);
    
    document.getElementById('cancelDelete').addEventListener('click', function() {
        document.getElementById('confirmDeleteModal').style.display = 'none';
        grupoAEliminar = null;
    });

    elements.btnCancelarGrupo.addEventListener('click', function() {
        limpiarFormularioGrupo();
        habilitarCamposGrupo(false);
        elements.btnGuardarGrupo.disabled = true;
        elements.btnCancelarGrupo.disabled = true;
        elements.btnEditarGrupo.disabled = true;
        elements.btnEliminarGrupo.disabled = true;
    });

    elements.btnEditarGrupo.addEventListener('click', function() {
        habilitarCamposGrupo(true);
        elements.codigoGrupo.disabled = true; // Mantener el código deshabilitado en modo edición
        elements.btnGuardarGrupo.disabled = false;
        elements.btnCancelarGrupo.disabled = false;
    });

    btnGuardarGrupo.addEventListener('click', function() {
        const grupoData = {
            codigo: document.getElementById('codigoGrupo').value,
            descripcion: document.getElementById('descripcionGrupo').value,
            estado: document.getElementById('estadoGrupo').checked,
            menupos: document.getElementById('ventaGrupo').checked
        };
    
        const url = modoEdicion ? `${API_BASE_URL}/api/grupos/${grupoData.codigo}` : '/api/grupos';
        const method = modoEdicion ? 'PUT' : 'POST';
    
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(grupoData)
        })
        .then(data => {
            console.log('Respuesta exitosa:', data);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: data.message || 'Grupo guardado exitosamente'
            });
            cargarGrupos();
            limpiarFormularioGrupo();
            habilitarCamposGrupo(false);
        })
        .catch((error) => {
            console.error('Error detallado:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el grupo: ' + error.message
            });
        });
    });

    function agregarEventListenersFilas() {
        const filas = document.querySelectorAll('#gruposTable tbody tr');
        filas.forEach(fila => {
            fila.addEventListener('click', function() {
                seleccionarGrupo(this);
            });
        });
    }

    document.getElementById('btnGruposFamiliasCategorias').addEventListener('click', function() {
        document.getElementById('gruposPanel').style.display = 'block';
        cargarGrupos(); // Sin argumento o con false
    });

    document.getElementById('btnProductosArticulosReferencias').addEventListener('click', function() {
        document.getElementById('maestroReferencias').style.display = 'block';
        cargarGrupos(true); // Pasar true para indicar que es para el select
    });

    document.getElementById('codigo').disabled = true;

    elements.codigoGrupo.addEventListener('blur', function() {
        const codigo = this.value;
        if (codigo) {
            fetch(`${API_BASE_URL}/api/grupos/${codigo}`)
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        mostrarMensaje('Este código ya existe. Por favor, use uno diferente.', 'warning');
                    }
                });
        }
    });

    document.getElementById('btnGruposFamiliasCategorias').addEventListener('click', function() {
        console.log('Abriendo panel de grupos');
        document.getElementById('gruposPanel').style.display = 'block';
        cargarGrupos();
    });

    document.querySelector('#busquedaReferenciasModal .close').addEventListener('click', function() {
        document.getElementById('busquedaReferenciasModal').style.display = 'none';
    });
    
    document.getElementById('btnSalirBusquedaReferencia').addEventListener('click', function() {
        document.getElementById('busquedaReferenciasModal').style.display = 'none';
    });

    btnCerrarGrupo.addEventListener('click', function() {
        document.getElementById('gruposPanel').style.display = 'none';
    });

    // Función para seleccionar un grupo de la tabla
    function seleccionarGrupo(fila) {
        // Quitar la selección de todas las filas
        document.querySelectorAll('#gruposTable tbody tr').forEach(f => {
            f.classList.remove('selected');
        });
        
        // Seleccionar la fila actual
        fila.classList.add('selected');
        
        grupoSeleccionado = fila.dataset.id;
        elements.codigoGrupo.value = fila.cells[0].textContent;
        elements.descripcionGrupo.value = fila.cells[1].textContent;
        elements.estadoGrupo.checked = fila.cells[2].textContent === 'Activo';
        elements.ventaGrupo.checked = fila.cells[3].textContent === 'Sí';
        
        habilitarCamposGrupo(false);
        elements.btnEditarGrupo.disabled = false;
        elements.btnEliminarGrupo.disabled = false;
        elements.codigoGrupo.disabled = true; // Deshabilitar el código en modo edición
    
        // Opcional: Hacer scroll al formulario si está fuera de la vista
        elements.formGrupo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Agregar evento de clic a las filas de la tabla
    document.querySelector('#gruposTable tbody').addEventListener('click', function(e) {
        const fila = e.target.closest('tr');
        if (fila) {
            seleccionarGrupo(fila);
        }
    });

    btnEditarProducto.addEventListener('click', function() {
        habilitarCampos(true);
        btnGuardarProducto.disabled = false;
        btnCancelarProducto.disabled = false;
    });

    // Agregar validación a todos los formularios
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validarFormulario(this)) {
                e.preventDefault();
                mostrarMensaje('Por favor, complete todos los campos requeridos', 'error');
            }
        });
    });

    // Función para buscar en tabla
    function buscarEnTabla(inputId, tablaId) {
        const input = document.getElementById(inputId);
        const tabla = document.getElementById(tablaId);
        const filas = tabla.querySelectorAll('tbody tr');

        input.addEventListener('keyup', function() {
            const termino = this.value.toLowerCase();
            filas.forEach(fila => {
                const texto = fila.textContent.toLowerCase();
                fila.style.display = texto.includes(termino) ? '' : 'none';
            });
        });
    }

    // Agregar búsqueda a todas las tablas
    document.querySelectorAll('table').forEach(tabla => {
        const inputBusqueda = document.createElement('input');
        inputBusqueda.type = 'text';
        inputBusqueda.placeholder = 'Buscar...';
        inputBusqueda.id = `busqueda-${tabla.id}`;
        inputBusqueda.className = 'input-busqueda';
        tabla.parentNode.insertBefore(inputBusqueda, tabla);
        buscarEnTabla(inputBusqueda.id, tabla.id);
    });

    // Función para ordenar tabla
    function hacerTablaOrdenable(tablaId) {
        const tabla = document.getElementById(tablaId);
        const thead = tabla.querySelector('thead');
        const tbody = tabla.querySelector('tbody');
        const filas = tbody.querySelectorAll('tr');
        const direcciones = Array(filas[0].children.length).fill('asc');

        thead.querySelectorAll('th').forEach((th, columnaIndex) => {
            th.addEventListener('click', () => {
                const filaArray = Array.from(filas);
                filaArray.sort((a, b) => {
                    const aValor = a.children[columnaIndex].textContent.trim();
                    const bValor = b.children[columnaIndex].textContent.trim();
                    if (direcciones[columnaIndex] === 'asc') {
                        return aValor.localeCompare(bValor, undefined, {numeric: true, sensitivity: 'base'});
                    } else {
                        return bValor.localeCompare(aValor, undefined, {numeric: true, sensitivity: 'base'});
                    }
                });
                filaArray.forEach(fila => tbody.appendChild(fila));
                direcciones[columnaIndex] = direcciones[columnaIndex] === 'asc' ? 'desc' : 'asc';
            });
        });
    }

    // Hacer todas las tablas ordenables
    document.querySelectorAll('table').forEach(tabla => hacerTablaOrdenable(tabla.id));

    // Función para manejar paginación
    function agregarPaginacion(tablaId, filasPorPagina) {
        const tabla = document.getElementById(tablaId);
        const filas = tabla.querySelectorAll('tbody tr');
        const numPaginas = Math.ceil(filas.length / filasPorPagina);
        let paginaActual = 1;

        function mostrarPagina(pagina) {
            filas.forEach((fila, index) => {
                fila.style.display = (index >= (pagina - 1) * filasPorPagina && index < pagina * filasPorPagina) ? '' : 'none';
            });
        }

        function actualizarBotonesPaginacion() {
            const botonesContainer = tabla.nextElementSibling;
            botonesContainer.innerHTML = '';
            for (let i = 1; i <= numPaginas; i++) {
                const boton = document.createElement('button');
                boton.textContent = i;
                boton.addEventListener('click', () => {
                    paginaActual = i;
                    mostrarPagina(i);
                    actualizarBotonesPaginacion();
                });
                if (i === paginaActual) {
                    boton.classList.add('pagina-actual');
                }
                botonesContainer.appendChild(boton);
            }
        }

        const botonesContainer = document.createElement('div');
        botonesContainer.className = 'paginacion-botones';
        tabla.parentNode.insertBefore(botonesContainer, tabla.nextSibling);

        mostrarPagina(1);
        actualizarBotonesPaginacion();
    }

    // Agregar paginación a todas las tablas
    document.querySelectorAll('table').forEach(tabla => agregarPaginacion(tabla.id, 10));

    if (document.querySelector('.draggable')) {
        setupDragAndDrop();
    }
    
    // Inicialización general
    document.addEventListener('DOMContentLoaded', function() {
        ajustarAlturaPaneles();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://migsistemasweb.com';
    const selectGrupo = document.getElementById('grupo');
    const selectSubgrupo = document.getElementById('subgrupo');
    const selectSubcategoria = document.getElementById('subcategoria');
    const selectUnidad = document.getElementById('unidad');
    const selectEstadoProducto = document.getElementById('estadoProducto');

    // Cargar grupos
    function cargarGrupos() {
        fetch(`${API_BASE_URL}/api/grupos`)
        .then(response => response.json())
        .then(grupos => {
            selectGrupo.innerHTML = '<option value="">Seleccione un grupo</option>';
            grupos.forEach(grupo => {
                if (grupo.estado) {
                    const option = document.createElement('option');
                    option.value = grupo.codigo;
                    option.textContent = grupo.descripcion;
                    selectGrupo.appendChild(option);
                }
            });
        })
        .catch(error => console.error('Error al cargar grupos:', error));
    }

    // Cargar subgrupos basados en el grupo seleccionado
    function cargarSubgrupos(idGrupo) {
        fetch(`${API_BASE_URL}/api/subgrupos/${idGrupo}`)
        .then(response => response.json())
        .then(subgrupos => {
            selectSubgrupo.innerHTML = '<option value="">Seleccione un SubGrupo</option>';
            subgrupos.forEach(subgrupo => {
                const option = document.createElement('option');
                option.value = subgrupo.IdSubgrupo;
                option.textContent = subgrupo.Subgrupo;
                selectSubgrupo.appendChild(option);
            });
            selectSubgrupo.disabled = false;
        })
        .catch(error => console.error('Error al cargar subgrupos:', error));
    }

    // Cargar subcategorías basadas en el grupo y subgrupo seleccionados
    function cargarSubcategorias(idGrupo, idSubgrupo) {
        fetch(`${API_BASE_URL}/api/subcategorias?idGrupo=${idGrupo}&idSubgrupo=${idSubgrupo}`)
        .then(response => response.json())
        .then(subcategorias => {
            selectSubcategoria.innerHTML = '<option value="">Seleccione una SubCategoria</option>';
            subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria.idsubcategoria;
                option.textContent = subcategoria.categoria;
                selectSubcategoria.appendChild(option);
            });
            selectSubcategoria.disabled = false;
        })
        .catch(error => console.error('Error al cargar subcategorías:', error));
    }

    // Cargar unidades
    function cargarUnidades() {
        fetch(`${API_BASE_URL}/api/unidades`)
        .then(response => response.json())
        .then(unidades => {
            selectUnidad.innerHTML = '<option value="">Seleccione una Unidad</option>';
            unidades.forEach(unidad => {
                const option = document.createElement('option');
                option.value = unidad.IdUnidad;
                option.textContent = unidad.Unidad;
                selectUnidad.appendChild(option);
            });
            selectUnidad.disabled = false;
        })
        .catch(error => console.error('Error al cargar unidades:', error));
    }

    // Cargar estados de producto
    function cargarEstadosProducto() {
        fetch(`${API_BASE_URL}/api/estado_producto`)
        .then(response => response.json())
        .then(estados => {
            selectEstadoProducto.innerHTML = '<option value="">Seleccione un Estado de Producto</option>';
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.IdEstadoProducto;
                option.textContent = estado.EstadoProducto;
                selectEstadoProducto.appendChild(option);
            });
            selectEstadoProducto.disabled = false;
        })
        .catch(error => console.error('Error al cargar estados de producto:', error));
    }

    // Event listeners
    selectGrupo.addEventListener('change', function() {
        const idGrupo = this.value;
        if (idGrupo) {
            cargarSubgrupos(idGrupo);
            selectSubcategoria.innerHTML = '<option value="">Seleccione una SubCategoria</option>';
            selectSubcategoria.disabled = true;
        } else {
            selectSubgrupo.innerHTML = '<option value="">Seleccione un SubGrupo</option>';
            selectSubgrupo.disabled = true;
            selectSubcategoria.innerHTML = '<option value="">Seleccione una SubCategoria</option>';
            selectSubcategoria.disabled = true;
        }
    });

    selectSubgrupo.addEventListener('change', function() {
        const idGrupo = selectGrupo.value;
        const idSubgrupo = this.value;
        if (idGrupo && idSubgrupo) {
            cargarSubcategorias(idGrupo, idSubgrupo);
        } else {
            selectSubcategoria.innerHTML = '<option value="">Seleccione una SubCategoria</option>';
            selectSubcategoria.disabled = true;
        }
    });

    // Inicialización
    cargarGrupos();
    cargarUnidades();
    cargarEstadosProducto();
});
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded for Salidas de Inventario');

    const btnInformes = document.getElementById('btnInformes');
    const informesPanel = document.getElementById('informesPanel');
    const btnCerrarInformes = informesPanel ? informesPanel.querySelector('.btn-close') : null;
    const informesList = document.getElementById('informesList');
    const informesSalidasPanel = document.getElementById('informesSalidasPanel');
    const tableBodySalidas = document.querySelector('#salidasInventarioTable tbody');
    const searchInputSalidas = document.getElementById('searchInputSalidas');
    const API_BASE_URL = 'https://migsistemasweb.com';

    const formSalidasInventario = document.getElementById('salidasInventarioForm');
    const btnBuscarSalidas = document.getElementById('btnBuscarSalidas');
    const btnExportarExcelSalidas = document.getElementById('btnExportarExcelSalidas');

    function cargarPanelInformes() {
        console.log('Cargando panel de informes');
        if (informesPanel) informesPanel.style.display = 'block';
    }

    function cerrarPanelInformes() {
        console.log('Cerrando panel de informes');
        if (informesPanel) informesPanel.style.display = 'none';
    }

    function cargarPanelSalidasInventarioInformes() {
        console.log('Cargando panel de salidas de inventario');
        if (informesSalidasPanel) informesSalidasPanel.style.display = 'block';
        if (informesPanel) informesPanel.style.display = 'none';
    }

    function cerrarPanelSalidasInventarioInformes() {
        console.log('Cerrando panel de salidas de inventario');
        if (informesSalidasPanel) informesSalidasPanel.style.display = 'none';
        
        // Limpiar los campos
        const fechaInicioSalidas = document.getElementById('fechaInicioSalidas');
        const fechaFinSalidas = document.getElementById('fechaFinSalidas');
        if (fechaInicioSalidas) fechaInicioSalidas.value = '';
        if (fechaFinSalidas) fechaFinSalidas.value = '';
        
        // Limpiar la tabla
        if (tableBodySalidas) {
            tableBodySalidas.innerHTML = '';
        }
        
        // Limpiar el campo de búsqueda si existe
        if (searchInputSalidas) {
            searchInputSalidas.value = '';
        }
    }

    if (btnInformes) btnInformes.addEventListener('click', cargarPanelInformes);
    if (btnCerrarInformes) btnCerrarInformes.addEventListener('click', cerrarPanelInformes);

    // Manejar clics en los elementos del submenú
    if (informesList) {
        informesList.addEventListener('click', function(event) {
            const subMenuItem = event.target.closest('.sub-menu li');
            if (subMenuItem) {
                const informeType = subMenuItem.textContent.trim();
                console.log('Tipo de informe seleccionado:', informeType);
                if (informeType === 'Salidas de inventario') {
                    cargarPanelSalidasInventarioInformes();
                }
                // Aquí puedes agregar más condiciones para otros tipos de informes
            }
        });
    }

    // Configurar el panel de Salidas de Inventario
    const btnCerrarSalidasInventario = informesSalidasPanel ? informesSalidasPanel.querySelector('.btn-close') : null;

    if (btnCerrarSalidasInventario) {
        btnCerrarSalidasInventario.addEventListener('click', cerrarPanelSalidasInventarioInformes);
    } else {
        console.error('Botón de cerrar salidas de inventario no encontrado');
    }

    if (formSalidasInventario) {
        formSalidasInventario.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario de salidas de inventario enviado');
            buscarSalidas();
        });
    } else {
        console.error('Formulario de salidas de inventario no encontrado');
    }

    if (btnBuscarSalidas) {
        btnBuscarSalidas.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón de búsqueda de salidas clickeado');
            buscarSalidas();
        });
    } else {
        console.error('Botón de búsqueda de salidas no encontrado');
    }

    if (btnExportarExcelSalidas) {
        btnExportarExcelSalidas.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón de exportar a Excel clickeado');
            exportarSalidasExcel();
        });
    } else {
        console.error('Botón de exportar a Excel no encontrado');
    }

    function buscarSalidas() {
        console.log('Función buscarSalidas() iniciada');
    
        const fechaInicioElement = document.getElementById('fechaInicioSalidas');
        const fechaFinElement = document.getElementById('fechaFinSalidas');
        
        console.log('Elemento fechaInicioSalidas:', fechaInicioElement);
        console.log('Elemento fechaFinSalidas:', fechaFinElement);
    
        if (!fechaInicioElement || !fechaFinElement) {
            console.error('Elementos de fecha no encontrados');
            Swal.fire('Error', 'No se pudieron encontrar los campos de fecha. Por favor, contacte al administrador.', 'error');
            return;
        }
    
        const fechaInicio = fechaInicioElement.value || '';
        const fechaFin = fechaFinElement.value || '';
        console.log('Fechas seleccionadas:', fechaInicio, fechaFin);
    
        if (!fechaInicio || !fechaFin) {
            console.error('Fechas de salidas no seleccionadas');
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de buscar las salidas.', 'error');
            return;
        }
    
        const url = `${API_BASE_URL}/api/salidas_inventario_informes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        console.log('URL de la solicitud de salidas:', url);
    
        fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            console.log('Respuesta de salidas recibida. Status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de salidas recibidos:', JSON.stringify(data, null, 2));
            if (data.salidas && Array.isArray(data.salidas)) {
                console.log('Número de salidas recibidas:', data.salidas.length);
                mostrarSalidasInformes(data.salidas);
            } else {
                throw new Error('Los datos de salidas recibidos no tienen el formato esperado');
            }
        })
        .catch(error => {
            console.error('Error al cargar salidas:', error);
            Swal.fire('Error', `Hubo un error al cargar los datos de salidas: ${error.message}. Por favor, revise la consola para más detalles.`, 'error');
        });
    }

    function mostrarSalidasInformes(salidas) {
        if (!tableBodySalidas) {
            console.error('Tabla de salidas no encontrada');
            return;
        }
        
        tableBodySalidas.innerHTML = '';
        
        if (salidas.length === 0) {
            tableBodySalidas.innerHTML = '<tr><td colspan="7">No se encontraron datos para el rango de fechas seleccionado.</td></tr>';
            return;
        }
    
        salidas.forEach(salida => {
            const row = `
                <tr>
                    <td>${salida.Numero}</td>
                    <td>${salida.Fecha}</td>
                    <td>${salida.IdReferencia}</td>
                    <td>${salida.Descripcion}</td>
                    <td>${salida.Cantidad.toFixed(2)}</td>
                    <td>${salida.Valor.toFixed(2)}</td>
                    <td>${salida.Total.toFixed(2)}</td>
                </tr>
            `;
            tableBodySalidas.innerHTML += row;
        });
    }

    // Función de búsqueda
    if (searchInputSalidas) {
        searchInputSalidas.addEventListener('input', function() {
            console.log('Búsqueda en salidas realizada:', this.value);
            const searchTerm = this.value.toLowerCase();
            const rows = tableBodySalidas.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    } else {
        console.error('Campo de búsqueda de salidas no encontrado');
    }

    // Función para exportar a Excel
    function exportarSalidasExcel() {
        const fechaInicio = document.getElementById('fechaInicioSalidas').value;
        const fechaFin = document.getElementById('fechaFinSalidas').value;
    
        if (!fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de exportar a Excel.', 'error');
            return;
        }
    
        const url = `${API_BASE_URL}/api/exportar_salidas_excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        
        fetch(url, {
            method: 'GET',
            credentials: 'include',
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(JSON.stringify(errorData));
                });
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Salidas_de_Inventario.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error al exportar a Excel:', error);
            let errorMessage = 'Hubo un problema al exportar a Excel.';
            let errorDetails = '';
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
                if (errorData.details) {
                    errorDetails = errorData.details;
                }
                if (errorData.traceback) {
                    console.error('Traceback:', errorData.traceback);
                }
            } catch (e) {
                console.error('Error al parsear el mensaje de error:', e);
            }
            Swal.fire({
                title: 'Error',
                html: `${errorMessage}<br><small>${errorDetails}</small>`,
                icon: 'error'
            });
        });
    }

    console.log('Configuración de eventos completada para Salidas de Inventario');
});
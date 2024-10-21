document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded para Informes de Entradas de Inventario');

    const btnInformes = document.getElementById('btnInformes');
    const informesPanel = document.getElementById('informesPanel');
    const btnCerrarInformes = informesPanel.querySelector('.btn-close');
    const informesList = document.getElementById('informesList');
    const informesEntradasPanel = document.getElementById('informesEntradasPanel');
    const tableBodyEntradas = document.querySelector('#entradasInventarioTable tbody');
    const searchInputEntradas = document.getElementById('searchInputEntradas');
    const formEntradasInventario = document.getElementById('entradasInventarioForm');
    const btnBuscarEntradas = document.getElementById('btnBuscarEntradas');
    const btnExportarExcelEntradas = document.getElementById('btnExportarExcelEntradas');
    const API_BASE_URL = 'https://migsistemasweb.com';

    function cargarPanelInformes() {
        console.log('Cargando panel de informes');
        informesPanel.style.display = 'block';
    }

    function cerrarPanelInformes() {
        console.log('Cerrando panel de informes');
        informesPanel.style.display = 'none';
    }

    function cargarPanelEntradasInventarioInformes() {
        console.log('Cargando panel de entradas de inventario');
        informesEntradasPanel.style.display = 'block';
        informesPanel.style.display = 'none';
    }

    function cerrarPanelEntradasInventarioInformes() {
        console.log('Cerrando panel de entradas de inventario');
        informesEntradasPanel.style.display = 'none';
        
        // Limpiar los campos
        document.getElementById('fechaInicioEntradas').value = '';
        document.getElementById('fechaFinEntradas').value = '';
        
        // Limpiar la tabla
        if (tableBodyEntradas) {
            tableBodyEntradas.innerHTML = '';
        }
        
        // Limpiar el campo de búsqueda si existe
        if (searchInputEntradas) {
            searchInputEntradas.value = '';
        }
    }

    btnInformes.addEventListener('click', cargarPanelInformes);
    btnCerrarInformes.addEventListener('click', cerrarPanelInformes);

    // Manejar la expansión del menú de Inventario
    informesList.addEventListener('click', function(event) {
        const mainItem = event.target.closest('.main-item');
        if (mainItem) {
            console.log('Clic en elemento principal del menú');
            const subMenu = mainItem.nextElementSibling;
            const chevron = mainItem.querySelector('.fas');

            if (subMenu.style.display === 'none' || subMenu.style.display === '') {
                subMenu.style.display = 'block';
                chevron.classList.remove('fa-chevron-down');
                chevron.classList.add('fa-chevron-up');
            } else {
                subMenu.style.display = 'none';
                chevron.classList.remove('fa-chevron-up');
                chevron.classList.add('fa-chevron-down');
            }
        }
    });

    // Manejar clics en los elementos del submenú
    informesList.addEventListener('click', function(event) {
        const subMenuItem = event.target.closest('.sub-menu li');
        if (subMenuItem) {
            const informeType = subMenuItem.textContent.trim();
            console.log('Tipo de informe seleccionado:', informeType);
            if (informeType === 'Entradas de inventario') {
                cargarPanelEntradasInventarioInformes();
            }
            // Aquí puedes agregar más condiciones para otros tipos de informes
        }
    });

    // Añadir efecto hover
    const allItems = informesPanel.querySelectorAll('.main-item, .sub-menu li');
    allItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e9ecef';
        });
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });

    // Configurar el panel de Entradas de Inventario
    const btnCerrarEntradasInventario = document.querySelector('#informesEntradasPanel .btn-close');

    if (btnCerrarEntradasInventario) {
        btnCerrarEntradasInventario.addEventListener('click', cerrarPanelEntradasInventarioInformes);
    } else {
        console.error('Botón de cerrar entradas de inventario no encontrado');
    }

    if (formEntradasInventario) {
        formEntradasInventario.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario de entradas de inventario enviado');
            buscarEntradas();
        });
    } else {
        console.error('Formulario de entradas de inventario no encontrado');
    }

    if (btnBuscarEntradas) {
        btnBuscarEntradas.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón de búsqueda de entradas clickeado');
            buscarEntradas();
        });
    } else {
        console.error('Botón de búsqueda de entradas no encontrado');
    }

    if (btnExportarExcelEntradas) {
        btnExportarExcelEntradas.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón de exportar a Excel clickeado');
            exportarEntradasExcel();
        });
    } else {
        console.error('Botón de exportar a Excel no encontrado');
    }

    function buscarEntradas() {
        const fechaInicio = document.getElementById('fechaInicioEntradas').value;
        const fechaFin = document.getElementById('fechaFinEntradas').value;
        console.log('Iniciando búsqueda de entradas con fechas:', fechaInicio, fechaFin);
    
        if (!fechaInicio || !fechaFin) {
            console.error('Fechas de entradas no seleccionadas');
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de buscar las entradas.', 'error');
            return;
        }
    
        const url = `${API_BASE_URL}/api/entradas_informes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        console.log('URL de la solicitud de entradas:', url);
    
        fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            console.log('Respuesta de entradas recibida. Status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de entradas recibidos:', JSON.stringify(data, null, 2));
            if (data.entradas && Array.isArray(data.entradas)) {
                console.log('Número de entradas recibidas:', data.entradas.length);
                mostrarEntradasInformes(data.entradas);
            } else {
                throw new Error('Los datos de entradas recibidos no tienen el formato esperado');
            }
        })
        .catch(error => {
            console.error('Error al cargar entradas:', error);
            Swal.fire('Error', `Hubo un error al cargar los datos de entradas: ${error.message}. Por favor, revise la consola para más detalles.`, 'error');
        });
    }

    function mostrarEntradasInformes(entradas) {
        if (!tableBodyEntradas) {
            console.error('Tabla de entradas no encontrada');
            return;
        }
        
        tableBodyEntradas.innerHTML = '';
        
        if (entradas.length === 0) {
            tableBodyEntradas.innerHTML = '<tr><td colspan="7">No se encontraron datos para el rango de fechas seleccionado.</td></tr>';
            return;
        }
    
        entradas.forEach(entrada => {
            const row = `
                <tr>
                    <td>${entrada.Numero}</td>
                    <td>${entrada.Fecha}</td>
                    <td>${entrada.IdReferencia}</td>
                    <td>${entrada.Descripcion}</td>
                    <td>${entrada.Cantidad.toFixed(2)}</td>
                    <td>${entrada.Valor.toFixed(2)}</td>
                    <td>${entrada.Total.toFixed(2)}</td>
                </tr>
            `;
            tableBodyEntradas.innerHTML += row;
        });
    }

    // Función de búsqueda
    if (searchInputEntradas) {
        searchInputEntradas.addEventListener('input', function() {
            console.log('Búsqueda en entradas realizada:', this.value);
            const searchTerm = this.value.toLowerCase();
            const rows = tableBodyEntradas.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    } else {
        console.error('Campo de búsqueda de entradas no encontrado');
    }

    // Función para exportar a Excel
    function exportarEntradasExcel() {
        const fechaInicio = document.getElementById('fechaInicioEntradas').value;
        const fechaFin = document.getElementById('fechaFinEntradas').value;
    
        if (!fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de exportar a Excel.', 'error');
            return;
        }
    
        const url = `${API_BASE_URL}/api/exportar_entradas_excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        
        fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
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
            a.download = 'Entradas_de_Inventario.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error al exportar a Excel:', error);
            let errorMessage = 'Hubo un problema al exportar a Excel.';
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                console.error('Error al parsear el mensaje de error:', e);
            }
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error'
            });
        });
    }

    console.log('Configuración de eventos completada para Informes de Entradas de Inventario');
});
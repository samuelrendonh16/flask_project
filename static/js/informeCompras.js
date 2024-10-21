document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded for Informe de Compras');

    const API_BASE_URL = 'https://migsistemasweb.com';
    
    // Elementos del DOM
    const elements = {
        btnInformes: document.getElementById('btnInformes'),
        informesPanel: document.getElementById('informesPanel'),
        btnCerrarInformes: document.querySelector('#informesPanel .btn-close'),
        informesList: document.getElementById('informesList'),
        informesComprasPanel: document.getElementById('informesComprasPanel'),
        tableBodyCompras: document.querySelector('#comprasTable tbody'),
        tableHeadCompras: document.querySelector('#comprasTable thead'),
        formCompras: document.getElementById('comprasForm'),
        fechaInicioCompras: document.getElementById('fechaInicioCompras'),
        fechaFinCompras: document.getElementById('fechaFinCompras'),
        btnBuscarCompras: document.getElementById('btnBuscarCompras'),
        btnExportarExcelCompras: document.getElementById('btnExportarExcelCompras'),
        btnVerReporteCompras: document.getElementById('btnVerReporteCompras'),
        btnSalirCompras: document.getElementById('btnSalirCompras')
    };

    // Funciones auxiliares
    const showElement = (element) => { if (element) element.style.display = 'block'; };
    const hideElement = (element) => { if (element) element.style.display = 'none'; };
    const formatDate = (date) => date.toISOString().split('T')[0];

    function cargarPanelInformeCompras() {
        console.log('Cargando panel de Informe de Compras');
        if (elements.informesComprasPanel) {
            showElement(elements.informesComprasPanel);
            console.log('Panel de Informe de Compras mostrado');
        } else {
            console.error('Panel de Informe de Compras no encontrado');
        }
        if (elements.informesPanel) hideElement(elements.informesPanel);
        limpiarFormularioCompras();
    }

    function cerrarPanelInformeCompras() {
        console.log('Cerrando panel de Informe de Compras');
        if (elements.informesComprasPanel) hideElement(elements.informesComprasPanel);
        if (elements.informesPanel) showElement(elements.informesPanel);
        limpiarFormularioCompras();
    }

    function limpiarFormularioCompras() {
        if (elements.fechaInicioCompras) elements.fechaInicioCompras.value = '';
        if (elements.fechaFinCompras) elements.fechaFinCompras.value = '';
        if (elements.tableBodyCompras) elements.tableBodyCompras.innerHTML = '';
        if (elements.tableHeadCompras) elements.tableHeadCompras.innerHTML = '';
        
        // Resetear radio buttons
        const radioButtons = document.querySelectorAll('input[name="tipoInformeCompras"]');
        radioButtons.forEach(radio => radio.checked = false);
        radioButtons[0].checked = true; // Seleccionar el primero por defecto

        console.log('Formulario de Informe de Compras reiniciado');
    }

    async function buscarCompras() {
        console.log('Función buscarCompras() iniciada');
        const fechaInicio = elements.fechaInicioCompras.value;
        const fechaFin = elements.fechaFinCompras.value;
        const tipoInforme = document.querySelector('input[name="tipoInformeCompras"]:checked').value;
        
        if (!fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de buscar.', 'error');
            return;
        }

        const url = `${API_BASE_URL}/api/informe_compras?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&tipo=${tipoInforme}`;
        console.log('URL de la solicitud:', url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Datos de Informe de Compras recibidos:', data);

            if (data.success) {
                mostrarInformeCompras(data.compras, tipoInforme);
            } else {
                throw new Error(data.error || 'Error desconocido al obtener los datos');
            }
        } catch (error) {
            console.error('Error detallado al cargar Informe de Compras:', error);
            Swal.fire('Error', `Hubo un error al cargar los datos: ${error.message}. Por favor, contacta al soporte técnico.`, 'error');
        }
    }

    function mostrarInformeCompras(compras, tipoInforme) {
        if (!elements.tableHeadCompras || !elements.tableBodyCompras) {
            console.error('Tabla de Informe de Compras no encontrada');
            return;
        }
        
        elements.tableHeadCompras.innerHTML = '';
        elements.tableBodyCompras.innerHTML = '';
        
        if (compras.length === 0) {
            elements.tableBodyCompras.innerHTML = '<tr><td colspan="15">No se encontraron datos para el rango de fechas seleccionado.</td></tr>';
            return;
        }
    
        // Crear encabezados
        const headerRow = document.createElement('tr');
        Object.keys(compras[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        elements.tableHeadCompras.appendChild(headerRow);
        
        // Crear filas de datos
        compras.forEach(compra => {
            const row = document.createElement('tr');
            Object.values(compra).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value !== null ? value : '';
                row.appendChild(td);
            });
            elements.tableBodyCompras.appendChild(row);
        });
        
        // Agregar fila de totales
        const totalRow = document.createElement('tr');
        totalRow.classList.add('table-info');
        const totalLabel = document.createElement('td');
        totalLabel.colSpan = Object.keys(compras[0]).length - 1;
        totalLabel.textContent = 'Total';
        totalLabel.style.fontWeight = 'bold';
        totalRow.appendChild(totalLabel);
        
        const totalValue = document.createElement('td');
        let total;
        if (tipoInforme === 'porProducto') {
            total = compras.reduce((sum, item) => sum + (parseFloat(item.ValorTotal) || 0), 0);
        } else {
            total = compras.reduce((sum, item) => sum + (parseFloat(item.Total) || 0), 0);
        }
        totalValue.textContent = total.toFixed(2);
        totalValue.style.fontWeight = 'bold';
        totalRow.appendChild(totalValue);
        
        elements.tableBodyCompras.appendChild(totalRow);
    }

    async function exportarComprasExcel() {
        const fechaInicio = elements.fechaInicioCompras.value;
        const fechaFin = elements.fechaFinCompras.value;
        const tipoInforme = document.querySelector('input[name="tipoInformeCompras"]:checked').value;
    
        if (!fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de exportar a Excel.', 'error');
            return;
        }
    
        const url = `${API_BASE_URL}/api/exportar_informe_compras_excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&tipo=${tipoInforme}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = 'Informe_Compras.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error detallado al exportar a Excel:', error);
            Swal.fire('Error', `Hubo un problema al exportar a Excel: ${error.message}. Por favor, contacta al soporte técnico.`, 'error');
        }
    }

    function verReporteCompras() {
        console.log('Función verReporteCompras() iniciada');
        Swal.fire('Información', 'Funcionalidad de ver reporte aún no implementada', 'info');
    }

    // Event Listeners
    if (elements.informesList) {
        elements.informesList.addEventListener('click', function(event) {
            const subMenuItem = event.target.closest('.sub-menu li');
            if (subMenuItem && subMenuItem.textContent.trim() === 'Informe de Compras') {
                cargarPanelInformeCompras();
            }
        });
    }

    if (elements.formCompras) {
        elements.formCompras.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarCompras();
        });
    }

    elements.btnBuscarCompras?.addEventListener('click', buscarCompras);
    elements.btnExportarExcelCompras?.addEventListener('click', exportarComprasExcel);
    elements.btnVerReporteCompras?.addEventListener('click', verReporteCompras);
    elements.btnSalirCompras?.addEventListener('click', cerrarPanelInformeCompras);

    // Función para manejar cambios en el tipo de informe
    function actualizarInterfazSegunTipoInforme() {
        const tipoInforme = document.querySelector('input[name="tipoInformeCompras"]:checked').value;
        // Aquí puedes agregar lógica para mostrar u ocultar elementos según el tipo de informe seleccionado
        console.log(`Tipo de informe seleccionado: ${tipoInforme}`);
    }

    // Agregar event listeners a los radio buttons de tipo de informe
    document.querySelectorAll('input[name="tipoInformeCompras"]').forEach(radio => {
        radio.addEventListener('change', actualizarInterfazSegunTipoInforme);
    });

    console.log('Configuración de eventos completada para Informe de Compras');
});
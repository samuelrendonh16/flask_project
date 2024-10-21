document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded for Compras x Costos');

    const API_BASE_URL = 'https://migsistemasweb.com';
    
    // Elementos del DOM
    const elements = {
        btnInformes: document.getElementById('btnInformes'),
        informesPanel: document.getElementById('informesPanel'),
        btnCerrarInformes: document.querySelector('#informesPanel .btn-close'),
        informesList: document.getElementById('informesList'),
        informesComprasCostosPanel: document.getElementById('informesComprasCostosPanel'),
        tableBodyComprasCostos: document.querySelector('#comprasCostosTable tbody'),
        formComprasCostos: document.getElementById('comprasCostosForm'),
        fechaInicioComprasCostos: document.getElementById('fechaInicioComprasCostos'),
        fechaFinComprasCostos: document.getElementById('fechaFinComprasCostos'),
        btnBuscarComprasCostos: document.getElementById('btnBuscarComprasCostos'),
        btnExportarExcelComprasCostos: document.getElementById('btnExportarExcelComprasCostos'),
        btnVerReporteComprasCostos: document.getElementById('btnVerReporteComprasCostos'),
        btnEnviarCorreoComprasCostos: document.getElementById('btnEnviarCorreoComprasCostos'),
        btnSalirComprasCostos: document.getElementById('btnSalirComprasCostos')
    };

    // Funciones auxiliares
    const showElement = (element) => { if (element) element.style.display = 'block'; };
    const hideElement = (element) => { if (element) element.style.display = 'none'; };
    const formatDate = (date) => date.toISOString().split('T')[0];

    function cargarPanelComprasCostosInformes() {
        console.log('Cargando panel de Compras x Costos');
        if (elements.informesComprasCostosPanel) {
            showElement(elements.informesComprasCostosPanel);
            console.log('Panel de Compras x Costos mostrado');
        } else {
            console.error('Panel de Compras x Costos no encontrado');
        }
        if (elements.informesPanel) hideElement(elements.informesPanel);
        limpiarFormularioComprasCostos();
    }

    function cerrarPanelComprasCostosInformes() {
        console.log('Cerrando panel de Compras x Costos');
        if (elements.informesComprasCostosPanel) hideElement(elements.informesComprasCostosPanel);
        if (elements.informesPanel) showElement(elements.informesPanel);
        limpiarFormularioComprasCostos();
    }

    function limpiarFormularioComprasCostos() {
        if (elements.fechaInicioComprasCostos) elements.fechaInicioComprasCostos.value = '';
        if (elements.fechaFinComprasCostos) elements.fechaFinComprasCostos.value = '';
        if (elements.tableBodyComprasCostos) elements.tableBodyComprasCostos.innerHTML = '';
        
        // Limpiar cualquier mensaje de error o éxito que pueda estar visible
        const mensajeElement = document.getElementById('mensajeComprasCostos');
        if (mensajeElement) mensajeElement.innerHTML = '';

        // Resetear cualquier otro elemento del formulario si existe
        if (elements.formComprasCostos) elements.formComprasCostos.reset();

        console.log('Formulario de Compras x Costos reiniciado');
    }

    async function buscarComprasCostos() {
        console.log('Función buscarComprasCostos() iniciada');
        const fechaInicio = elements.fechaInicioComprasCostos.value;
        const fechaFin = elements.fechaFinComprasCostos.value;
        
        if (!fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de buscar.', 'error');
            return;
        }

        const url = `${API_BASE_URL}/api/compras_costos_informes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
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
            console.log('Datos de Compras x Costos recibidos:', data);

            if (data.success) {
                mostrarComprasCostosInformes(data.compras);
            } else {
                throw new Error(data.message || 'Error desconocido al obtener los datos');
            }
        } catch (error) {
            console.error('Error detallado al cargar Compras x Costos:', error);
            Swal.fire('Error', `Hubo un error al cargar los datos: ${error.message}. Por favor, contacta al soporte técnico.`, 'error');
        }
    }

    function mostrarComprasCostosInformes(compras) {
        if (!elements.tableBodyComprasCostos) {
            console.error('Tabla de Compras x Costos no encontrada');
            return;
        }
        
        elements.tableBodyComprasCostos.innerHTML = '';
        
        if (compras.length === 0) {
            elements.tableBodyComprasCostos.innerHTML = '<tr><td colspan="15">No se encontraron datos para el rango de fechas seleccionado.</td></tr>';
            return;
        }
    
        const rows = compras.map(compra => `
            <tr>
                <td>${compra.CentroDeCostos || ''}</td>
                <td>${compra.Nit || ''}</td>
                <td>${compra.RazonSocial || ''}</td>
                <td>${compra.Compra || ''}</td>
                <td>${compra.FraProveedor || ''}</td>
                <td>${compra.Fecha || ''}</td>
                <td>${compra.Codigo || ''}</td>
                <td>${compra.Producto || ''}</td>
                <td>${(compra.Cantidad || 0).toFixed(2)}</td>
                <td>${(compra.Valor || 0).toFixed(2)}</td>
                <td>${(compra.ValorSinIVA || 0).toFixed(2)}</td>
                <td>${(compra.PorcentajeIVA || 0).toFixed(2)}</td>
                <td>${(compra.PorcentajeDescuento || 0).toFixed(2)}</td>
                <td>${(compra.Subtotal || 0).toFixed(2)}</td>
                <td>${(compra.Total || 0).toFixed(2)}</td>
            </tr>
        `).join('');

        elements.tableBodyComprasCostos.innerHTML = rows;
    
        // Calcular y agregar fila de totales
        const totales = compras.reduce((acc, compra) => ({
            Cantidad: acc.Cantidad + (compra.Cantidad || 0),
            Valor: acc.Valor + (compra.Valor || 0),
            ValorSinIVA: acc.ValorSinIVA + (compra.ValorSinIVA || 0),
            Subtotal: acc.Subtotal + (compra.Subtotal || 0),
            Total: acc.Total + (compra.Total || 0)
        }), { Cantidad: 0, Valor: 0, ValorSinIVA: 0, Subtotal: 0, Total: 0 });
    
        const totalRow = `
            <tr class="table-info">
                <td colspan="8"><strong>Total</strong></td>
                <td><strong>${totales.Cantidad.toFixed(2)}</strong></td>
                <td><strong>${totales.Valor.toFixed(2)}</strong></td>
                <td><strong>${totales.ValorSinIVA.toFixed(2)}</strong></td>
                <td></td>
                <td></td>
                <td><strong>${totales.Subtotal.toFixed(2)}</strong></td>
                <td><strong>${totales.Total.toFixed(2)}</strong></td>
            </tr>
        `;
        elements.tableBodyComprasCostos.innerHTML += totalRow;
    }

    async function exportarComprasCostosExcel() {
        const fechaInicio = elements.fechaInicioComprasCostos.value;
        const fechaFin = elements.fechaFinComprasCostos.value;
    
        if (!fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, seleccione ambas fechas antes de exportar a Excel.', 'error');
            return;
        }
    
        const excelUrl = `${API_BASE_URL}/api/exportar_compras_costos_excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        
        try {
            const response = await fetch(excelUrl, {
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
            a.download = 'Compras_x_Costos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error detallado al exportar a Excel:', error);
            Swal.fire('Error', `Hubo un problema al exportar a Excel: ${error.message}. Por favor, contacta al soporte técnico.`, 'error');
        }
    }

    function verReporteComprasCostos() {
        console.log('Función verReporteComprasCostos() iniciada');
        Swal.fire('Información', 'Funcionalidad de ver reporte aún no implementada', 'info');
    }

    function enviarCorreoComprasCostos() {
        console.log('Función enviarCorreoComprasCostos() iniciada');
        Swal.fire('Información', 'Funcionalidad de enviar correo aún no implementada', 'info');
    }

    // Event Listeners
    if (elements.informesList) {
        elements.informesList.addEventListener('click', function(event) {
            const subMenuItem = event.target.closest('.sub-menu li');
            if (subMenuItem && subMenuItem.textContent.trim() === 'Compras x Costos') {
                cargarPanelComprasCostosInformes();
            }
        });
    }

    if (elements.formComprasCostos) {
        elements.formComprasCostos.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarComprasCostos();
        });
    }

    elements.btnBuscarComprasCostos?.addEventListener('click', buscarComprasCostos);
    elements.btnExportarExcelComprasCostos?.addEventListener('click', exportarComprasCostosExcel);
    elements.btnVerReporteComprasCostos?.addEventListener('click', verReporteComprasCostos);
    elements.btnEnviarCorreoComprasCostos?.addEventListener('click', enviarCorreoComprasCostos);
    elements.btnSalirComprasCostos?.addEventListener('click', cerrarPanelComprasCostosInformes);

    console.log('Configuración de eventos completada para Compras x Costos');
});
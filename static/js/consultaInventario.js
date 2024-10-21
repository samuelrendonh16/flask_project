// consultaInventario.js

// Variables globales
let inventarioData = [];
const consultaInventarioPanel = document.getElementById('consultaInventarioPanel');

document.addEventListener('DOMContentLoaded', function() {
    const inventarioLista = document.getElementById('inventarioLista');
    inventarioLista.addEventListener('click', handleInventarioListaClick);

    // Agregar evento de clic al encabezado de Bodega una sola vez
    const bodegaHeader = document.querySelector('#inventarioTable th:nth-child(8)');
    if (bodegaHeader) {
        bodegaHeader.addEventListener('click', abrirFiltroBodegas);
    }

    // Event listeners para los filtros
    document.querySelectorAll('input[name="filter"]').forEach(radio => {
        radio.addEventListener('change', aplicarFiltros);
    });

    document.getElementById('filtroInventario').addEventListener('input', aplicarFiltros);
});

function handleInventarioListaClick(e) {
    const targetElement = e.target.closest('li');
    if (!targetElement) return;

    const text = targetElement.textContent.trim();
    console.log("Texto del elemento clickeado:", text);
    
    if (text === "Consulta Inventario") {
        ocultarTodosPaneles();
        consultaInventarioPanel.style.display = 'block';
        cargarConsultaInventario();
    } else {
        console.log(`Opción no implementada: ${text}`);
    }
}

function cargarConsultaInventario() {
    console.log("Cargando Consulta de Inventario");
    consultaInventarioPanel.style.display = 'block';
    fetch('https://migsistemasweb.com/api/consulta_inventario')
        .then(response => response.json())
        .then(data => {
            inventarioData = data;
            aplicarFiltros();
        })
        .catch(error => console.error('Error:', error));
}

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

function abrirFiltroBodegas() {
    const bodegas = [...new Set(inventarioData.map(item => item.Bodega))];
    
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
            <button id="aplicarFiltroBodegas">Aplicar</button>
            <button id="cerrarModalBodegas">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('aplicarFiltroBodegas').addEventListener('click', () => {
        aplicarFiltroBodegas();
        modal.remove();
    });
    document.getElementById('cerrarModalBodegas').addEventListener('click', () => modal.remove());
}

function aplicarFiltroBodegas() {
    const bodegasSeleccionadas = Array.from(document.querySelectorAll('.modal input:checked')).map(input => input.value);
    aplicarFiltros(bodegasSeleccionadas);
}

function aplicarFiltros(bodegasSeleccionadas = []) {
    let datosFiltrados = inventarioData;

    const filtroTipo = document.querySelector('input[name="filter"]:checked').value;
    if (filtroTipo === 'conSaldo') {
        datosFiltrados = datosFiltrados.filter(item => parseFloat(item.Saldo) > 0);
    } else if (filtroTipo === 'servicio') {
        datosFiltrados = datosFiltrados.filter(item => item.EsServicio);
    }

    const busqueda = document.getElementById('filtroInventario').value.toLowerCase();
    if (busqueda) {
        datosFiltrados = datosFiltrados.filter(item => 
            item.IDReferencia.toLowerCase().includes(busqueda) ||
            item.Referencia.toLowerCase().includes(busqueda)
        );
    }

    if (bodegasSeleccionadas.length > 0) {
        datosFiltrados = datosFiltrados.filter(item => bodegasSeleccionadas.includes(item.Bodega));
    }

    mostrarDatosInventario(datosFiltrados);
}

document.querySelector('#consultaInventarioPanel .btn-close').addEventListener('click', function() {
    consultaInventarioPanel.style.display = 'none';
});

// Funciones auxiliares que debes implementar
function ocultarTodosPaneles() {
    // Implementa esta función para ocultar todos los paneles
}

function ajustarScrollbar() {
    // Implementa esta función para ajustar la scrollbar si es necesario
}
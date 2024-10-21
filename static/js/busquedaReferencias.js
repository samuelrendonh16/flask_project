// busquedaReferencias.js

let referenciaSeleccionada = null;

function abrirModalBusquedaReferencias() {
    const modal = document.getElementById('busquedaReferenciasModal');
    modal.style.display = 'block';
    cargarReferencias();

    // Enfoca el campo de búsqueda al abrir el modal
    document.getElementById('buscarReferencia').focus();
}

function cerrarModalBusquedaReferencias() {
    const modal = document.getElementById('busquedaReferenciasModal');
    modal.style.display = 'none';
}

function cargarReferencias(filtro = '') {
    const idBodega = document.getElementById('bodegaSalida').value;
    console.log(`Cargando referencias para bodega ${idBodega} con filtro "${filtro}"`);
    fetch(`https://migsistemasweb.com/api/referencias?filtro=${encodeURIComponent(filtro)}&idBodega=${idBodega}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Referencias cargadas:", data);
            if (Array.isArray(data)) {
                mostrarReferencias(data);
            } else {
                console.error('Datos recibidos no son un array:', data);
                Swal.fire('Error', 'Los datos recibidos no tienen el formato esperado', 'error');
            }
        })
        .catch(error => {
            console.error('Error al cargar referencias:', error);
            Swal.fire('Error', `Hubo un error al cargar los datos: ${error.message}`, 'error');
        });
}

function mostrarReferencias(referencias) {
    const tabla = document.querySelector('#referenciasTable tbody');
    tabla.innerHTML = '';
    referencias.forEach(ref => {
        let row = tabla.insertRow();
        row.innerHTML = `
            <td>${ref.IdReferencia}</td>
            <td>${ref.Referencia}</td>
            <td>${ref.PrecioVenta1}</td>
            <td>${ref.IVA}</td>
            <td>${ref.Ubicacion || ''}</td>
            <td>${ref.idbodega || ''}</td>
            <td>${ref.IdUnidad}</td>
        `;
        row.addEventListener('click', () => seleccionarReferencia(ref, row));
    });
}

function seleccionarReferencia(referencia, row) {
    referenciaSeleccionada = referencia;
    console.log("Referencia seleccionada:", referenciaSeleccionada);
    
    // Remover la clase 'selected' de todas las filas
    document.querySelectorAll('#referenciasTable tbody tr').forEach(tr => tr.classList.remove('selected'));
    // Añadir la clase 'selected' a la fila seleccionada
    row.classList.add('selected');
}

function confirmarSeleccion() {
    if (referenciaSeleccionada) {
        console.log("Confirmando selección:", referenciaSeleccionada);
        cerrarModalBusquedaReferencias();
        agregarProductoATablaTraslados(referenciaSeleccionada);
    } else {
        Swal.fire("Por favor, seleccione una referencia primero.");
    }
}

function mostrarHojaVida() {
    if (referenciaSeleccionada) {
        console.log("Mostrando hoja de vida de:", referenciaSeleccionada.IdReferencia);
        // Implementa la lógica para mostrar la hoja de vida
        // Esto podría ser abrir otro modal o navegar a otra página
    } else {
        Swal.fire("Por favor, seleccione una referencia primero.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buscarBtn = document.getElementById('btnBuscarReferencia');
    const confirmarBtn = document.getElementById('btnConfirmarReferencia');
    const hojaVidaBtn = document.getElementById('btnHojaVidaReferencia');
    const salirBtn = document.getElementById('btnSalirBusquedaReferencia');
    const filtroInput = document.getElementById('buscarReferencia');
    const closeBtn = document.querySelector('#busquedaReferenciasModal .close');

    buscarBtn.addEventListener('click', () => cargarReferencias(filtroInput.value));
    confirmarBtn.addEventListener('click', confirmarSeleccion);
    hojaVidaBtn.addEventListener('click', mostrarHojaVida);
    salirBtn.addEventListener('click', cerrarModalBusquedaReferencias);
    closeBtn.addEventListener('click', cerrarModalBusquedaReferencias);

    filtroInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            cargarReferencias(filtroInput.value);
        }
    });

    // Event listeners para los filtros
    document.querySelectorAll('input[name="filter"], #servicioFilter').forEach(input => {
        input.addEventListener('change', () => cargarReferencias(filtroInput.value));
    });
});

// Función para ser llamada desde tu archivo principal de JS
window.abrirModalBusquedaReferencias = abrirModalBusquedaReferencias;
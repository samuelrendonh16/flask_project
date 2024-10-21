// Función para guardar o actualizar un grupo
export function guardarGrupo(grupoData) {
    const url = 'https://migsistemasweb.com/api/grupos';
    const method = 'POST';

    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(grupoData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta exitosa:', data);
        return data;
    })
    .catch(error => {
        console.error('Error detallado:', error);
        throw error;
    });
}

// Función para cargar grupos
export function cargarGrupos() {
    return fetch('https://migsistemasweb.com/api/grupos')
        .then(response => response.json())
        .then(grupos => {
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
        })
        .catch(error => {
            console.error('Error al cargar grupos:', error);
            mostrarMensaje('Error al cargar los grupos', 'error');
        });
}

// Función para limpiar el formulario
export function limpiarFormularioGrupo() {
    document.getElementById('codigoGrupo').value = '';
    document.getElementById('descripcionGrupo').value = '';
    document.getElementById('estadoGrupo').checked = false;
    document.getElementById('ventaGrupo').checked = false;
}

// Función para habilitar/deshabilitar campos del formulario
export function habilitarCamposGrupo(habilitar) {
    document.getElementById('codigoGrupo').disabled = !habilitar;
    document.getElementById('descripcionGrupo').disabled = !habilitar;
    document.getElementById('estadoGrupo').disabled = !habilitar;
    document.getElementById('ventaGrupo').disabled = !habilitar;
}

// Función para mostrar mensajes
export function mostrarMensaje(mensaje, tipo) {
    Swal.fire({
        icon: tipo,
        title: tipo === 'error' ? 'Error' : 'Éxito',
        text: mensaje
    });
}

// Función para agregar event listeners a las filas de la tabla
function agregarEventListenersFilas() {
    const filas = document.querySelectorAll('#gruposTable tbody tr');
    filas.forEach(fila => {
        fila.addEventListener('click', function() {
            seleccionarGrupo(this);
        });
    });
}

// Función para seleccionar un grupo
function seleccionarGrupo(fila) {
    document.querySelectorAll('#gruposTable tbody tr').forEach(f => {
        f.classList.remove('selected');
    });
    
    fila.classList.add('selected');
    
    const grupoId = fila.getAttribute('data-id');
    document.getElementById('codigoGrupo').value = fila.cells[0].textContent;
    document.getElementById('descripcionGrupo').value = fila.cells[1].textContent;
    document.getElementById('estadoGrupo').checked = fila.cells[2].textContent === 'Activo';
    document.getElementById('ventaGrupo').checked = fila.cells[3].textContent === 'Sí';
    
    habilitarCamposGrupo(false);
    document.getElementById('btnEditarGrupo').disabled = false;
    document.getElementById('btnEliminarGrupo').disabled = false;
}
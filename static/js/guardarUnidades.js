document.addEventListener('DOMContentLoaded', function() {
    const btnUnidades = document.getElementById('btnUnidades');
    let unidadesModal;

    btnUnidades.addEventListener('click', abrirModalUnidades);

    function abrirModalUnidades() {
        if (!unidadesModal) {
            crearModalUnidades();
        }
        unidadesModal.style.display = 'block';
        cargarUnidades();
    }

    function crearModalUnidades() {
        unidadesModal = document.createElement('div');
        unidadesModal.className = 'modal';
        unidadesModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Maestro Unidades</h2>
                    <div class="button-container">
                        <button id="btnNuevoUnidad">Nuevo</button>
                        <button id="btnGuardarUnidad">Guardar</button>
                        <button id="btnEditarUnidad">Editar</button>
                        <button id="btnCancelarUnidad">Cancelar</button>
                        <button id="btnCerrarUnidades">Cerrar</button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="unidadForm">
                        <input type="text" id="codigoUnidad" placeholder="Código">
                        <input type="text" id="descripcionUnidad" placeholder="Descripción">
                        <label><input type="checkbox" id="estadoUnidad"> Estado</label>
                    </form>
                    <table id="unidadesTable">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(unidadesModal);

        document.getElementById('btnNuevoUnidad').addEventListener('click', nuevaUnidad);
        document.getElementById('btnGuardarUnidad').addEventListener('click', guardarUnidad);
        document.getElementById('btnEditarUnidad').addEventListener('click', editarUnidad);
        document.getElementById('btnCancelarUnidad').addEventListener('click', cancelarEdicion);
        document.getElementById('btnCerrarUnidades').addEventListener('click', () => unidadesModal.style.display = 'none');
    }

    function cargarUnidades() {
        fetch('https://migsistemasweb.com/api/unidades')
            .then(response => response.json())
            .then(unidades => {
                const tbody = document.querySelector('#unidadesTable tbody');
                tbody.innerHTML = '';
                unidades.forEach(unidad => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${unidad.IdUnidad || ''}</td>
                        <td>${unidad.Unidad || ''}</td>
                        <td>
                            <input type="checkbox" ${unidad.Estado ? 'checked' : ''} disabled>
                            ${unidad.Estado ? 'Activo' : 'Desactivado'}
                        </td>
                    `;
                    tr.addEventListener('click', () => seleccionarUnidad(unidad));
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Error al cargar unidades:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las unidades'
                });
            });
    }
    
    function seleccionarUnidad(unidad) {
        document.getElementById('codigoUnidad').value = unidad.IdUnidad;
        document.getElementById('descripcionUnidad').value = unidad.Unidad;
        document.getElementById('estadoUnidad').checked = unidad.Estado;
        habilitarFormulario(false);
        document.getElementById('btnEditarUnidad').disabled = false;
    }

    function editarUnidad() {
        habilitarFormulario(true);
        document.getElementById('codigoUnidad').disabled = true; // El código no debe cambiar
        document.getElementById('btnGuardarUnidad').disabled = false;
    }

    function nuevaUnidad() {
        limpiarFormularioUnidad();
        habilitarFormulario(true);
        document.getElementById('codigoUnidad').disabled = false;
        document.getElementById('btnGuardarUnidad').disabled = false;
        document.getElementById('btnEditarUnidad').disabled = true;
    }

    function guardarUnidad() {
        const unidad = {
            IdUnidad: document.getElementById('codigoUnidad').value,
            Unidad: document.getElementById('descripcionUnidad').value,
            Estado: document.getElementById('estadoUnidad').checked
        };
    
        if (!unidad.IdUnidad || !unidad.Unidad) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, complete todos los campos'
            });
            return;
        }
    
        const method = document.getElementById('codigoUnidad').disabled ? 'PUT' : 'POST';
        const url = `https://migsistemasweb.com/api/unidades${method === 'PUT' ? '/' + unidad.IdUnidad : ''}`;
    
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unidad)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar la unidad');
            }
            return response.json();
        })
        .then(data => {
            console.log('Unidad guardada:', data);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Unidad guardada correctamente'
            });
            cargarUnidades();
            limpiarFormularioUnidad();
            habilitarFormulario(false);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la unidad'
            });
        });
    }

    function editarUnidad() {
        habilitarFormulario(true);
    }

    function cancelarEdicion() {
        document.getElementById('unidadForm').reset();
        habilitarFormulario(false);
    }

    function habilitarFormulario(habilitar) {
        document.getElementById('codigoUnidad').disabled = !habilitar;
        document.getElementById('descripcionUnidad').disabled = !habilitar;
        document.getElementById('estadoUnidad').disabled = !habilitar;
    }

    function guardarUnidad() {
        const unidad = {
            IdUnidad: document.getElementById('codigoUnidad').value,
            Unidad: document.getElementById('descripcionUnidad').value,
            Estado: document.getElementById('estadoUnidad').checked
        };
    
        fetch('https://migsistemasweb.com/api/unidades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unidad)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar la unidad');
            }
            return response.json();
        })
        .then(data => {
            console.log('Unidad guardada:', data);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Unidad guardada correctamente'
            });
            cargarUnidades(); // Recargar la lista de unidades
            limpiarFormularioUnidad();
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la unidad'
            });
        });
    }
    
    function limpiarFormularioUnidad() {
        document.getElementById('codigoUnidad').value = '';
        document.getElementById('descripcionUnidad').value = '';
        document.getElementById('estadoUnidad').checked = true;
    }
});
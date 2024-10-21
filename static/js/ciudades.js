// ciudades.js

document.addEventListener('DOMContentLoaded', function() {
    const btnCiudades = document.getElementById('btnCiudades');
    const API_BASE_URL = 'https://migsistemasweb.com';
    let ciudadesModal;

    btnCiudades.addEventListener('click', abrirModalCiudades);

    function abrirModalCiudades() {
        console.log("Abriendo panel de ciudades");
        if (!ciudadesModal) {
            crearModalCiudades();
        }
        ciudadesModal.style.display = 'block';
        cargarPaisesCiudad();
        cargarCiudadesTodas();
    }

    function crearModalCiudades() {
        ciudadesModal = document.createElement('div');
        ciudadesModal.className = 'modal';
        ciudadesModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Maestro de Ciudades</h2>
                    <div class="button-container">
                        <button id="btnNuevoCiudad">Nuevo</button>
                        <button id="btnGuardarCiudad">Guardar</button>
                        <button id="btnEditarCiudad">Editar</button>
                        <button id="btnEliminarCiudad">Eliminar</button>
                        <button id="btnCancelarCiudad">Cancelar</button>
                        <button id="btnCerrarCiudades">Cerrar</button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="ciudadForm">
                        <div class="form-group">
                            <label for="codigoCiudad">* Código:</label>
                            <input type="text" id="codigoCiudad" required>
                        </div>
                        <div class="form-group">
                            <label for="descripcionCiudad">* Descripción:</label>
                            <input type="text" id="descripcionCiudad" required>
                        </div>
                        <div class="form-group">
                            <label for="paisCiudad">* País:</label>
                            <select id="paisCiudad" required>
                                <option value="">Seleccione el País</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="departamentoCiudad">* Departamento:</label>
                            <select id="departamentoCiudad" required>
                                <option value="">Seleccione el Departamento</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="icaCiudad">% ICA:</label>
                            <input type="number" id="icaCiudad" step="0.001">
                        </div>
                        <div class="form-group">
                            <label for="estadoCiudad">Estado:</label>
                            <input type="checkbox" id="estadoCiudad" checked>
                        </div>
                    </form>
                    <table id="ciudadesTable">
                        <thead>
                            <tr>
                                <th>Id Ciudad</th>
                                <th>Ciudad</th>
                                <th>Id Departamento</th>
                                <th>porcreteica</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(ciudadesModal);

        document.getElementById('btnNuevoCiudad').addEventListener('click', nuevoCiudad);
        document.getElementById('btnGuardarCiudad').addEventListener('click', guardarCiudad);
        document.getElementById('btnEditarCiudad').addEventListener('click', editarCiudad);
        document.getElementById('btnEliminarCiudad').addEventListener('click', eliminarCiudad);
        document.getElementById('btnCancelarCiudad').addEventListener('click', cancelarEdicion);
        document.getElementById('btnCerrarCiudades').addEventListener('click', () => ciudadesModal.style.display = 'none');

        document.getElementById('paisCiudad').addEventListener('change', cargarDepartamentosCiudad);
    }

    function cargarPaisesCiudad() {
        fetch(`${API_BASE_URL}/api/paises`)
            .then(response => response.json())
            .then(paises => {
                const select = document.getElementById('paisCiudad');
                select.innerHTML = '<option value="">Seleccione el País</option>';
                paises.forEach(pais => {
                    const option = document.createElement('option');
                    option.value = pais.IdPais;
                    option.textContent = pais.Pais;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar países:', error));
    }

    function cargarDepartamentosCiudad() {
        const idPais = document.getElementById('paisCiudad').value;
        if (!idPais) return;

        fetch(`${API_BASE_URL}/api/departamentos/${idPais}`)
            .then(response => response.json())
            .then(departamentos => {
                const select = document.getElementById('departamentoCiudad');
                select.innerHTML = '<option value="">Seleccione el Departamento</option>';
                departamentos.forEach(depto => {
                    const option = document.createElement('option');
                    option.value = depto.IdDepartamento;
                    option.textContent = depto.Departamento;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar departamentos:', error));
    }

    function cargarCiudadesTodas() {
        fetch(`${API_BASE_URL}/api/todas_ciudades`)
            .then(response => response.json())
            .then(ciudades => {
                const tbody = document.querySelector('#ciudadesTable tbody');
                tbody.innerHTML = '';
                ciudades.forEach(ciudad => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${ciudad.IdCiudad}</td>
                        <td>${ciudad.Ciudad}</td>
                        <td>${ciudad.IdDepartamento}</td>
                        <td>${ciudad.porcreteica || ''}</td>
                        <td>
                            <input type="checkbox" ${ciudad.Estado ? 'checked' : ''} disabled>
                            ${ciudad.Estado ? 'Activo' : 'Inactivo'}
                        </td>
                    `;
                    tr.addEventListener('click', () => seleccionarCiudadTodas(ciudad));
                    tbody.appendChild(tr);
                });
            })
            .catch(error => console.error('Error al cargar ciudades:', error));
    }

    function seleccionarCiudadTodas(ciudad) {
        document.getElementById('codigoCiudad').value = ciudad.IdCiudad;
        document.getElementById('descripcionCiudad').value = ciudad.Ciudad;
        document.getElementById('paisCiudad').value = ciudad.idpais;
        document.getElementById('departamentoCiudad').value = ciudad.IdDepartamento;
        document.getElementById('icaCiudad').value = ciudad.porcreteica || '';
        document.getElementById('estadoCiudad').checked = ciudad.Estado;
        habilitarFormulario(false);
        document.getElementById('btnEditarCiudad').disabled = false;
        document.getElementById('btnEliminarCiudad').disabled = false;
    }

    function nuevoCiudad() {
        limpiarFormularioCiudad();
        habilitarFormulario(true);
        document.getElementById('codigoCiudad').disabled = false;
        document.getElementById('btnGuardarCiudad').disabled = false;
        document.getElementById('btnEditarCiudad').disabled = true;
        document.getElementById('btnEliminarCiudad').disabled = true;
    }

    function editarCiudad() {
        habilitarFormulario(true);
        document.getElementById('codigoCiudad').disabled = true;
        document.getElementById('btnGuardarCiudad').disabled = false;
    }

    function eliminarCiudad() {
        const idCiudad = document.getElementById('codigoCiudad').value;
        if (!idCiudad) {
            Swal.fire('Por favor, seleccione una ciudad para eliminar');
            return;
        }

        if (confirm('¿Está seguro de que desea eliminar esta ciudad?')) {
            fetch(`${API_BASE_URL}/api/ciudades/${idCiudad}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Error al eliminar la ciudad');
                    return response.json();
                })
                .then(() => {
                    Swal.fire('Ciudad eliminada correctamente');
                    cargarCiudadesTodas();
                    limpiarFormularioCiudad();
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('No se pudo eliminar la ciudad');
                });
        }
    }

    function cancelarEdicion() {
        limpiarFormularioCiudad();
        habilitarFormulario(false);
    }

    function habilitarFormulario(habilitar) {
        document.getElementById('codigoCiudad').disabled = !habilitar;
        document.getElementById('descripcionCiudad').disabled = !habilitar;
        document.getElementById('paisCiudad').disabled = !habilitar;
        document.getElementById('departamentoCiudad').disabled = !habilitar;
        document.getElementById('icaCiudad').disabled = !habilitar;
        document.getElementById('estadoCiudad').disabled = !habilitar;
    }

    function guardarCiudad() {
        const ciudad = {
            IdCiudad: document.getElementById('codigoCiudad').value,
            Ciudad: document.getElementById('descripcionCiudad').value,
            IdDepartamento: document.getElementById('departamentoCiudad').value,
            idpais: document.getElementById('paisCiudad').value,
            porcreteica: document.getElementById('icaCiudad').value || null, // Cambia esto
            Estado: document.getElementById('estadoCiudad').checked
        };
    
        if (!ciudad.IdCiudad || !ciudad.Ciudad || !ciudad.IdDepartamento || !ciudad.idpais) {
            Swal.fire('Por favor, complete todos los campos obligatorios');
            return;
        }
    
        const method = document.getElementById('codigoCiudad').disabled ? 'PUT' : 'POST';
        const url = `${API_BASE_URL}/api/ciudades${method === 'PUT' ? '/' + ciudad.IdCiudad : ''}`;
    
        console.log('Enviando solicitud:', method, url, ciudad);
    
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ciudad)
        })
        .then(response => {
            console.log('Respuesta recibida:', response);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Error al guardar la ciudad: ${response.status} ${response.statusText}\n${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Ciudad guardada:', data);
            Swal.fire('Ciudad guardada correctamente');
            cargarCiudadesTodas();
            limpiarFormularioCiudad();
            habilitarFormulario(false);
        })
        .catch(error => {
            console.error('Error detallado:', error);
            Swal.fire('No se pudo guardar la ciudad', error.message, 'error');
        });
    }

    function limpiarFormularioCiudad() {
        document.getElementById('codigoCiudad').value = '';
        document.getElementById('descripcionCiudad').value = '';
        document.getElementById('paisCiudad').value = '';
        document.getElementById('departamentoCiudad').value = '';
        document.getElementById('icaCiudad').value = '';
        document.getElementById('estadoCiudad').checked = true;
    }
});
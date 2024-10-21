document.addEventListener('DOMContentLoaded', function() {
    const btnSubGrupos = document.getElementById('btnSubGrupos');
    let subgruposModal;

    btnSubGrupos.addEventListener('click', abrirModalSubgrupos);

    function abrirModalSubgrupos() {
        if (!subgruposModal) {
            crearModalSubgrupos();
        }
        subgruposModal.style.display = 'block';
        cargarGruposSubGrupos();
        cargarSubgrupos();
    }

    function crearModalSubgrupos() {
        subgruposModal = document.createElement('div');
        subgruposModal.className = 'modal';
        subgruposModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Maestro de Subgrupos</h2>
                    <div class="button-container">
                        <button id="btnNuevoSubgrupo">Nuevo</button>
                        <button id="btnGuardarSubgrupo">Guardar</button>
                        <button id="btnEditarSubgrupo">Editar</button>
                        <button id="btnCancelarSubgrupo">Cancelar</button>
                        <button id="btnCerrarSubgrupos">Cerrar</button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="subgrupoForm">
                        <div class="form-group">
                            <label for="codigoSubgrupo">* Código:</label>
                            <input type="text" id="codigoSubgrupo" required>
                        </div>
                        <div class="form-group">
                            <label for="descripcionSubgrupo">* Descripción:</label>
                            <input type="text" id="descripcionSubgrupo" required>
                        </div>
                        <div class="form-group">
                            <label for="grupoSubgrupo">* Grupo:</label>
                            <select id="grupoSubgrupo" required>
                                <option value="">Seleccione el Grupo</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="estadoSubgrupo">Estado:</label>
                            <input type="checkbox" id="estadoSubgrupo" checked>
                        </div>
                    </form>
                    <table id="subgruposTable">
                        <thead>
                            <tr>
                                <th>Id Subgrupo</th>
                                <th>Subgrupo</th>
                                <th>Id Grupo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(subgruposModal);

        document.getElementById('btnNuevoSubgrupo').addEventListener('click', nuevoSubgrupo);
        document.getElementById('btnGuardarSubgrupo').addEventListener('click', guardarSubgrupo);
        document.getElementById('btnEditarSubgrupo').addEventListener('click', editarSubgrupo);
        document.getElementById('btnCancelarSubgrupo').addEventListener('click', cancelarEdicion);
        document.getElementById('btnCerrarSubgrupos').addEventListener('click', () => subgruposModal.style.display = 'none');
    }

    function cargarGruposSubGrupos() {
        console.log('Iniciando carga de grupos para subgrupos');
        fetch('https://migsistemasweb.com/api/obtener_grupos_subgrupos')
            .then(response => {
                console.log('Respuesta recibida:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(grupos => {
                console.log('Grupos recibidos:', grupos);
                const select = document.getElementById('grupoSubgrupo');
                select.innerHTML = '<option value="">Seleccione el Grupo</option>';
                if (grupos.length === 0) {
                    console.log('No se encontraron grupos');
                    return;
                }
                grupos.forEach(grupo => {
                    console.log('Procesando grupo:', grupo);
                    const option = document.createElement('option');
                    option.value = grupo.codigo;
                    option.textContent = grupo.descripcion;
                    select.appendChild(option);
                });
                console.log('Grupos cargados exitosamente');
            })
            .catch(error => {
                console.error('Error al cargar grupos:', error);
                Swal.fire('Error al cargar los grupos. Por favor, intente de nuevo.');
            });
    }

    function cargarSubgrupos() {
        fetch('https://migsistemasweb.com/api/subgrupos')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(subgrupos => {
                console.log('Subgrupos recibidos:', subgrupos);
                const tbody = document.querySelector('#subgruposTable tbody');
                tbody.innerHTML = '';
                subgrupos.forEach(subgrupo => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${subgrupo.IdSubgrupo}</td>
                        <td>${subgrupo.Subgrupo}</td>
                        <td>${subgrupo.IdGrupo}</td>
                        <td>
                            <input type="checkbox" ${subgrupo.Estado ? 'checked' : ''} disabled>
                            ${subgrupo.Estado ? 'Activo' : 'Inactivo'}
                        </td>
                    `;
                    tr.addEventListener('click', () => seleccionarSubgrupo(subgrupo));
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Error al cargar subgrupos:', error);
                Swal.fire('Error al cargar los subgrupos. Por favor, intente de nuevo.');
            });
    }

    function seleccionarSubgrupo(subgrupo) {
        document.getElementById('codigoSubgrupo').value = subgrupo.IdSubgrupo;
        document.getElementById('descripcionSubgrupo').value = subgrupo.Subgrupo;
        document.getElementById('grupoSubgrupo').value = subgrupo.IdGrupo;
        document.getElementById('estadoSubgrupo').checked = subgrupo.Estado;
        habilitarFormulario(false);
        document.getElementById('btnEditarSubgrupo').disabled = false;
    }

    function nuevoSubgrupo() {
        limpiarFormularioSubgrupo();
        habilitarFormulario(true);
        document.getElementById('codigoSubgrupo').disabled = false;
        document.getElementById('btnGuardarSubgrupo').disabled = false;
        document.getElementById('btnEditarSubgrupo').disabled = true;
    }

    function editarSubgrupo() {
        habilitarFormulario(true);
        document.getElementById('codigoSubgrupo').disabled = true;
        document.getElementById('btnGuardarSubgrupo').disabled = false;
    }

    function cancelarEdicion() {
        limpiarFormularioSubgrupo();
        habilitarFormulario(false);
    }

    function habilitarFormulario(habilitar) {
        document.getElementById('codigoSubgrupo').disabled = !habilitar;
        document.getElementById('descripcionSubgrupo').disabled = !habilitar;
        document.getElementById('grupoSubgrupo').disabled = !habilitar;
        document.getElementById('estadoSubgrupo').disabled = !habilitar;
    }

    function guardarSubgrupo() {
        const subgrupo = {
            IdSubgrupo: document.getElementById('codigoSubgrupo').value,
            Subgrupo: document.getElementById('descripcionSubgrupo').value,
            IdGrupo: document.getElementById('grupoSubgrupo').value,
            Estado: document.getElementById('estadoSubgrupo').checked
        };

        if (!subgrupo.IdSubgrupo || !subgrupo.Subgrupo || !subgrupo.IdGrupo) {
            Swal.fire('Por favor, complete todos los campos');
            return;
        }

        const method = document.getElementById('codigoSubgrupo').disabled ? 'PUT' : 'POST';
        const url = `https://migsistemasweb.com/api/subgrupos${method === 'PUT' ? '/' + subgrupo.IdSubgrupo : ''}`;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subgrupo)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar el subgrupo');
            }
            return response.json();
        })
        .then(data => {
            console.log('Subgrupo guardado:', data);
            Swal.fire('Subgrupo guardado correctamente');
            cargarSubgrupos();
            limpiarFormularioSubgrupo();
            habilitarFormulario(false);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('No se pudo guardar el subgrupo');
        });
    }

    function limpiarFormularioSubgrupo() {
        document.getElementById('codigoSubgrupo').value = '';
        document.getElementById('descripcionSubgrupo').value = '';
        document.getElementById('grupoSubgrupo').value = '';
        document.getElementById('estadoSubgrupo').checked = true;
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const btnDepartamentos = document.getElementById('btnDepartamentos');
    const API_BASE_URL = 'https://migsistemasweb.com';
    let departamentosModal;

    btnDepartamentos.addEventListener('click', abrirModalDepartamentos);

    function abrirModalDepartamentos() {
        console.log("Abriendo panel de departamentos");
        if (!departamentosModal) {
            crearModalDepartamentos();
        }
        departamentosModal.style.display = 'block';
        cargarPaisesDepartamentos();
        cargarDepartamentos();
    }

    function crearModalDepartamentos() {
        departamentosModal = document.createElement('div');
        departamentosModal.className = 'modal';
        departamentosModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Maestro de Departamentos</h2>
                    <div class="button-container">
                        <button id="btnNuevoDepartamento">Nuevo</button>
                        <button id="btnGuardarDepartamento">Guardar</button>
                        <button id="btnEditarDepartamento">Editar</button>
                        <button id="btnEliminarDepartamento">Eliminar</button>
                        <button id="btnCancelarDepartamento">Cancelar</button>
                        <button id="btnCerrarDepartamentos">Cerrar</button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="departamentoForm">
                        <div class="form-group">
                            <label for="codigoDepartamento">* Código:</label>
                            <input type="text" id="codigoDepartamento" required>
                        </div>
                        <div class="form-group">
                            <label for="descripcionDepartamento">* Descripción:</label>
                            <input type="text" id="descripcionDepartamento" required>
                        </div>
                        <div class="form-group">
                            <label for="paisDepartamento">* País:</label>
                            <select id="paisDepartamento" required>
                                <option value="">Seleccione el País</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="estadoDepartamento">Estado:</label>
                            <input type="checkbox" id="estadoDepartamento" checked>
                        </div>
                    </form>
                    <table id="departamentosTable">
                        <thead>
                            <tr>
                                <th>Id Departamento</th>
                                <th>Departamento</th>
                                <th>Id País</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(departamentosModal);

        document.getElementById('btnNuevoDepartamento').addEventListener('click', nuevoDepartamento);
        document.getElementById('btnGuardarDepartamento').addEventListener('click', guardarDepartamento);
        document.getElementById('btnEditarDepartamento').addEventListener('click', editarDepartamento);
        document.getElementById('btnEliminarDepartamento').addEventListener('click', eliminarDepartamento);
        document.getElementById('btnCancelarDepartamento').addEventListener('click', cancelarEdicion);
        document.getElementById('btnCerrarDepartamentos').addEventListener('click', () => departamentosModal.style.display = 'none');
    }

    function cargarPaisesDepartamentos() {
        fetch(`${API_BASE_URL}/api/paises`)
            .then(response => response.json())
            .then(paises => {
                const select = document.getElementById('paisDepartamento');
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

    function cargarDepartamentos() {
        fetch(`${API_BASE_URL}/api/departamentos`)
            .then(response => response.json())
            .then(departamentos => {
                const tbody = document.querySelector('#departamentosTable tbody');
                tbody.innerHTML = '';
                departamentos.forEach(departamento => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${departamento.IdDepartamento}</td>
                        <td>${departamento.Departamento}</td>
                        <td>${departamento.IdPais}</td>
                        <td>
                            <input type="checkbox" ${departamento.Estado ? 'checked' : ''} disabled>
                            ${departamento.Estado ? 'Activo' : 'Inactivo'}
                        </td>
                    `;
                    tr.addEventListener('click', () => seleccionarDepartamento(departamento));
                    tbody.appendChild(tr);
                });
            })
            .catch(error => console.error('Error al cargar departamentos:', error));
    }

    function seleccionarDepartamento(departamento) {
        document.getElementById('codigoDepartamento').value = departamento.IdDepartamento;
        document.getElementById('descripcionDepartamento').value = departamento.Departamento;
        document.getElementById('paisDepartamento').value = departamento.IdPais;
        document.getElementById('estadoDepartamento').checked = departamento.Estado;
        habilitarFormulario(false);
        document.getElementById('btnEditarDepartamento').disabled = false;
        document.getElementById('btnEliminarDepartamento').disabled = false;
    }

    function nuevoDepartamento() {
        limpiarFormularioDepartamento();
        habilitarFormulario(true);
        document.getElementById('codigoDepartamento').disabled = false;
        document.getElementById('btnGuardarDepartamento').disabled = false;
        document.getElementById('btnEditarDepartamento').disabled = true;
        document.getElementById('btnEliminarDepartamento').disabled = true;
    }

    function editarDepartamento() {
        habilitarFormulario(true);
        document.getElementById('codigoDepartamento').disabled = true;
        document.getElementById('btnGuardarDepartamento').disabled = false;
    }

    function eliminarDepartamento() {
        const idDepartamento = document.getElementById('codigoDepartamento').value;
        if (!idDepartamento) {
            Swal.fire('Por favor, seleccione un departamento para eliminar');
            return;
        }

        if (confirm('¿Está seguro de que desea eliminar este departamento?')) {
            fetch(`${API_BASE_URL}/api/departamentos/${idDepartamento}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Error al eliminar el departamento');
                    return response.json();
                })
                .then(() => {
                    Swal.fire('Departamento eliminado correctamente');
                    cargarDepartamentos();
                    limpiarFormularioDepartamento();
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('No se pudo eliminar el departamento');
                });
        }
    }

    function cancelarEdicion() {
        limpiarFormularioDepartamento();
        habilitarFormulario(false);
    }

    function habilitarFormulario(habilitar) {
        document.getElementById('codigoDepartamento').disabled = !habilitar;
        document.getElementById('descripcionDepartamento').disabled = !habilitar;
        document.getElementById('paisDepartamento').disabled = !habilitar;
        document.getElementById('estadoDepartamento').disabled = !habilitar;
    }

    function guardarDepartamento() {
        const departamento = {
            IdDepartamento: document.getElementById('codigoDepartamento').value,
            Departamento: document.getElementById('descripcionDepartamento').value,
            IdPais: document.getElementById('paisDepartamento').value,
            Estado: document.getElementById('estadoDepartamento').checked
        };

        if (!departamento.IdDepartamento || !departamento.Departamento || !departamento.IdPais) {
            Swal.fire('Por favor, complete todos los campos obligatorios');
            return;
        }

        const method = document.getElementById('codigoDepartamento').disabled ? 'PUT' : 'POST';
        const url = `${API_BASE_URL}/api/departamentos${method === 'PUT' ? '/' + departamento.IdDepartamento : ''}`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(departamento)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al guardar el departamento');
            return response.json();
        })
        .then(data => {
            console.log('Departamento guardado:', data);
            Swal.fire('Departamento guardado correctamente');
            cargarDepartamentos();
            limpiarFormularioDepartamento();
            habilitarFormulario(false);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('No se pudo guardar el departamento');
        });
    }

    function limpiarFormularioDepartamento() {
        document.getElementById('codigoDepartamento').value = '';
        document.getElementById('descripcionDepartamento').value = '';
        document.getElementById('paisDepartamento').value = '';
        document.getElementById('estadoDepartamento').checked = true;
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const btnPaises = document.getElementById('btnPaises');
    const API_BASE_URL = 'https://migsistemasweb.com';
    let paisesModal;

    btnPaises.addEventListener('click', abrirModalPaises);

    function abrirModalPaises() {
        console.log("Abriendo panel de países");
        if (!paisesModal) {
            crearModalPaises();
        }
        paisesModal.style.display = 'block';
        cargarPaises();
    }

    function crearModalPaises() {
        paisesModal = document.createElement('div');
        paisesModal.className = 'modal';
        paisesModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Maestro de Países</h2>
                    <div class="button-container">
                        <button id="btnNuevoPais">Nuevo</button>
                        <button id="btnGuardarPais">Guardar</button>
                        <button id="btnEditarPais">Editar</button>
                        <button id="btnCancelarPais">Cancelar</button>
                        <button id="btnCerrarPaises">Cerrar</button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="paisForm">
                        <div class="form-group">
                            <label for="codigoPais">* Código:</label>
                            <input type="text" id="codigoPais" required>
                        </div>
                        <div class="form-group">
                            <label for="descripcionPais">* Descripción:</label>
                            <input type="text" id="descripcionPais" required>
                        </div>
                        <div class="form-group">
                            <label for="estadoPais">Estado:</label>
                            <input type="checkbox" id="estadoPais" checked>
                        </div>
                    </form>
                    <table id="paisesTable">
                        <thead>
                            <tr>
                                <th>Id País</th>
                                <th>País</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(paisesModal);

        document.getElementById('btnNuevoPais').addEventListener('click', nuevoPais);
        document.getElementById('btnGuardarPais').addEventListener('click', guardarPais);
        document.getElementById('btnEditarPais').addEventListener('click', editarPais);
        document.getElementById('btnCancelarPais').addEventListener('click', cancelarEdicion);
        document.getElementById('btnCerrarPaises').addEventListener('click', () => paisesModal.style.display = 'none');
    }

    function cargarPaises() {
        fetch(`${API_BASE_URL}/api/paises`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(paises => {
                console.log('Países recibidos:', paises);
                const tbody = document.querySelector('#paisesTable tbody');
                tbody.innerHTML = '';
                paises.forEach(pais => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${pais.IdPais}</td>
                        <td>${pais.Pais}</td>
                        <td>
                            <input type="checkbox" ${pais.Estado ? 'checked' : ''} disabled>
                            ${pais.Estado ? 'Activo' : 'Inactivo'}
                        </td>
                    `;
                    tr.addEventListener('click', () => seleccionarPais(pais));
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Error al cargar países:', error);
                Swal.fire('Error al cargar los países. Por favor, intente de nuevo.');
            });
    }

    function seleccionarPais(pais) {
        document.getElementById('codigoPais').value = pais.IdPais;
        document.getElementById('descripcionPais').value = pais.Pais;
        document.getElementById('estadoPais').checked = pais.Estado;
        habilitarFormulario(false);
        document.getElementById('btnEditarPais').disabled = false;
    }

    function nuevoPais() {
        limpiarFormularioPais();
        habilitarFormulario(true);
        document.getElementById('codigoPais').disabled = false;
        document.getElementById('btnGuardarPais').disabled = false;
        document.getElementById('btnEditarPais').disabled = true;
    }

    function editarPais() {
        habilitarFormulario(true);
        document.getElementById('codigoPais').disabled = true;
        document.getElementById('btnGuardarPais').disabled = false;
    }

    function cancelarEdicion() {
        limpiarFormularioPais();
        habilitarFormulario(false);
    }

    function habilitarFormulario(habilitar) {
        document.getElementById('codigoPais').disabled = !habilitar;
        document.getElementById('descripcionPais').disabled = !habilitar;
        document.getElementById('estadoPais').disabled = !habilitar;
    }

    function guardarPais() {
        const pais = {
            IdPais: document.getElementById('codigoPais').value,
            Pais: document.getElementById('descripcionPais').value,
            Estado: document.getElementById('estadoPais').checked
        };

        if (!pais.IdPais || !pais.Pais) {
            Swal.fire('Por favor, complete todos los campos');
            return;
        }

        const method = document.getElementById('codigoPais').disabled ? 'PUT' : 'POST';
        const url = `${API_BASE_URL}/api/paises${method === 'PUT' ? '/' + pais.IdPais : ''}`;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pais)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar el país');
            }
            return response.json();
        })
        .then(data => {
            console.log('País guardado:', data);
            Swal.fire('País guardado correctamente');
            cargarPaises();
            limpiarFormularioPais();
            habilitarFormulario(false);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('No se pudo guardar el país');
        });
    }

    function limpiarFormularioPais() {
        document.getElementById('codigoPais').value = '';
        document.getElementById('descripcionPais').value = '';
        document.getElementById('estadoPais').checked = true;
    }
});
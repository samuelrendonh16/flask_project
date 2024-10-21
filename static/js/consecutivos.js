document.addEventListener('DOMContentLoaded', function() {
    const btnConsecutivos = document.getElementById('btnConsecutivos');
    const consecutivosPanel = document.getElementById('consecutivosPanel');
    const btnCerrarConsecutivos = document.getElementById('btnCerrarConsecutivos');
    const btnNuevoConsecutivo = document.getElementById('btnNuevoConsecutivo');
    const btnGuardarConsecutivo = document.getElementById('btnGuardarConsecutivo');
    const btnEditarConsecutivo = document.getElementById('btnEditarConsecutivo');
    const btnCancelarConsecutivo = document.getElementById('btnCancelarConsecutivo');
    const btnPrimerRegistro = document.getElementById('btnPrimerRegistro');
    const btnAnteriorRegistro = document.getElementById('btnAnteriorRegistro');
    const btnSiguienteRegistro = document.getElementById('btnSiguienteRegistro');
    const btnUltimoRegistro = document.getElementById('btnUltimoRegistro');
    const formularioConsecutivo = document.querySelectorAll('#consecutivosPanel input, #consecutivosPanel select, #consecutivosPanel textarea');
    const API_BASE_URL = 'https://migsistemasweb.com';

    let consecutivosData = [];
    let currentIndex = -1;
    let editMode = false;

    const opcionesFormulario = [
        'Compras de Mercancía', 'Cotizaciones', 'Cuentas de Cobro', 'Devolución de Compras',
        'Entradas de Inventario', 'Gastos', 'Ordenes de Compra', 'Pedidos', 'Remisiones',
        'Salidas', 'Solicitud de Materiales', 'Traslados de Bodega', 'Inventario Físico'
    ];

    function cargarOpcionesFormulario() {
        const selectFormulario = document.getElementById('formularioConsecutivo');
        selectFormulario.innerHTML = '<option value="">Seleccione un formulario</option>';
        opcionesFormulario.forEach(opcion => {
            const optionElement = document.createElement('option');
            optionElement.value = opcion;
            optionElement.textContent = opcion;
            selectFormulario.appendChild(optionElement);
        });
    }

    btnConsecutivos.addEventListener('click', function() {
        consecutivosPanel.style.display = 'block';
        cargarConsecutivos();
        cargarOpcionesFormulario();
    });

    btnCerrarConsecutivos.addEventListener('click', function() {
        consecutivosPanel.style.display = 'none';
    });

    btnNuevoConsecutivo.addEventListener('click', function() {
        editMode = false;
        currentIndex = -1;
        limpiarFormulario();
        habilitarFormulario(true);
        actualizarEstadoBotones();
    });

    btnGuardarConsecutivo.addEventListener('click', guardarConsecutivo);

    btnEditarConsecutivo.addEventListener('click', function() {
        editMode = true;
        habilitarFormulario(true);
        actualizarEstadoBotones();
    });

    btnCancelarConsecutivo.addEventListener('click', function() {
        if (currentIndex >= 0) {
            mostrarConsecutivo(currentIndex);
        } else {
            limpiarFormulario();
        }
        editMode = false;
        habilitarFormulario(false);
        actualizarEstadoBotones();
    });

    btnPrimerRegistro.addEventListener('click', () => navegarRegistros(0));
    btnAnteriorRegistro.addEventListener('click', () => navegarRegistros(currentIndex - 1));
    btnSiguienteRegistro.addEventListener('click', () => navegarRegistros(currentIndex + 1));
    btnUltimoRegistro.addEventListener('click', () => navegarRegistros(consecutivosData.length - 1));

    function habilitarFormulario(habilitar) {
        formularioConsecutivo.forEach(elemento => {
            elemento.disabled = !habilitar;
        });
    }

    function actualizarEstadoBotones() {
        const hayDatos = consecutivosData.length > 0;
        btnNuevoConsecutivo.disabled = editMode;
        btnGuardarConsecutivo.disabled = !editMode;
        btnEditarConsecutivo.disabled = editMode || currentIndex === -1;
        btnCancelarConsecutivo.disabled = !editMode;
        btnPrimerRegistro.disabled = !hayDatos || editMode;
        btnAnteriorRegistro.disabled = !hayDatos || currentIndex <= 0 || editMode;
        btnSiguienteRegistro.disabled = !hayDatos || currentIndex >= consecutivosData.length - 1 || editMode;
        btnUltimoRegistro.disabled = !hayDatos || editMode;
    }

    function limpiarFormulario() {
        formularioConsecutivo.forEach(elemento => {
            if (elemento.type !== 'checkbox') {
                elemento.value = '';
            } else {
                elemento.checked = false;
            }
        });
    }

    function cargarConsecutivos() {
        fetch(`${API_BASE_URL}/api/consecutivos`)
            .then(response => response.json())
            .then(data => {
                consecutivosData = data;
                actualizarTablaConsecutivos();
                if (data.length > 0) {
                    mostrarConsecutivo(0);
                } else {
                    limpiarFormulario();
                    currentIndex = -1;
                }
                actualizarEstadoBotones();
            })
            .catch(error => console.error('Error al cargar los consecutivos:', error));
    }

    function actualizarTablaConsecutivos() {
        const tbody = document.querySelector('#consecutivosTable tbody');
        tbody.innerHTML = '';
        consecutivosData.forEach((cons, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cons.IdConsecutivo}</td>
                <td>${cons.Consecutivo}</td>
                <td>${cons.Formulario}</td>
                <td>${cons.Prefijo}</td>
                <td>${cons.Desde}</td>
                <td>${cons.Hasta}</td>
                <td>${cons.Actual}</td>
                <td>${cons.Resolucion || ''}</td>
                <td>${cons.FechaResolucion || ''}</td>
                <td>${cons.ObservacionesResolucion || ''}</td>
                <td>${cons.Estado ? '✓' : '✗'}</td>
            `;
            tr.addEventListener('click', () => {
                if (!editMode) {
                    mostrarConsecutivo(index);
                }
            });
            tbody.appendChild(tr);
        });
    }

    function mostrarConsecutivo(index) {
        if (index < 0 || index >= consecutivosData.length) return;

        const cons = consecutivosData[index];
        document.getElementById('numeroConsecutivo').value = cons.IdConsecutivo;
        document.getElementById('descripcionConsecutivo').value = cons.Consecutivo;
        document.getElementById('formularioConsecutivo').value = cons.Formulario;
        document.getElementById('prefijoConsecutivo').value = cons.Prefijo;
        document.getElementById('desdeConsecutivo').value = cons.Desde;
        document.getElementById('hastaConsecutivo').value = cons.Hasta;
        document.getElementById('actualConsecutivo').value = cons.Actual;
        document.getElementById('resolucionConsecutivo').value = cons.Resolucion || '';
        document.getElementById('fechaResolucionConsecutivo').value = cons.FechaResolucion || '';
        document.getElementById('observacionesConsecutivo').value = cons.ObservacionesResolucion || '';
        document.getElementById('inactivoConsecutivo').checked = !cons.Estado;

        currentIndex = index;
        editMode = false;
        habilitarFormulario(false);
        actualizarEstadoBotones();
    }

    function navegarRegistros(index) {
        if (index >= 0 && index < consecutivosData.length && !editMode) {
            mostrarConsecutivo(index);
        }
    }

    function guardarConsecutivo() {
        const consecutivoData = {
            IdConsecutivo: document.getElementById('numeroConsecutivo').value,
            Consecutivo: document.getElementById('descripcionConsecutivo').value,
            Formulario: document.getElementById('formularioConsecutivo').value,
            Prefijo: document.getElementById('prefijoConsecutivo').value,
            Desde: document.getElementById('desdeConsecutivo').value,
            Hasta: document.getElementById('hastaConsecutivo').value,
            Actual: document.getElementById('actualConsecutivo').value,
            Resolucion: document.getElementById('resolucionConsecutivo').value,
            FechaResolucion: document.getElementById('fechaResolucionConsecutivo').value,
            ObservacionesResolucion: document.getElementById('observacionesConsecutivo').value,
            Estado: !document.getElementById('inactivoConsecutivo').checked,
        };

        const url = `${API_BASE_URL}/api/consecutivos`;
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consecutivoData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Éxito:', data);
            cargarConsecutivos();
            editMode = false;
            habilitarFormulario(false);
            actualizarEstadoBotones();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
});
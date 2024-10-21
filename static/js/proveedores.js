document.addEventListener('DOMContentLoaded', function() {
    console.log("Document ready");
    let table;
    let editando = false;
    const API_BASE_URL = 'https://migsistemasweb.com';

    function getElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : null;
    }

    function getCheckboxState(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    function validateForm() {
        const requiredFields = ['nitProveedor', 'razonSocialProveedor', 'emailProveedor'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && !element.value.trim()) {
                element.classList.add('is-invalid');
                isValid = false;
            } else if (element) {
                element.classList.remove('is-invalid');
            }
        });
    
        if (!isValid) {
            Swal.fire('Por favor, complete los campos obligatorios.');
        }
    
        return isValid;
    }
    
    document.getElementById('btnGuardarProveedor').addEventListener('click', function() {
        if (!validateForm()) return;
        
        const proveedorData = {
            Nit: getElementValue('nitProveedor'),  // Actualizado
            DV: getElementValue('dvProveedor'),  // Actualizado
            RazonSocial: getElementValue('razonSocialProveedor'),  // Actualizado
            Nombre1: getElementValue('nombre1'),
            Nombre2: getElementValue('nombre2'),
            Apellido1: getElementValue('apellido1'),
            Apellido2: getElementValue('apellido2'),
            Email: getElementValue('emailProveedor'),
            Cuenta: getElementValue('numeroCuenta'),
            CxP: getElementValue('cxp'),
            DiasCredito: getElementValue('diasCredito'),
            Estado: document.getElementById('activoProveedor').checked  // Solo se envía true o false
        };
    
        fetch(`${API_BASE_URL}/api/proveedores`, {
            method: editando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proveedorData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: editando ? 'Proveedor actualizado con éxito' : 'Proveedor creado con éxito',
                showConfirmButton: false,
                timer: 1500
            });
            if (table) {
                table.ajax.reload();
            }
            toggleFormFields(true);
            toggleButtons(false);
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar el proveedor',
                text: error.message || 'Hubo un problema al procesar su solicitud'
            });
        });
    });
    
    document.querySelector('.btnProveedores').addEventListener('click', function() {
        document.getElementById('proveedoresPanel').style.display = 'block';
        if (!$.fn.DataTable.isDataTable('#proveedoresTable')) {
            initializeProveedoresTable();
        } else {
            table.ajax.reload();
        }
    });

    function initializeProveedoresTable() {
        table = $('#proveedoresTable').DataTable({
            ajax: {
                url: `${API_BASE_URL}/api/proveedores`,
                dataSrc: '',
                error: function (xhr, error, thrown) {
                    console.error('Error al cargar datos:', error);
                }
            },
            columns: [
                { data: 'Nit' },
                { data: 'RazonSocial' },
                { data: 'Nombre1' },
                { data: 'Nombre2' },
                { data: 'Apellido1' },
                { data: 'Apellido2' },
                { data: 'Cuenta' },
                { data: 'CxP' },
                { data: 'DiasCredito' },
                { data: 'Estado' }
            ]
        });
    }

    function toggleFormFields(disabled) {
        document.querySelectorAll('#proveedorForm input, #proveedorForm select').forEach(el => {
            el.disabled = disabled;
        });
        
        // NIT y Razón Social deben estar deshabilitados en modo edición
        if (editando) {
            document.getElementById('nitProveedor').disabled = true;
            document.getElementById('razonSocialProveedor').disabled = true;
            document.getElementById('dvProveedor').disabled = true;
        }
    }
    
    function toggleButtons(editando) {
        document.getElementById('btnGuardarProveedor').disabled = !editando;
        document.getElementById('btnCancelarProveedor').disabled = !editando;
        document.getElementById('btnEditarProveedor').disabled = editando;
        document.getElementById('btnEliminarProveedor').disabled = editando;
    }

    document.getElementById('btnNuevoProveedor').addEventListener('click', function() {
        editando = false;
        limpiarFormulario();
        toggleFormFields(false);
        toggleButtons(true);
        document.getElementById('fechaCreacion').value = new Date().toISOString().split('T')[0];
    });

    // Función para gestionar el botón de editar
    document.getElementById('btnEditarProveedor').addEventListener('click', function() {
        editando = true;
        toggleFormFields(false);  // Habilitar todos los campos excepto NIT, DV, y Razón Social
        toggleButtons(editando); // Ajustar botones para modo de edición
    });

    document.getElementById('btnEliminarProveedor').addEventListener('click', function() {
        confirmarAccion('¿Está seguro de que desea eliminar este proveedor?', () => {
            const nit = getElementValue('nit');
            fetch(`${API_BASE_URL}/api/proveedores/${nit}`, { method: 'DELETE' })
                .then(handleFetchErrors)
                .then(data => {
                    mostrarExito('Proveedor eliminado con éxito');
                    table.ajax.reload();
                    limpiarFormulario();
                    toggleFormFields(true);
                    toggleButtons(false);
                })
                .catch(error => {
                    mostrarError('Error al eliminar el proveedor');
                });
        });
    });

    document.getElementById('btnCancelarProveedor').addEventListener('click', function() {
        limpiarFormulario();
        toggleFormFields(true);
        toggleButtons(false);
    });

    document.getElementById('btnCerrarProveedor').addEventListener('click', function() {
        document.getElementById('proveedoresPanel').style.display = 'none';
    });

    document.querySelector('#proveedoresTable tbody').addEventListener('click', function(e) {
        const target = e.target.closest('tr');
        if (target) {
            const data = table.row(target).data();
            if (data) {
                fillForm(data);
                toggleFormFields(true);
                toggleButtons(false);
            }
        }
    });

     // Lógica para manejar la selección de los checkboxes
    document.getElementById('activoProveedor').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('inactivoProveedor').checked = false;
        }
    });

    document.getElementById('inactivoProveedor').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('activoProveedor').checked = false;
        }
    });


    function fillForm(data) {
        for (const [key, value] of Object.entries(data)) {
            const element = document.getElementById(key.toLowerCase());
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value; // Verificar si es checkbox y asignar valor
                } else {
                    element.value = value;
                }
            }
        }
    
        // Asegúrate de que los campos NIT y Razón Social estén llenos y deshabilitados
        document.getElementById('nitProveedor').value = data.Nit;
        document.getElementById('nitProveedor').disabled = true;
    
        document.getElementById('razonSocialProveedor').value = data.RazonSocial;
        document.getElementById('razonSocialProveedor').disabled = true;

        document.getElementById('dvProveedor').value = data.DV;
        document.getElementById('dvProveedor').disabled = true;

            // Llenar el resto de los campos del formulario
        document.getElementById('nombre1').value = data.Nombre1 || '';
        document.getElementById('nombre2').value = data.Nombre2 || '';
        document.getElementById('emailProveedor').value = data.Email || '';
        document.getElementById('apellido1').value = data.Apellido1 || '';
        document.getElementById('apellido2').value = data.Apellido2 || '';
        document.getElementById('numeroCuenta').value = data.Cuenta || '';
        document.getElementById('cxp').value = data.CxP || '';
        document.getElementById('diasCredito').value = data.DiasCredito || '';

        // Configurar el estado (checkbox)
        document.getElementById('activoProveedor').checked = data.Estado === true;
        document.getElementById('inactivoProveedor').checked = data.Estado === false;
    }
    
    function limpiarFormulario() {
        const proveedorForm = document.getElementById('proveedorForm');
        if (proveedorForm) proveedorForm.reset();
    }

    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje
        });
    }

    function mostrarExito(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje
        });
    }

    function handleFetchErrors(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    function confirmarAccion(mensaje, accionConfirmada) {
        Swal.fire({
            title: '¿Está seguro?',
            text: mensaje,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                accionConfirmada();
            }
        });
    }
});

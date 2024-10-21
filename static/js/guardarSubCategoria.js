document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        btnNuevoSubcategoria: document.getElementById('btnNuevoSubcategoria'),
        btnGuardarSubcategoria: document.getElementById('btnGuardarSubcategoria'),
        btnEditarSubcategoria: document.getElementById('btnEditarSubcategoria'),
        btnEliminarSubcategoria: document.getElementById('btnEliminarSubcategoria'),
        btnCancelarSubcategoria: document.getElementById('btnCancelarSubcategoria'),
        btnCerrarSubcategoria: document.getElementById('btnCerrarSubcategoria'),
        codigoSubcategoria: document.getElementById('codigoSubcategoria'),
        descripcionSubcategoria: document.getElementById('descripcionSubcategoria'),
        grupoSubcategoria: document.getElementById('grupoSubcategoria'),
        subgrupoSubcategoria: document.getElementById('subgrupoSubcategoria'),
        estadoSubcategoria: document.getElementById('estadoSubcategoria'),
        buscarSubcategoria: document.getElementById('buscarSubcategoria'),
        subcategoriasTable: document.getElementById('subcategoriasTable')
    };

    let subcategoriaSeleccionada = null;
    let modoEdicion = false;

    // Event Listeners
    elements.btnNuevoSubcategoria.addEventListener('click', nuevoSubcategoria);
    elements.btnGuardarSubcategoria.addEventListener('click', guardarSubcategoria);
    elements.btnEditarSubcategoria.addEventListener('click', habilitarEdicionSubcategoria);
    elements.btnEliminarSubcategoria.addEventListener('click', confirmarEliminarSubcategoria);
    elements.btnCancelarSubcategoria.addEventListener('click', cancelarEdicionSubcategoria);
    elements.btnCerrarSubcategoria.addEventListener('click', cerrarPanelSubcategorias);
    elements.grupoSubcategoria.addEventListener('change', cargarSubgrupos);
    elements.buscarSubcategoria.addEventListener('input', filtrarSubcategorias);

    document.getElementById('btnSubCategorias').addEventListener('click', () => {
        console.log('Botón SubCategorías clickeado');
        document.getElementById('subcategoriasPanel').style.display = 'block';
        cargarGruposSubCategorias();
        cargarSubcategorias();
    });

    function cargarGruposSubCategorias() {
        console.log('Iniciando carga de grupos para subcategorías');
        fetch('https://migsistemasweb.com/api/grupos_subcategorias')
            .then(response => {
                console.log('Respuesta recibida:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos de grupos recibidos:', data);
                elements.grupoSubcategoria.innerHTML = '<option value="">Seleccione un Grupo</option>';
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(grupo => {
                        const option = document.createElement('option');
                        option.value = grupo.IdGrupo;
                        option.textContent = grupo.Grupo;
                        elements.grupoSubcategoria.appendChild(option);
                    });
                    console.log('Grupos cargados exitosamente');
                } else {
                    console.log('No se recibieron grupos o el formato de datos es incorrecto');
                }
            })
            .catch(error => {
                console.error('Error al cargar grupos:', error);
                mostrarMensaje('No se pudieron cargar los grupos. Por favor, intente de nuevo.', 'error');
            });
    }

    function cargarSubgrupos() {
        const grupoSeleccionado = elements.grupoSubcategoria.value;
        if (!grupoSeleccionado) {
            elements.subgrupoSubcategoria.innerHTML = '<option value="">Seleccione un SubGrupo</option>';
            return;
        }

        console.log('Cargando subgrupos para el grupo:', grupoSeleccionado);
        fetch(`https://migsistemasweb.com/api/subgrupos/${grupoSeleccionado}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(subgrupos => {
                console.log('Subgrupos recibidos:', subgrupos);
                elements.subgrupoSubcategoria.innerHTML = '<option value="">Seleccione un SubGrupo</option>';
                subgrupos.forEach(subgrupo => {
                    const option = document.createElement('option');
                    option.value = subgrupo.IdSubgrupo;
                    option.textContent = subgrupo.Subgrupo;
                    elements.subgrupoSubcategoria.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar subgrupos:', error);
                mostrarMensaje('Error al cargar los subgrupos', 'error');
            });
    }

    function nuevoSubcategoria() {
        console.log('Iniciando nueva subcategoría');
        modoEdicion = false;
        limpiarFormularioSubcategoria();
        habilitarCamposSubcategoria(true);
        elements.codigoSubcategoria.disabled = false;
        elements.btnGuardarSubcategoria.disabled = false;
        elements.btnEditarSubcategoria.disabled = true;
    }

    function cargarSubcategorias() {
        console.log('Cargando subcategorías');
        fetch('https://migsistemasweb.com/api/subcategorias', {
            method: 'GET',  // Asegúrate de que el método sea GET
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Subcategorías cargadas:', data);
            actualizarTablaSubcategorias(data);
        })
        .catch(error => {
            console.error('Error al cargar subcategorías:', error);
            mostrarMensaje('Error al cargar las subcategorías', 'error');
        });
    }

    function actualizarTablaSubcategorias(subcategorias) {
        const tbody = elements.subcategoriasTable.querySelector('tbody');
        tbody.innerHTML = '';
        subcategorias.forEach(subcategoria => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = subcategoria.idsubcategoria;
            row.insertCell(1).textContent = subcategoria.categoria;
            row.insertCell(2).textContent = subcategoria.idgrupo;
            row.insertCell(3).textContent = subcategoria.idsubgrupo;
            row.insertCell(4).textContent = subcategoria.estado ? 'Activo' : 'Inactivo';
            row.addEventListener('click', () => seleccionarSubcategoria(subcategoria));
        });
    }

    function habilitarEdicionSubcategoria() {
        console.log('Habilitando edición de subcategoría');
        modoEdicion = true;
        habilitarCamposSubcategoria(true);
        elements.btnGuardarSubcategoria.disabled = false;
        elements.btnCancelarSubcategoria.disabled = false;
        elements.btnEditarSubcategoria.disabled = true;
        elements.codigoSubcategoria.disabled = true; // El código no debe cambiar en modo edición
    }

    function habilitarCamposSubcategoria(habilitar) {
        elements.descripcionSubcategoria.disabled = !habilitar;
        elements.grupoSubcategoria.disabled = !habilitar;
        elements.subgrupoSubcategoria.disabled = !habilitar;
        elements.estadoSubcategoria.disabled = !habilitar;
    }

    function guardarSubcategoria() {
        if (!validarFormularioSubcategoria()) {
            mostrarMensaje('Por favor, complete todos los campos requeridos', 'error');
            return;
        }
    
        const subcategoriaData = {
            idsubcategoria: elements.codigoSubcategoria.value,
            categoria: elements.descripcionSubcategoria.value,
            idgrupo: elements.grupoSubcategoria.value,
            idsubgrupo: elements.subgrupoSubcategoria.value,
            estado: elements.estadoSubcategoria.checked
        };
    
        const url = modoEdicion 
            ? `https://migsistemasweb.com/api/subcategorias/${subcategoriaData.idsubcategoria}` 
            : 'https://migsistemasweb.com/api/subcategorias';
        const method = modoEdicion ? 'PUT' : 'POST';
    
        console.log(`${method} subcategoría:`, subcategoriaData);
    
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subcategoriaData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);
            mostrarMensaje(data.message, 'success');
            cargarSubcategorias();
            limpiarFormularioSubcategoria();
            habilitarCamposSubcategoria(false);
        })
        .catch((error) => {
            console.error('Error:', error);
            mostrarMensaje('Error al guardar la subcategoría: ' + error.message, 'error');
        });
    }

    function confirmarEliminarSubcategoria() {
        if (subcategoriaSeleccionada) {
            Swal.fire({
                title: '¿Está seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    eliminarSubcategoria(subcategoriaSeleccionada);
                }
            });
        } else {
            mostrarMensaje('Por favor, seleccione una subcategoría para eliminar.', 'error');
        }
    }

    function eliminarSubcategoria(id) {
        console.log('Eliminando subcategoría:', id);
        fetch(`https://migsistemasweb.com/api/subcategorias/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje('Subcategoría eliminada exitosamente', 'success');
            cargarSubcategorias();
            limpiarFormularioSubcategoria();
        })
        .catch((error) => {
            console.error('Error:', error);
            mostrarMensaje('Error al eliminar la subcategoría', 'error');
        });
    }

    function cancelarEdicionSubcategoria() {
        console.log('Cancelando edición de subcategoría');
        limpiarFormularioSubcategoria();
        habilitarCamposSubcategoria(false);
        elements.btnGuardarSubcategoria.disabled = true;
        elements.btnCancelarSubcategoria.disabled = true;
        elements.btnEditarSubcategoria.disabled = true;
        elements.btnEliminarSubcategoria.disabled = true;
        modoEdicion = false;
    }

    function limpiarFormularioSubcategoria() {
        elements.codigoSubcategoria.value = '';
        elements.descripcionSubcategoria.value = '';
        elements.grupoSubcategoria.value = '';
        elements.subgrupoSubcategoria.value = '';
        elements.estadoSubcategoria.checked = false;
    }

    function seleccionarSubcategoria(subcategoria) {
        console.log('Subcategoría seleccionada:', subcategoria);
        subcategoriaSeleccionada = subcategoria.idsubcategoria;
        elements.codigoSubcategoria.value = subcategoria.idsubcategoria;
        elements.descripcionSubcategoria.value = subcategoria.categoria;
        elements.grupoSubcategoria.value = subcategoria.idgrupo;
        cargarSubgrupos(); // Cargar los subgrupos del grupo seleccionado
        setTimeout(() => {
            elements.subgrupoSubcategoria.value = subcategoria.idsubgrupo;
        }, 100); // Pequeño retraso para asegurar que los subgrupos se hayan cargado
        elements.estadoSubcategoria.checked = subcategoria.estado;

        habilitarCamposSubcategoria(false);
        elements.btnEditarSubcategoria.disabled = false;
        elements.btnEliminarSubcategoria.disabled = false;
    }

    function filtrarSubcategorias() {
        const filtro = elements.buscarSubcategoria.value.toLowerCase();
        const filas = elements.subcategoriasTable.querySelectorAll('tbody tr');
        filas.forEach(fila => {
            const texto = fila.textContent.toLowerCase();
            fila.style.display = texto.includes(filtro) ? '' : 'none';
        });
    }

    function cerrarPanelSubcategorias() {
        document.getElementById('subcategoriasPanel').style.display = 'none';
    }

    function validarFormularioSubcategoria() {
        return elements.codigoSubcategoria.value.trim() !== '' &&
               elements.descripcionSubcategoria.value.trim() !== '' &&
               elements.grupoSubcategoria.value !== '' &&
               elements.subgrupoSubcategoria.value !== '';
    }

    function mostrarMensaje(mensaje, tipo) {
        console.log(`${tipo}: ${mensaje}`);
        Swal.fire({
            icon: tipo,
            title: mensaje,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
});
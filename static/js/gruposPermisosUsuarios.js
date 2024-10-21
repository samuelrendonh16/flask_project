document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de grupos y permisos de usuarios cargado');

    const gruposPermisosPanel = document.getElementById('gruposPermisosPanel');
    const btnGruposPermisosUsuarios = document.getElementById('btnGruposPermisosUsuarios');
    const btnNuevoGrupoPermisos = document.getElementById('btnNuevoGrupoPermisos');
    const btnGuardarGrupoPermisos = document.getElementById('btnGuardarGrupoPermisos');
    const btnEliminarGrupo = document.getElementById('btnEliminarGrupo');
    const btnCerrarGruposPermisos = document.getElementById('btnCerrarGruposPermisos');
    const btnActivarTodo = document.getElementById('btnActivarTodo');
    const btnDesactivarTodo = document.getElementById('btnDesactivarTodo');
    const btnGuardarPermisos = document.getElementById('btnGuardarPermisos');
    const idGrupoInput = document.getElementById('idGrupo');
    const descripcionGrupoInput = document.getElementById('descripcionGrupo');
    const estadoGrupoCheckbox = document.getElementById('estadoGrupo');
    const cambiarFechaActualGrupoCheckbox = document.getElementById('cambiarFechaActualGrupo');
    const tablaGrupos = document.getElementById('tablaGrupos');
    const permisosContainer = document.getElementById('permisosContainer');
    const baseUrl = 'https://migsistemasweb.com';

    btnGruposPermisosUsuarios.addEventListener('click', mostrarPanelGruposPermisos);
    btnNuevoGrupoPermisos.addEventListener('click', prepararNuevoGrupo);
    btnGuardarGrupoPermisos.addEventListener('click', guardarGrupo);
    btnEliminarGrupo.addEventListener('click', eliminarGrupo);
    btnCerrarGruposPermisos.addEventListener('click', cerrarPanelGruposPermisos);
    btnGuardarPermisos.addEventListener('click', guardarPermisosGrupo);
    btnActivarTodo.addEventListener('click', activarTodosLosPermisos);
    btnDesactivarTodo.addEventListener('click', desactivarTodosLosPermisos);

    function mostrarPanelGruposPermisos() {
        gruposPermisosPanel.style.display = 'block';
        cargarGruposUsuarios();
    }

    function cerrarPanelGruposPermisos() {
        gruposPermisosPanel.style.display = 'none';
    }

    function cargarGruposUsuarios() {
        fetch(`${baseUrl}/api/grupos-usuarios`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(grupos => {
            const tbody = tablaGrupos.querySelector('tbody');
            tbody.innerHTML = grupos.map(grupo => `
                <tr data-id="${grupo.IdGrupo}">
                    <td>${grupo.IdGrupo}</td>
                    <td>${grupo.Descripcion}</td>
                    <td>${grupo.Estado ? 'Activo' : 'Inactivo'}</td>
                </tr>
            `).join('');

            tbody.querySelectorAll('tr').forEach(row => {
                row.addEventListener('click', () => editarGrupo(row.dataset.id));
            });
        })
        .catch(error => {
            console.error('Error al cargar grupos de usuarios:', error);
            Swal.fire('Error', 'No se pudieron cargar los grupos de usuarios', 'error');
        });
    }

    function prepararNuevoGrupo() {
        idGrupoInput.value = '';
        descripcionGrupoInput.value = '';
        estadoGrupoCheckbox.checked = false;
        cambiarFechaActualGrupoCheckbox.checked = false;
        idGrupoInput.disabled = true;
        descripcionGrupoInput.disabled = false;
        estadoGrupoCheckbox.disabled = false;
        cambiarFechaActualGrupoCheckbox.disabled = false;
        permisosContainer.innerHTML = '';
    }

    function editarGrupo(idGrupo) {
        fetch(`${baseUrl}/api/grupos-usuarios/${idGrupo}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(grupo => {
            idGrupoInput.value = grupo.IdGrupo;
            descripcionGrupoInput.value = grupo.Descripcion;
            estadoGrupoCheckbox.checked = grupo.Estado;
            cambiarFechaActualGrupoCheckbox.checked = grupo.CambiarFechaActual;
            idGrupoInput.disabled = true;
            descripcionGrupoInput.disabled = false;
            estadoGrupoCheckbox.disabled = false;
            cambiarFechaActualGrupoCheckbox.disabled = false;
            cargarPermisosGrupo(idGrupo);
        })
        .catch(error => {
            console.error('Error al cargar grupo:', error);
            Swal.fire('Error', 'No se pudo cargar el grupo', 'error');
        });
    }

    function guardarGrupo() {
        const grupoData = {
            Descripcion: descripcionGrupoInput.value,
            Estado: estadoGrupoCheckbox.checked,
            CambiarFechaActual: cambiarFechaActualGrupoCheckbox.checked
        };

        const method = idGrupoInput.value ? 'PUT' : 'POST';
        const url = idGrupoInput.value ? `${baseUrl}/api/grupos-usuarios/${idGrupoInput.value}` : `${baseUrl}/api/grupos-usuarios`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(grupoData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.IdGrupo) {
                Swal.fire('Éxito', 'Grupo guardado correctamente', 'success');
                cargarGruposUsuarios();
                if (method === 'POST') {
                    idGrupoInput.value = data.IdGrupo;
                    cargarPermisosGrupo(data.IdGrupo);
                }
            } else {
                throw new Error(data.error || 'Error al guardar grupo');
            }
        })
        .catch(error => {
            console.error('Error al guardar grupo:', error);
            Swal.fire('Error', `Error al guardar grupo: ${error.message}`, 'error');
        });
    }

    function eliminarGrupo() {
        const idGrupo = idGrupoInput.value;
        if (!idGrupo) {
            Swal.fire('Error', 'No hay grupo seleccionado para eliminar', 'error');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseUrl}/api/grupos-usuarios/${idGrupo}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Swal.fire('Eliminado', 'El grupo ha sido eliminado', 'success');
                        cargarGruposUsuarios();
                        prepararNuevoGrupo();
                    } else {
                        throw new Error(data.error || 'Error al eliminar grupo');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar grupo:', error);
                    Swal.fire('Error', `Error al eliminar grupo: ${error.message}`, 'error');
                });
            }
        });
    }

    function cargarPermisosGrupo(idGrupo) {
        fetch(`${baseUrl}/api/permisos-grupo/${idGrupo}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(permisos => {
            permisosContainer.innerHTML = permisos.map(permiso => `
                <div class="permiso-item">
                    <label>
                        <input type="checkbox" name="permiso" value="${permiso.id}" ${permiso.activo ? 'checked' : ''}>
                        ${permiso.nombre}
                    </label>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error al cargar permisos del grupo:', error);
            Swal.fire('Error', 'No se pudieron cargar los permisos del grupo', 'error');
        });
    }

    function guardarPermisosGrupo() {
        const idGrupo = idGrupoInput.value;
        if (!idGrupo) {
            Swal.fire('Error', 'No hay grupo seleccionado para guardar permisos', 'error');
            return;
        }
        const permisos = Array.from(permisosContainer.querySelectorAll('input[type="checkbox"]'))
            .map(checkbox => ({
                id: checkbox.value,
                activo: checkbox.checked
            }));

        fetch(`${baseUrl}/api/actualizar-permisos-grupo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idGrupo, permisos }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Éxito', 'Permisos actualizados correctamente', 'success');
            } else {
                throw new Error(data.message || 'Error al actualizar permisos');
            }
        })
        .catch(error => {
            console.error('Error al guardar permisos:', error);
            Swal.fire('Error', `Error al guardar permisos: ${error.message}`, 'error');
        });
    }

    function activarTodosLosPermisos() {
        permisosContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = true);
    }

    function desactivarTodosLosPermisos() {
        permisosContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    }
});
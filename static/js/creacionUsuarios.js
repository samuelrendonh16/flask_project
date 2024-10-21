document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de creación de usuarios cargado');

    const creacionUsuariosPanel = document.getElementById('creacionUsuariosPanel');
    const btnCreacionUsuarios = document.getElementById('btnCreacionUsuarios');
    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    const btnGuardarUsuario = document.getElementById('btnGuardarUsuario');
    const btnCancelarUsuario = document.getElementById('btnCancelarUsuario');
    const btnCerrarCreacionUsuarios = document.getElementById('btnCerrarCreacionUsuarios');
    const tipoUsuario = document.getElementById('tipoUsuario');
    const permisosContainer = document.getElementById('permisosContainer');
    const usuarioForm = document.getElementById('usuarioForm');
    const usuariosTable = document.getElementById('usuariosTable');
    const baseUrl = 'https://migsistemasweb.com';

    function esAdmin() {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('Datos del usuario:', userData);
        return userData && userData.NivelAcceso === 100;
    }
    
    function mostrarPanelCreacionUsuarios() {
        if (esAdmin()) {
            console.log('El usuario es administrador. Mostrando panel de creación.');
            creacionUsuariosPanel.style.display = 'block';
            cargarUsuarios();
        } else {
            console.log('Acceso denegado. El usuario no es administrador.');
            Swal.fire('Acceso denegado', 'Solo los administradores pueden crear usuarios', 'error');
        }
    }
    
    if (btnCreacionUsuarios) {
        if (esAdmin()) {
            btnCreacionUsuarios.style.display = 'block';
            btnCreacionUsuarios.addEventListener('click', mostrarPanelCreacionUsuarios);
        } else {
            btnCreacionUsuarios.style.display = 'none';
        }
    }
    
    function cargarPermisos() {
        fetch(`${baseUrl}/api/permisos`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Respuesta del servidor (permisos):', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(permisos => {
            permisosContainer.innerHTML = permisos.map(permiso => 
                `<div class="form-check">
                    <input class="form-check-input" type="checkbox" id="permiso_${permiso.id}" name="permisos" value="${permiso.id}">
                    <label class="form-check-label" for="permiso_${permiso.id}">${permiso.nombre}</label>
                </div>`
            ).join('');
        })
        .catch(error => {
            console.error('Error al cargar permisos:', error);
            Swal.fire('Error', 'No se pudieron cargar los permisos: ' + error.message, 'error');
        });
    }

    btnNuevoUsuario.addEventListener('click', () => {
        usuarioForm.reset();
        btnGuardarUsuario.disabled = false;
        btnCancelarUsuario.disabled = false;
        btnGuardarUsuario.textContent = 'Guardar Usuario';
        usuarioForm.dataset.mode = 'create';
        usuarioForm.dataset.userId = '';
    });

    btnGuardarUsuario.addEventListener('click', () => {
        const formData = new FormData(usuarioForm);
        const userData = Object.fromEntries(formData.entries());
        userData.Estado = formData.has('Estado');
        userData.NivelAcceso = parseInt(userData.NivelAcceso, 10);

        if (!userData.IdUsuario || !userData.Descripcion || (usuarioForm.dataset.mode !== 'edit' && !userData.Contraseña)) {
            Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }

        const method = usuarioForm.dataset.mode === 'edit' ? 'PUT' : 'POST';
        const url = usuarioForm.dataset.mode === 'edit' 
            ? `${baseUrl}/api/usuarios/${usuarioForm.dataset.userId}`
            : `${baseUrl}/api/usuarios`;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        })
        .then(response => {
            console.log('Respuesta del servidor (guardar usuario):', response);
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                Swal.fire('Usuario guardado', 'El usuario ha sido guardado exitosamente', 'success');
                usuarioForm.reset();
                cargarUsuarios();
            } else {
                throw new Error(data.message || 'Error al guardar usuario');
            }
        })
        .catch(error => {
            console.error('Error al guardar usuario:', error);
            Swal.fire('Error', `Error al guardar usuario: ${error.message}`, 'error');
        });
    });

    btnCancelarUsuario.addEventListener('click', () => {
        usuarioForm.reset();
        btnGuardarUsuario.disabled = true;
        btnCancelarUsuario.disabled = true;
    });

    btnCerrarCreacionUsuarios.addEventListener('click', () => {
        creacionUsuariosPanel.style.display = 'none';
    });

    tipoUsuario.addEventListener('change', (e) => {
        if (e.target.value === 'regular') {
            permisosContainer.style.display = 'block';
            cargarPermisos();
        } else {
            permisosContainer.style.display = 'none';
        }
    });

    function editarUsuario(userId) {
        console.log(`Intentando editar usuario con ID: ${userId}`);
        fetch(`${baseUrl}/api/usuarios/${userId}`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Respuesta del servidor (editar usuario):', response);
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos del usuario recibidos:', data);
            if (data.success) {
                const usuario = data.usuario;
                usuarioForm.IdUsuario.value = usuario.IdUsuario;
                usuarioForm.Descripcion.value = usuario.Descripcion;
                usuarioForm.NivelAcceso.value = usuario.NivelAcceso;
                usuarioForm.Estado.checked = usuario.Estado;
                
                btnGuardarUsuario.textContent = 'Actualizar Usuario';
                btnGuardarUsuario.disabled = false;
                btnCancelarUsuario.disabled = false;
                usuarioForm.dataset.mode = 'edit';
                usuarioForm.dataset.userId = userId;
    
                creacionUsuariosPanel.style.display = 'block';
            } else {
                throw new Error(data.message || 'Error al cargar datos del usuario');
            }
        })
        .catch(error => {
            console.error('Error al cargar usuario para editar:', error);
            Swal.fire('Error', `No se pudo cargar el usuario para editar: ${error.message}`, 'error');
        });
    }

    function eliminarUsuario(userId) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseUrl}/api/usuarios/${userId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => {
                    console.log('Respuesta del servidor (eliminar usuario):', response);
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
                        cargarUsuarios();
                    } else {
                        throw new Error(data.message || 'Error al eliminar usuario');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar usuario:', error);
                    Swal.fire('Error', `Error al eliminar usuario: ${error.message}`, 'error');
                });
            }
        });
    }

    function cargarUsuarios() {
        fetch(`${baseUrl}/api/usuarios`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Respuesta del servidor (cargar usuarios):', response);
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de usuarios recibidos:', data);
            if (!Array.isArray(data)) {
                throw new Error('La respuesta no es un array');
            }
            const tbody = usuariosTable.querySelector('tbody');
            tbody.innerHTML = data.map(usuario => `
                <tr>
                    <td>${usuario.IdUsuario}</td>
                    <td>${usuario.Descripcion}</td>
                    <td>${usuario.NivelAcceso === 100 ? 'Administrador' : 'Regular'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning editar-usuario" data-id="${usuario.IdUsuario}">Editar</button>
                        <button class="btn btn-sm btn-danger eliminar-usuario" data-id="${usuario.IdUsuario}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.editar-usuario').forEach(btn => {
                btn.addEventListener('click', (e) => editarUsuario(e.target.dataset.id));
            });
            document.querySelectorAll('.eliminar-usuario').forEach(btn => {
                btn.addEventListener('click', (e) => eliminarUsuario(e.target.dataset.id));
            });
        })
        .catch(error => {
            console.error('Error al cargar usuarios:', error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios: ' + error.message, 'error');
        });
    }

    if (esAdmin()) {
        cargarUsuarios();
    }
});
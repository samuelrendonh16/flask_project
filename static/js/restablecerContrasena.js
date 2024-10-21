document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'https://migsistemasweb.com';
    const form = document.getElementById('frm');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Evitar que el formulario se envíe automáticamente

        const idUsuario = document.getElementById("idUsuario").value;
        const nuevaContrasena = document.getElementById("contrasena").value;
        const repetirContrasena = document.getElementById("recontrasena").value;

        if (nuevaContrasena !== repetirContrasena) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
            });
            return;
        }

        // Validar que el usuario existe
        fetch(`${API_BASE_URL}/api/validar_usuario?idUsuario=${encodeURIComponent(idUsuario)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                if (!data.existe) {
                    throw new Error('El usuario no existe');
                }
                // Actualizar contraseña
                return fetch(`${API_BASE_URL}/api/actualizar_contrasena`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idUsuario: idUsuario,
                        contrasena: nuevaContrasena
                    })
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al actualizar la contraseña');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'La contraseña ha sido cambiada exitosamente',
                    }).then(() => {
                        window.location.href = data.redirect_url; // Redirigir al login
                    });
                } else {
                    throw new Error('No se pudo cambiar la contraseña');
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error de comunicación con el servidor',
                });
                console.error('Error:', error);
            });
    });
});
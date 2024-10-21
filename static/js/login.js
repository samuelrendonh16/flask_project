document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const baseUrl = 'https://migsistemasweb.com';

    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = `${baseUrl}/inicio`;
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        iniciarSesion(username, password);
    });

    function iniciarSesion(username, password) {
        // Deshabilitar el botón de submit para evitar múltiples envíos
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        fetch(`${baseUrl}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // Incluir cookies en la solicitud
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Verifica la respuesta completa del servidor en la consola
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('showWelcome', 'true');
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                
                Swal.fire({
                    title: `Bienvenido, ${data.user.Descripcion}!`,
                    text: 'Has iniciado sesión exitosamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = data.redirect_url;
                });
            } else {
                mostrarError(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError(error.message || 'Error al conectar con el servidor. Por favor, intente nuevamente.');
        })
        .finally(() => {
            // Re-habilitar el botón de submit
            submitButton.disabled = false;
        });
    }

    function mostrarError(mensaje) {
        errorMessage.textContent = mensaje;
        errorMessage.style.display = 'block';
        
        // Ocultar el mensaje de error después de 5 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
});
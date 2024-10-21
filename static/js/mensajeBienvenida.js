document.addEventListener('DOMContentLoaded', function() {
    function mostrarMensajeBienvenida() {
        const user = JSON.parse(localStorage.getItem('user'));
        const showWelcome = localStorage.getItem('showWelcome');
        
        if (user && showWelcome === 'true') {
            Swal.fire({
                title: `Bienvenido, ${user.Descripcion}!`,
                text: 'Has iniciado sesión exitosamente.',
                icon: 'success'
            });
            localStorage.removeItem('showWelcome');  // Remover el flag para que no se muestre de nuevo al recargar
        }
    }

    function manejarEstadoSesion() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // Aquí puedes agregar lógica para manejar el estado de la sesión
            // Por ejemplo, mostrar/ocultar ciertos elementos según el nivel de acceso del usuario
            console.log('Usuario logueado:', user);
            // Ejemplo: document.getElementById('menuAdministrador').style.display = user.NivelAcceso >= 100 ? 'block' : 'none';
        } else {
            console.log('No hay usuario logueado');
            // Manejar el caso de no haber iniciado sesión, si es necesario
        }
    }

    mostrarMensajeBienvenida();
    manejarEstadoSesion();
});
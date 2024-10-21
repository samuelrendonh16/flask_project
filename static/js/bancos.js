const API_BASE_URL = 'https://migsistemasweb.com';

// Función para mostrar el panel de bancos
function mostrarPanelBancos() {
    const panelBancos = document.getElementById('panelBancos');
    panelBancos.style.display = 'block';
    //cargarBancos();
}

// Función para cargar los bancos desde el servidor
function cargarBancos() {
    fetch(`${API_BASE_URL}/api/bancos`)
        .then(response => response.json())
        .then(bancos => {
            const tbody = document.querySelector('#tablaBancos tbody');
            tbody.innerHTML = '';
            bancos.forEach(banco => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${banco.IdBanco}</td>
                    <td>${banco.Banco}</td>
                    <td>${banco.cuenta}</td>
                    <td><input type="checkbox" ${banco.Estado ? 'checked' : ''} disabled></td>
                `;
                tr.addEventListener('click', () => seleccionarBanco(banco));
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al cargar bancos:', error));
}

// Función para seleccionar un banco
function seleccionarBanco(banco) {
    document.getElementById('codigoBanco').value = banco.IdBanco;
    document.getElementById('descripcionBanco').value = banco.Banco;
    document.getElementById('cuentaBanco').value = banco.cuenta;
    document.getElementById('estadoBanco').checked = banco.Estado;
    habilitarCamposBanco(false);
    document.getElementById('btnEditarBanco').disabled = false;
    document.getElementById('btnGuardarBanco').disabled = true;
}

// Función para preparar un nuevo banco
function nuevoBanco() {
    document.getElementById('formBanco').reset();
    habilitarCamposBanco(true);
    document.getElementById('btnGuardarBanco').disabled = false;
    document.getElementById('btnEditarBanco').disabled = true;
}

// Función para guardar un banco
function guardarBanco() {
    const banco = {
        IdBanco: document.getElementById('codigoBanco').value,
        Banco: document.getElementById('descripcionBanco').value,
        cuenta: document.getElementById('cuentaBanco').value,
        Estado: document.getElementById('estadoBanco').checked
    };

    fetch(`${API_BASE_URL}/api/bancos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(banco),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Banco guardado:', data);
        //cargarBancos();
        habilitarCamposBanco(false);
        document.getElementById('btnGuardarBanco').disabled = true;
    })
    .catch((error) => {
        console.error('Error al guardar banco:', error);
    });
}

// Función para editar un banco
function editarBanco() {
    habilitarCamposBanco(true);
    document.getElementById('codigoBanco').disabled = true;
    document.getElementById('btnGuardarBanco').disabled = false;
}

// Función para cancelar la edición
function cancelarEdicionBanco() {
    document.getElementById('formBanco').reset();
    habilitarCamposBanco(false);
    document.getElementById('btnGuardarBanco').disabled = true;
    document.getElementById('btnEditarBanco').disabled = true;
}

// Función para cerrar el panel de bancos
function cerrarPanelBancos() {
    document.getElementById('panelBancos').style.display = 'none';
}

// Función para habilitar/deshabilitar campos del formulario
function habilitarCamposBanco(habilitar) {
    document.getElementById('codigoBanco').disabled = !habilitar;
    document.getElementById('descripcionBanco').disabled = !habilitar;
    document.getElementById('cuentaBanco').disabled = !habilitar;
    document.getElementById('estadoBanco').disabled = !habilitar;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnBancos').addEventListener('click', mostrarPanelBancos);
    document.getElementById('btnNuevoBanco').addEventListener('click', nuevoBanco);
    document.getElementById('btnGuardarBanco').addEventListener('click', guardarBanco);
    document.getElementById('btnEditarBanco').addEventListener('click', editarBanco);
    document.getElementById('btnCancelarBanco').addEventListener('click', cancelarEdicionBanco);
    document.getElementById('btnCerrarBancos').addEventListener('click', cerrarPanelBancos);
});
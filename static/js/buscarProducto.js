document.addEventListener('DOMContentLoaded', function() {
    const btnBuscarProducto = document.getElementById('btnBuscarProducto');
    const buscarProductoPanel = document.getElementById('buscarProductoPanel');
    const btnCerrarBusqueda = document.getElementById('btnCerrarBusqueda');
    const buscarProductoInput = document.getElementById('buscarProductoInput');
    const resultadosBusqueda = document.getElementById('resultadosBusqueda').getElementsByTagName('tbody')[0];
    const btnGuardarProducto = document.getElementById('btnGuardarProducto');
    const API_BASE_URL = 'https://migsistemasweb.com';

    // Estilos para los resultados de búsqueda
    const style = document.createElement('style');
    style.textContent = `
        #resultadosBusqueda tbody tr:hover {
            background-color: #f5f5f5;
            cursor: pointer;
        }
        #resultadosBusqueda tbody tr.selected {
            background-color: #e0e0e0;
        }
        .mensaje {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
        }
        .mensaje.success { background-color: #4CAF50; }
        .mensaje.error { background-color: #f44336; }
        #indicadorCarga {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 1001;
        }
    `;
    document.head.appendChild(style);

    btnBuscarProducto.addEventListener('click', function() {
        buscarProductoPanel.style.display = 'block';
        buscarProductos('');
    });

    btnCerrarBusqueda.addEventListener('click', function() {
        buscarProductoPanel.style.display = 'none';
        limpiarCamposFormulario();
    });

    let timeoutId;
    buscarProductoInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log('Buscando:', this.value);
            buscarProductos(this.value);
        }, 300);
    });

    btnGuardarProducto.addEventListener('click', guardarProducto);

    function buscarProductos(termino) {
        console.log('Iniciando búsqueda con término:', termino);
        mostrarIndicadorCarga(true);
        fetch(`${API_BASE_URL}/api/buscar_productos_editar?buscar=${encodeURIComponent(termino)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(productos => {
                console.log('Productos recibidos:', productos);
                mostrarResultadosProductos(productos);
            })
            .catch(error => {
                console.error('Error en la búsqueda:', error);
                mostrarMensaje('Error en la búsqueda: ' + error.message, 'error');
            })
            .finally(() => mostrarIndicadorCarga(false));
    }

    function mostrarResultadosProductos(productos) {
        resultadosBusqueda.innerHTML = '';
        if (productos.length === 0) {
            resultadosBusqueda.innerHTML = '<tr><td colspan="3">No se encontraron resultados</td></tr>';
            return;
        }
        productos.forEach(producto => {
            const row = resultadosBusqueda.insertRow();
            row.innerHTML = `
                <td>${producto.IdReferencia || ''}</td>
                <td>${producto.Referencia || ''}</td>
                <td>${producto.IdGrupo || ''}</td>
            `;
            row.addEventListener('click', () => cargarProducto(producto.IdReferencia));
        });
    }

    function cargarProducto(codigo) {
        mostrarIndicadorCarga(true);
        fetch(`${API_BASE_URL}/api/buscar_productos_editar/${encodeURIComponent(codigo)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Producto no encontrado');
                }
                return response.json();
            })
            .then(producto => {
                document.getElementById('codigo').value = producto.IdReferencia;
                document.getElementById('descripcion').value = producto.Referencia;
                document.getElementById('grupo').value = producto.IdGrupo;
                document.getElementById('subgrupo').value = producto.idsubgrupo || '';
                document.getElementById('subcategoria').value = producto.idsubcategoria || '';
                document.getElementById('unidad').value = producto.IdUnidad;
                document.getElementById('bodega').value = producto.idbodega || '';
                document.getElementById('costo').value = producto.Costo || '';
                document.getElementById('precioVenta1').value = producto.PrecioVenta1 || '';
                document.getElementById('iva').value = producto.IVA || '';
                document.getElementById('ubicacion').value = producto.Ubicacion || '';
                document.getElementById('marca').value = producto.Marca || '';
                document.getElementById('estadoProducto').value = producto.EstadoProducto || '';
                
                document.getElementById('esServicio').checked = producto.Tipo;
                document.getElementById('activo').checked = producto.Estado;
                document.getElementById('compuesto').checked = producto.compuesto || false;
                document.getElementById('agotado').checked = producto.productoagotado || false;
                document.getElementById('modificaPrecio').checked = producto.modificaprecio || false;
                
                habilitarCamposEdicion();
                mostrarMensaje('Producto cargado exitosamente', 'success');
                
                buscarProductoPanel.style.display = 'none';
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarMensaje('Error al cargar el producto: ' + error.message, 'error');
            })
            .finally(() => mostrarIndicadorCarga(false));
    }

    function habilitarCamposEdicion() {
        document.querySelectorAll('#maestroReferencias input, #maestroReferencias select').forEach(element => {
            if (element.id !== 'codigo') {
                element.disabled = false;
            }
        });
        document.getElementById('codigo').disabled = true;
        document.getElementById('btnGuardarProducto').disabled = false;
        document.getElementById('btnEditarProducto').disabled = true;
    }

    function limpiarCamposFormulario() {
        const campos = document.querySelectorAll('#maestroReferencias input, #maestroReferencias select');
        campos.forEach(campo => {
            if (campo.type === 'checkbox') {
                campo.checked = false;
            } else {
                campo.value = '';
            }
            campo.disabled = true;
        });
        document.getElementById('btnGuardarProducto').disabled = true;
        document.getElementById('btnEditarProducto').disabled = true;
    }

    function guardarProducto() {
        const producto = {
            IdReferencia: document.getElementById('codigo').value,
            Referencia: document.getElementById('descripcion').value,
            IdGrupo: document.getElementById('grupo').value,
            IdUnidad: document.getElementById('unidad').value,
            Ubicacion: document.getElementById('ubicacion').value,
            Costo: parseFloat(document.getElementById('costo').value) || 0,
            PrecioVenta1: parseFloat(document.getElementById('precioVenta1').value) || 0,
            IVA: parseFloat(document.getElementById('iva').value) || 0,
            Marca: document.getElementById('marca').value,
            EstadoProducto: document.getElementById('estadoProducto').value || null,
            Estado: document.getElementById('activo').checked,
            Tipo: document.getElementById('esServicio').checked,
            ManejaInventario: !document.getElementById('esServicio').checked,
            productoagotado: document.getElementById('agotado').checked,
            modificaprecio: document.getElementById('modificaPrecio').checked,
            idsubgrupo: document.getElementById('subgrupo').value || null,
            idsubcategoria: document.getElementById('subcategoria').value || null,
            idbodega: document.getElementById('bodega').value || null
        };
    
        fetch(`${API_BASE_URL}/api/referencias/${producto.IdReferencia}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            mostrarMensaje('Producto guardado exitosamente', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al guardar el producto: ' + error.message, 'error');
        });
    }

    function mostrarIndicadorCarga(mostrar) {
        const indicador = document.getElementById('indicadorCarga') || crearIndicadorCarga();
        indicador.style.display = mostrar ? 'block' : 'none';
    }

    function crearIndicadorCarga() {
        const indicador = document.createElement('div');
        indicador.id = 'indicadorCarga';
        indicador.textContent = 'Cargando...';
        indicador.style.position = 'fixed';
        indicador.style.top = '50%';
        indicador.style.left = '50%';
        indicador.style.transform = 'translate(-50%, -50%)';
        indicador.style.padding = '20px';
        indicador.style.background = 'rgba(0, 0, 0, 0.7)';
        indicador.style.color = 'white';
        indicador.style.borderRadius = '5px';
        indicador.style.zIndex = '1000';
        document.body.appendChild(indicador);
        return indicador;
    }

    function mostrarMensaje(mensaje, tipo) {
        const mensajeElement = document.createElement('div');
        mensajeElement.textContent = mensaje;
        mensajeElement.className = `mensaje ${tipo}`;
        document.body.appendChild(mensajeElement);
        setTimeout(() => mensajeElement.remove(), 3000);
    }
});
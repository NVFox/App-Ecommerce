const btnDirect = document.getElementById('btn-direct');
const btnCarrito = document.getElementById('btn-carrito');

const idArticulo = parseInt(window.location.pathname.replace("/producto/", ""));

const obtenerDatosProducto = async () => {
    const data = await fetch(window.location.pathname + "?request=true");
    const results = await data.json();

    const cantidad = document.getElementById('input-cantidad').value;

    if (results) {
        results.valorInicial = results.valorTotal
        results.cantidad = parseInt(cantidad);
        results.valorTotal = results.valorInicial * results.cantidad;
    }
    return results;
}

const Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
})

btnCarrito.addEventListener('click', async () => {
    if (localStorage.getItem('productos')) {
        const productos = JSON.parse(localStorage.getItem('productos'));
        const indexProducto = productos.findIndex(item => item.idArticulo === idArticulo);
        if (indexProducto >= 0) {
            const cantidad = document.getElementById('input-cantidad').value;
            const productoExistente = productos[indexProducto];
            productoExistente.cantidad += parseInt(cantidad);
            productoExistente.valorTotal = productoExistente.valorInicial * productoExistente.cantidad;

            await Toast.fire({
                icon: "success",
                title: "La cantidad de " + productoExistente.nombre + " se ha modificado! (" + productoExistente.cantidad + " unidades)"
            })
        } else {
            const producto = await obtenerDatosProducto();
            productos.push(producto);

            await Toast.fire({
                icon: "success",
                title: producto.nombre + " se ha agregado al carrito!"
            })
        }
        localStorage.setItem('productos', JSON.stringify(productos));
    } else {
        const producto = await obtenerDatosProducto();
        localStorage.setItem('productos', JSON.stringify([producto]));

        await Toast.fire({
            icon: "success",
            title: producto.nombre + " se ha agregado al carrito!"
        })
    }
})

btnDirect.addEventListener("click", async() => {
    const producto = await obtenerDatosProducto();
    localStorage.setItem('producto', JSON.stringify([producto]));

    const newProductos = JSON.parse(localStorage.getItem("producto"));
    const peticion = await fetch("/create-checkout-session/unique", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newProductos)
    })
    const { url } = await peticion.json();
    window.location = url;
})

document.addEventListener("click", async e => {
    if (e.target.matches(".like-icon")) {
        const compradoresText = document.getElementById("compradores");
        let cantidad = parseInt(compradoresText.textContent.replace(/\D+/g, ""));

        if (e.target.classList.contains("calificado")) {
            if (isNaN(cantidad)) cantidad = 0; 
            cantidad--;
        } else {
            if (isNaN(cantidad)) cantidad = 0;
            cantidad++;
        }

        const cantidadClientes = cantidad === 1 ? 'cliente recomienda' : 'clientes recomiendan';
        compradoresText.textContent = cantidad > 0 ? `${cantidad} ${cantidadClientes} este producto` : 'No hay calificaciones positivas todavía'

        e.target.classList.toggle("calificado")
        
        const results = await fetch("/calificacion/" + id);
        const data = await results.json()
        await Toast.fire(data)
    }
})
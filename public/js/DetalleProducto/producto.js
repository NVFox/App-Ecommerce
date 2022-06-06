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

/*const articulo = {
    idArticulo: idArticulo,
    nombre: nombreArticulo,
    nombreVendedor: ,
    descripcion: "text",
    imagen: "file",
    comision: "number",
    valorInicial: "number",
    valorTotal: "number",
    cantidad: "number"
} */

btnCarrito.addEventListener('click', async () => {
    if (localStorage.getItem('productos')) {
        const productos = JSON.parse(localStorage.getItem('productos'));
        const indexProducto = productos.findIndex(item => item.idArticulo === idArticulo);
        if (indexProducto >= 0) {
            const cantidad = document.getElementById('input-cantidad').value;
            const productoExistente = productos[indexProducto];
            productoExistente.cantidad += parseInt(cantidad);
            productoExistente.valorTotal = productoExistente.valorInicial * productoExistente.cantidad;
        } else {
            const producto = await obtenerDatosProducto();
            productos.push(producto);
        }
        localStorage.setItem('productos', JSON.stringify(productos));
    } else {
        const producto = await obtenerDatosProducto();
        localStorage.setItem('productos', JSON.stringify([producto]));
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
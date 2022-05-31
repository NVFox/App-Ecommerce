const btnDirect = document.getElementById('btn-direct');
const btnCarrito = document.getElementById('btn-carrito');

const cantidad = document.getElementById('input-cantidad').value;
const idArticulo = parseInt(window.location.pathname.replace("producto/", ""));

const obtenerDatosProducto = async () => {
    const data = await fetch(window.location.pathname + "?request=true");
    const results = await data.json();
    if (results?.length > 0) {
        results.valorInicial = results.valorTotal
        results.cantidad = 1;
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
        if (indexProducto !== -1) {
            const productoExistente = productos[indexProducto];
            productoExistente.cantidad = parseInt(cantidad);
            productoExistente.valorTotal = productoExistente.valorInicial * productoExistente.cantidad;
        } else {
            const producto = await obtenerDatosProducto();
            productos.push(producto);
        }
        localStorage.setItem('productos', JSON.stringify(productos));
    } else {
        const producto = await obtenerDatosProducto();
        console.log(producto);
        localStorage.setItem('productos', JSON.stringify([producto]));
    }
}) 
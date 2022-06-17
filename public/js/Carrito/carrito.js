const template = document.getElementById('template-producto').content;
const container = document.getElementById('container-productos');
const totalCompra = document.querySelector(".t2 h1");
const fragment = document.createDocumentFragment();
const productos = JSON.parse(localStorage.getItem("productos"));

const btnCompra = document.getElementById("btn-compra");

document.addEventListener("DOMContentLoaded", async() => {
    if (!productos) {
        await Swal.fire(
            "No hay productos en el carrito", 
            "Empieza a buscar nuevas obras!", 
            "info"
        )
        history.back()
    }
})

totalCompra.textContent = productos ? productos.reduce((a, b) => a + b.valorTotal, 0) + " COP" : "0 COP";

const crearProducto = (producto) => {
    template.querySelector('.producto').id = `producto-${producto.idArticulo}`;

    template.querySelector('.img img').src = `/img/${producto.imagen}`;
    template.querySelector('.img img').alt = producto.nombre;

    template.querySelector('span .nombre-articulo').textContent = producto.nombre;
    template.querySelector('span i').textContent = `Precio: ${producto.valorTotal}`;
    template.querySelector('span h2').textContent = producto.nombreVendedor;
    //template.querySelector('span h3').textContent = "Lo mas vendido"; falta implementar consulta

    template.querySelector('input.btn-eliminar').id = `btn-eliminar-producto-${producto.idArticulo}`;
    template.querySelector('input.cantidad-producto').id = `cantidad-${producto.idArticulo}`;
    template.querySelector('input.cantidad-producto').value = producto.cantidad;
    template.querySelector('i.precio-producto').id = `precio-${producto.idArticulo}`

    return template.cloneNode(true);
}

productos?.map((producto) => {
    const newProduct = crearProducto(producto);
    fragment.appendChild(newProduct);
})

container.appendChild(fragment);

document.addEventListener("click", (e) => {
    if (e.target.matches(".btn-eliminar")) {
        const newProductos = JSON.parse(localStorage.getItem("productos"));
        const idProducto = parseInt(e.target.id.replace("btn-eliminar-producto-", ""));

        const indexProducto = newProductos.findIndex(item => item.idArticulo === idProducto);
        newProductos.splice(indexProducto, 1);
        localStorage.setItem("productos", JSON.stringify(newProductos));

        container.removeChild(document.getElementById(`producto-${idProducto}`));

        totalCompra.textContent = productos.length > 0 ? newProductos.reduce((a, b) => a + b.valorTotal, 0) + " COP" : "0 COP";
    }
})

const changeQuantity = (e) => {
    if (e.target.matches(".cantidad-producto")) {
        const newProductos = JSON.parse(localStorage.getItem("productos"));
        const idProducto = parseInt(e.target.id.replace("cantidad-", ""));

        const indexProducto = newProductos.findIndex(item => item.idArticulo === idProducto);
        const currentProducto = newProductos[indexProducto];
        currentProducto.cantidad = parseInt(e.target.value);
        currentProducto.valorTotal = currentProducto.valorInicial * currentProducto.cantidad;

        document.getElementById(`precio-${idProducto}`).textContent = `Precio: ${currentProducto.valorTotal}`;
        totalCompra.textContent = newProductos.reduce((a, b) => a + b.valorTotal, 0) + " COP";

        localStorage.setItem("productos", JSON.stringify(newProductos));
    }
}

document.addEventListener("input", changeQuantity);

btnCompra.addEventListener("click", async () => {
    const newProductos = JSON.parse(localStorage.getItem("productos"));
    const peticion = await fetch("/create-checkout-session/multiple", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newProductos)
    })
    const { url } = await peticion.json();
    window.location = url;
})
const template = document.getElementById('template-producto').content;
const container = document.getElementById('container-productos');
const fragment = document.createDocumentFragment();
const productos = JSON.parse(localStorage.getItem("productos"));

const crearProducto = (producto) => {
    template.querySelector('.producto').id = `producto-${producto.idArticulo}`;

    //template.querySelector('.img img').src = producto.imagen;
    template.querySelector('.img img').alt = producto.nombre;

    template.querySelector('span .nombre-articulo').textContent = producto.nombre;
    template.querySelector('span i').textContent = `Precio: ${producto.valorTotal}`;
    template.querySelector('span h2').textContent = producto.nombreVendedor;
    //template.querySelector('span h3').textContent = "Lo mas vendido"; falta implementar consulta

    template.querySelector('span input').id = `btn-eliminar-producto-${producto.idArticulo}`;

    return template.cloneNode(true);
}

productos.map((producto) => {
    const newProduct = crearProducto(producto);
    fragment.appendChild(newProduct);
})

container.appendChild(fragment);
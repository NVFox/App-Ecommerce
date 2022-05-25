import { crearProducto } from "./producto";

const articulo = {
    idArticulo: "number",
    nombre: "text",
    nombreVendedor: "text",
    descripcion: "text",
    imagen: "file",
    comision: "number",
    valorInicial: "number",
    valorTotal: "number",
    cantidad: "number"
}

const fragment = document.createDocumentFragment();
const productos = JSON.parse(localStorage.getItem("productos"));

productos.map((producto, n) => {
    crearProducto(producto, n, fragment);
})

document.appendChild(fragment);
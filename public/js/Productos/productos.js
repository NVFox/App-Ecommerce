const obtenerProductos = async () => {
    const peticion = await fetch("/registros/articulos");
    return peticion.json();
}

let productos = [];
let newProductos = [];

const Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
})

document.addEventListener("DOMContentLoaded", async () => {
    productos = await obtenerProductos();
})

document.addEventListener("click", async e => {
    if (e.target.closest(".con-card")) {
        const parentNode = e.target.closest(".con-card");
        const id = parentNode.id.replace("card-", "")
        window.location.href = "/producto/" + id
    }
    if (e.target.closest(".bloque") && !e.target.matches(".like-icon")) {
        const parentNode = e.target.closest(".bloque");
        const id = parentNode.id.replace("producto-", "")
        window.location.href = "/producto/" + id
    }
    if (e.target.matches(".btn-filtro")) {
        const cardsProducto = [].slice.call(document.querySelectorAll(".bloque"));
        cardsProducto.map(item => item.style.display = "initial")

        newProductos = [...productos.results]
        const filtros = [].slice.call(document.querySelectorAll(".filtro")).filter(item => (item.value.length > 0 && item.type !== "radio") || (item?.checked && item.type === "radio") || (item.type === "range" && item.value != "0"));

        filtros.map(item => {
            if (!item.name.includes("valorTotal")) {
                newProductos = newProductos.filter(producto => producto[item.name].toString().includes(item.value));
            } else {
                newProductos = item.name === "min-valorTotal"
                ? newProductos.filter(producto => producto.valorTotal >= item.value)
                : newProductos.filter(producto => producto.valorTotal <= item.value)
            }
        })
        
        const elementosSinCoincidencias = cardsProducto.filter(card => !newProductos.map(item => item.idArticulo).includes(parseInt(card.id.replace("producto-", ""))));
        elementosSinCoincidencias.map(item => item.style.display = "none")
    }

    if (e.target.matches(".like-icon")) {
        const parentNode = e.target.closest(".bloque");
        const id = parentNode.id.replace("producto-", "")
        e.target.classList.toggle("calificado")

        const results = await fetch("/calificacion/" + id);
        const data = await results.json()
        await Toast.fire(data)
    }
})
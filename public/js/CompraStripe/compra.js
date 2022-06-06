const realizarCompra = async (itemName) => {
    const newProductos = JSON.parse(localStorage.getItem(itemName));
    const peticion = await fetch("/success", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newProductos)
    })

    await Swal.fire(
        "Se ha realizado la compra exitosamente",
        "Ya se encuentra registrada en el sistema",
        "success"
    )

    localStorage.removeItem(itemName);

    const { url } = await peticion.json();
    window.location = url;
}

const nombreItem = window.location.pathname.replace("/success/", "") === "unique" ? "producto" : "productos";
realizarCompra(nombreItem);
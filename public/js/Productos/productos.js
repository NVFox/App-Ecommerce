document.addEventListener("click", e => {
    if (e.target.closest(".con-card")) {
        const parentNode = e.target.closest(".con-card");
        const id = parentNode.id.replace("card-", "")
        window.location.href = "/producto/" + id
    }
    if (e.target.closest(".bloque")) {
        const parentNode = e.target.closest(".bloque");
        const id = parentNode.id.replace("producto-", "")
        window.location.href = "/producto/" + id
    }
})
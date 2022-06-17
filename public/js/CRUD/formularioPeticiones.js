document.addEventListener("change", async e => {
    if (e.target.matches(".estado-peticion")) {
        const id = e.target.id.replace("estado-peticion-", "");
        const results = await fetch("/peticion/" + id + "?estado=" + e.target.value);
        const dataAlert = await results.json()
        await Swal.fire(dataAlert)
    }
})
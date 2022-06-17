const Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
})

document.addEventListener("click", async e => {
    if (e.target.closest(".enlace") && e.target.matches(".like-icon")) {
        e.preventDefault();

        const parentNode = e.target.closest(".enlace");
        const id = parentNode.id.replace("enlace-", "").replace(/-\d+/, "")
        e.target.classList.toggle("calificado")
        
        const results = await fetch("/calificacion/" + id);
        const data = await results.json()
        await Toast.fire(data)
    }
})
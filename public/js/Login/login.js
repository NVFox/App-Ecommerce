const formRegistro = document.getElementById("form-registro");
const formLogin = document.getElementById("form-login");

const loginData = {};
const registroData = {};

document.addEventListener("input", e => {
    if (e.target.matches(".form__input")) {
        if (e.target.closest("#" + formLogin.id)) {
            loginData[e.target.name] = e.target.value;
        }
        if (e.target.closest("#" + formRegistro.id)) {
            registroData[e.target.name] = e.target.type === "file" ? e.target.files[0] : e.target.value;
            console.log(registroData)
        }
    }
})

formLogin.addEventListener("submit", async e => {
    e.preventDefault()

    const peticion = await fetch("/login/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginData)
    })

    const results = await peticion.json();
    const { title, message, type, url } = results;

    await Swal.fire(
        title,
        message,
        type
    )

    if (type === "error") {
        location.reload()
    } else {
        location.href = url
    }
});

formRegistro.addEventListener("submit", async e => {
    e.preventDefault()

    const peticion = await fetch("/registro_usuarios/verify", {
        method: "POST",
        body: new FormData(formRegistro)
    })

    const results = await peticion.json();
    const { title, message, type } = results;

    await Swal.fire(
        title,
        message,
        type
    )
    
    location.reload()
});
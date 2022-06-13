const nombreTabla = location.pathname.replace("/data/", "");
const campoPrincipal = document.querySelector(".field");
const campos = [].slice.call(document.querySelectorAll(".field"));
const formulario = document.getElementById("formDatos");

const formFields = [].slice.call(document.querySelectorAll(".sub-btn"));
const [ btnInsertar, btnEliminar, btnActualizar, btnConsultar ] = formFields;

const data = {};
let isMultipart = campos.some(item => item.type === "file");

const insertarRegistro = async () => {
    if (Object.keys(data).length === campos.length && campos.every(item => item.value.length > 0)) {
        const objPeticion = {
            method: "POST",
            body: isMultipart ? new FormData(formulario) : JSON.stringify(data)
        }

        if (!isMultipart) objPeticion.headers = {"Content-Type": "application/json"}

        const peticion = await fetch(`/registro/${isMultipart ? "multipart/" : "encoded/"}${nombreTabla}`, objPeticion)
    
        const results = await peticion.json();
        const { title, message, type } = results;
        await Swal.fire(title, message, type)
    
        location.reload();
    } else {
        await Swal.fire("Rellene todos los campos", "No puede realizarse la operación", "error")
    }
}

const actualizarRegistro = async () => {
    if (campoPrincipal.value.length > 0 && campos.some(item => item.value.length > 0 && item.name !== campoPrincipal.name )) {
        isMultipart = campos.filter(item => item.type === "file").some(item => item.value.length > 0);

        const objPeticion = {
            method: "PUT",
            body: isMultipart ? new FormData(formulario) : JSON.stringify(data)
        }

        if (!isMultipart) objPeticion.headers = {"Content-Type": "application/json"}

        const peticion = await fetch(`/registro/${isMultipart ? "multipart/" : "encoded/"}${nombreTabla}?${campoPrincipal.name}=${campoPrincipal.value}`, objPeticion)
    
        const results = await peticion.json();
        const { title, message, type } = results;
        await Swal.fire(title, message, type)
    
        location.reload();
    } else {
        await Swal.fire("Rellene más de un campo", "No puede realizarse la operación", "error")
    }
}

const eliminarRegistro = async () => {
    if (campoPrincipal.value.length > 0) {
        const peticion = await fetch(`/registro/${nombreTabla}?${campoPrincipal.name}=${campoPrincipal.value}`, {
            method: "DELETE",
        })
    
        const results = await peticion.json();
        const { title, message, type } = results;
        await Swal.fire(title, message, type)
    
        location.reload();
    } else {
        await Swal.fire("Rellene el campo de Id", "No puede realizarse la operación", "error")
    }
}

formulario.addEventListener("submit", e => e.preventDefault());

document.addEventListener("input", e => {
    if (e.target.matches(".field")) {
        if (e.target.type === "file") {
            data[e.target.name] = e.target.files[0]
        } else {
            data[e.target.name] = e.target.value
        }
        console.log(data);
    }
})

btnInsertar.addEventListener("click", insertarRegistro);
btnActualizar.addEventListener("click", actualizarRegistro);
btnEliminar.addEventListener("click", eliminarRegistro);
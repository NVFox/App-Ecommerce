const nombreTabla = location.pathname.replace("/data/", "");
const campoPrincipal = document.querySelector(".field");
const campos = [].slice.call(document.querySelectorAll(".field"));
const formulario = document.getElementById("formDatos");

const btnInsertar = document.getElementById("btn-ingresar");
const btnEliminar = document.getElementById("btn-eliminar");
const btnActualizar = document.getElementById("btn-actualizar");
const btnConsultar = document.getElementById("btn-consultar");

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

        let query = "";

        const objPeticion = {
            method: "PUT",
            body: isMultipart ? new FormData(formulario) : JSON.stringify(data)
        }

        if (!isMultipart) objPeticion.headers = {"Content-Type": "application/json"}

        if (!btnActualizar.classList.contains("buton")) {
            query = `/registro/${isMultipart ? "multipart/" : "encoded/"}${nombreTabla}?${campoPrincipal.name}=${campoPrincipal.value}`
        } else {
            query = `/registro/${isMultipart ? "multipart/" : "encoded/"}usuarios?idUsuario=${location.pathname.replace("/perfil/", "")}`
        }

        const peticion = await fetch(query, objPeticion)
    
        const results = await peticion.json();
        const { title, message, type } = results;
        await Swal.fire(title, message, type)
    
        if (btnActualizar.classList.contains("buton")) {
            location.href = "/cerrar"
        } else {
            location.reload()
        } 
    } else {
        await Swal.fire("Rellene más de un campo", "No puede realizarse la operación", "error")
    }
}

const eliminarRegistro = async () => {
    if (campoPrincipal.value.length > 0) {
        let query = "";

        if (btnEliminar.classList.contains("buton")) {
            query = `/registro/${nombreTabla}?${campoPrincipal.name}=${campoPrincipal.value}`
        } else {
            query = `/registro/usuarios?idUsuario=${location.pathname.replace("/perfil/", "")}`
        }

        const peticion = await fetch(query, {
            method: "DELETE",
        })
    
        const results = await peticion.json();
        const { title, message, type } = results;
        await Swal.fire(title, message, type)
    
        if (!btnEliminar.classList.contains("buton")) {
            location.href = "/cerrar"
        } else {
            location.reload()
        } 
    } else {
        await Swal.fire("Rellene el campo de Id", "No puede realizarse la operación", "error")
    }
}

const consultarRegistro = async () => {
    if (campoPrincipal.value.length > 0) {
        const peticion = await fetch(`/registro/${nombreTabla}?${campoPrincipal.name}=${campoPrincipal.value}`)
    
        const results = await peticion.json();
        const [ queryData, { title, message, type } ] = results;

        if (queryData) {
            campos.map(item => {
                if (item.name !== "imagen") item.value = item.name.match(/fecha/i) ? queryData[item.name].replace(/T[\.:\w]+/g, "") : queryData[item.name]
                if (item.name !== "imagen") data[item.name] = item.name.match(/fecha/i) ? queryData[item.name].replace(/T[\.:\w]+/g, "") : queryData[item.name]
            })
        }

        console.log(data)

        await Swal.fire(title, message, type)
        
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

if (btnConsultar) btnConsultar.addEventListener("click", consultarRegistro)
if (btnInsertar) btnInsertar.addEventListener("click", insertarRegistro);
if (btnActualizar) btnActualizar.addEventListener("click", actualizarRegistro);
if (btnEliminar) btnEliminar.addEventListener("click", eliminarRegistro);
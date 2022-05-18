const models = {};
const consultas = {};

models.usuarios = {
    Administrador: {
        idUsuario: "number",
        nombreUsuario: "text",
        clave: "password",
        rol: {
            tabla: "roles",
            campo: "nombreRol"
        },
        edad: "number",
        domicilio: "text",
        correo: "email",
        numeroTelefono: "text",
        sexo: ["M", "F"]
    }
}

models.articulos = {
    Vendedor: {
        idArticulo: "number",
        nombre: "text",
        descripcion: "text",
        imagen: "file",
        comision: "number",
        valorInicial: "number",
        valorTotal: "number"
    }
}

models.ventas = {
    Administrador: {
        idVenta: "number",
        idComprador: {
            tabla: "usuarios",
            campo: "idUsuario"
        },
        fechaVenta: "date",
        ivaVenta: "number",
        valorInicial: "number",
        valorTotal: "number"
    }
}

models.peticiones = {
    Cliente: {
        idDetalle: {
            tabla: "detallesventa",
            campo: "idDetalle",
            args: "WHERE idVenta IN (SELECT idVenta * FROM ventas WHERE idComprador = ?)"
        },
        asunto: "text",
        descripcion: "text",
        evidencia: "file"
    }
}

consultas.Administrador = {
    usuarios: `SELECT * FROM usuarios`,
    articulos: `SELECT * FROM articulos`,
    ventas: `SELECT * FROM ventas`
}

consultas.Vendedor = {
    articulos: `SELECT * FROM articulos WHERE idVendedor = ?`,
    detallesventa: `SELECT idDetalle FROM detallesventa WHERE idArticulo IN (SELECT idArticulo FROM articulos WHERE idVendedor = ?)`,
    peticiones: `SELECT * FROM peticiones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idArticulo IN (SELECT idArticulo FROM articulos WHERE idVendedor = ?))`
}

consultas.Cliente = {
    articulos: `SELECT * FROM articulos`,
    ventas: `SELECT * FROM ventas WHERE idComprador = ?`,
    detallesventa: `SELECT * FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?)`,
    calificaciones: `SELECT * FROM calificaciones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?))`,
    peticiones: `SELECT * FROM peticiones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?))`
}

module.exports = {
    models: models,
    consultas: consultas
};
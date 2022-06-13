const models = {};
const consultas = {};
const enlaces = {};

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
        sexo: ["M", "F"],
        imagen: "file"
    }
}

models.articulos = {
    Vendedor: {
        idArticulo: "number",
        nombre: "text",
        descripcion: "text",
        comision: "number",
        valorInicial: "number",
        valorTotal: "number",
        imagen: "file"
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
        valorTotal: "number"
    }
}

models.peticiones = {
    Cliente: {
        idDetalle: {
            tabla: "detallesventa",
            campo: "idDetalle",
            args: "WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?)"
        },
        asunto: "text",
        descripcion: "text",
        imagen: "file"
    }
}

consultas.Administrador = {
    usuarios: `SELECT * FROM usuarios`,
    articulos: `SELECT * FROM articulos`,
    ventas: `SELECT * FROM ventas`
}

consultas.Vendedor = {
    articulos: `SELECT * FROM articulos WHERE idVendedor = ?`,
    detallesventa: `SELECT * FROM detallesventa WHERE idArticulo IN (SELECT idArticulo FROM articulos WHERE idVendedor = ?)`,
    peticiones: `SELECT * FROM peticiones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idArticulo IN (SELECT idArticulo FROM articulos WHERE idVendedor = ?))`
}

consultas.Cliente = {
    articulos: `SELECT * FROM articulos`,
    ventas: `SELECT * FROM ventas WHERE idComprador = ?`,
    detallesventa: `SELECT * FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?)`,
    calificaciones: `SELECT * FROM calificaciones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?))`,
    peticiones: `SELECT * FROM peticiones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?))`
}

enlaces.Administrador = {
    usuarios: {
        nombre: `Usuarios`,
        url: `/data/usuarios`
    },
    articulos: {
        nombre: "Productos",
        url: `/data/articulos`
    },
    ventas: {
        nombre: "Ventas",
        url: `/data/ventas`
    }
}

enlaces.Vendedor = {
    articulos: {
        nombre: "Productos",
        url: `/data/articulos`
    },
    detallesventa: {
        nombre: "Detalles de Venta",
        url: `/data/detallesventa`
    },
    peticiones: {
        nombre: "Peticiones",
        url: `/data/peticiones`
    }
}

enlaces.Cliente = {
    articulos: {
        nombre: "Productos",
        url: `/productos`
    },
    ventas: {
        nombre: "Compras",
        url: `/data/ventas`
    },
    detallesventa: {
        nombre: "Detalles de Venta",
        url: `/data/detallesventa`
    },
    calificaciones: {
        nombre: "Calificaciones",
        url: `/data/calificaciones`
    },
    peticiones: {
        nombre: "Peticiones",
        url: `/data/peticiones`
    }
}

module.exports = {
    models: models,
    consultas: consultas,
    enlaces: enlaces
};
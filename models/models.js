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
        categoria: "text",
        descripcion: "text",
        valorInicial: "number",
        imagen: "file"
    }
}

models.ventas = {
    Administrador: {
        idVenta: "number",
        idComprador: {
            tabla: "usuarios u INNER JOIN ventas v ON u.idUsuario = v.idComprador",
            campo: "idUsuario"
        },
        fechaVenta: "date",
        valorTotal: "number"
    }
}

models.peticiones = {
    Cliente: {
        idPeticion: "number",
        idVenta: {
            tabla: "ventas",
            campo: "idVenta"
        },
        asunto: "text",
        descripcion: "text",
        imagen: "file"
    }
}

consultas.Administrador = {
    usuarios: `SELECT * FROM usuarios`,
    articulos: `SELECT * FROM articulos`,
    ventas: `SELECT * FROM ventas`,
    peticiones: `SELECT * FROM peticiones`
}

consultas.Vendedor = {
    articulos: `SELECT * FROM articulos WHERE idVendedor = ?`,
    detallesventa: `SELECT * FROM detallesventa WHERE idArticulo IN (SELECT idArticulo FROM articulos WHERE idVendedor = ?)`,
    peticiones: `SELECT * FROM peticiones WHERE idVenta IN (SELECT idVenta FROM detallesventa WHERE idArticulo IN (SELECT idArticulo FROM articulos WHERE idVendedor = ?))`
}

consultas.Cliente = {
    calificaciones: `SELECT * FROM calificaciones WHERE idDetalle IN (SELECT idDetalle FROM detallesventa WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?))`,
    peticiones: `SELECT * FROM peticiones WHERE idVenta IN (SELECT idVenta FROM ventas WHERE idComprador = ?)`
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
    },
    peticiones: {
        nombre: "Peticiones",
        url: `/data/peticiones`
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
        url: `/compras`
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
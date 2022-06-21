const { replaceObjectValues, getLastId, getFullDate, remapObjectProps } = require("../utilities/controllerUtilities");
const { connection, query, queryWithParams } = require("../connection/connection");
const { models, consultas, enlaces } = require("../models/models");
const { baseModels, defaultValuesModels } = require("../models/baseModels");
const filters = require("../models/filters");
const fs = require("fs");
const path = require("path");

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

module.exports = {
    renderInicio: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                const { idUsuario, nombreUsuario, imagen, rol } = req.session.dataLogin;
                const conn = await connection(req);
                const products = await query("SELECT * FROM articulos", conn);
                const productosComprados = await queryWithParams("SELECT d.idArticulo FROM detallesventa d INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ?", [idUsuario], conn);
                const calificacionesPositivas = await queryWithParams("SELECT d.idArticulo FROM calificaciones c INNER JOIN detallesventa d ON c.idDetalle = d.idDetalle INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ? AND recomendado = 1", [idUsuario], conn);
                res.render("index", {
                    products: products,
                    compras: productosComprados.map(item => item.idArticulo),
                    calificaciones: calificacionesPositivas.map(item => item.idArticulo),
                    loggedIn: true,
                    session: { idUsuario, nombreUsuario, imagen, rol },
                    pages: Object.values(enlaces[rol]),
                });
            } else {
                res.render("index", {
                    loggedIn: false,
                    pages: [{nombre: "Iniciar Sesión", url: "/login"}],
                })
            }
        } catch (err) {
            console.log(err);
        }
    },
    renderLogin: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                res.render("login", {
                    logged: true
                })
            } else {
                res.render("login", {
                    logged: false
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    realizarLogin: async (req, res) => {
        const dataLogin = req.body;
        const { nombreUsuario, clave } = dataLogin;

        try {
            const conn = await connection(req);
            const results = await queryWithParams("SELECT * FROM usuarios WHERE nombreUsuario = ? AND clave = ?", [nombreUsuario, clave], conn);
            if (results.length > 0) {
                req.session.dataLogin = results[0];
                req.session.loggedIn = true;
                res.json({
                    url: Object.values(enlaces[results[0].rol])[0]["url"],
                    title: "Bievenido a Ecultural",
                    message: "Se ha iniciado sesión correctamente",
                    type: "success"
                })
            } else {
                res.json({
                    url: "reload",
                    title: "Hubo un problema",
                    message: "Datos incorrectos o inexistentes",
                    type: "error"
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    registroUsuario: async (req, res) => {
        let data = JSON.parse(JSON.stringify(req.body));

        if (req.file?.filename) data[req.file.fieldname] = req.file.filename;
        console.log(data)
        
        try {
            const conn = await connection(req);
            await queryWithParams(`INSERT INTO usuarios SET ?`, [data], conn);
            res.json({
                title: "Su usuario se ha creado",
                message: "Ya se encuentra registrado en el sistema",
                type: "success"
            })
        } catch (e) {
            res.json({
                title: "Error en creación de usuario",
                message: "Intente de Nuevo (Mensaje de error: " + e + ")",
                type: "error"
            })
        }
    },
    renderFormulario: async (req, res) => {
        const { tabla } = req.params;
        const model = models[tabla];
        let modelRol;
        try {
            if (req.session.loggedIn) {
                const { rol, idUsuario, nombreUsuario, imagen } = req.session.dataLogin;

                if (Object.keys(consultas[rol]).includes(tabla)) {
                    const conn = await connection(req);

                    const results = rol === "Administrador" ? await query(consultas[rol][tabla], conn)
                    : await queryWithParams(consultas[rol][tabla], [idUsuario], conn);

                    if (model) modelRol = await replaceObjectValues(model[rol], idUsuario, conn);

                    res.render("formulario", {
                        nombreTabla: tabla,
                        data: results,
                        session: { idUsuario, nombreUsuario, imagen, rol },
                        model: modelRol ? modelRol : "no existe",
                        pages: Object.values(enlaces[rol]),
                    })
                } else {
                    res.render("NoAutorizado", {
                        title: 'No está autorizado',
                        message: 'No está autorizado para consultar este apartado',
                        type: 'warning',
                        redirect: 'back'
                    }
                    );
                }
            } else {
                res.render("NoAutorizado", {
                    title: 'No está autorizado',
                    message: 'Debe iniciar sesión para continuar',
                    type: 'warning',
                    redirect: '/login'
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    obtenerRegistros: async (req, res) => {
        const { tabla } = req.params;
        try {
            const conn = await connection(req);
            const results = await query(`SELECT ${tabla}.*, ${tabla === "articulos" ? "u.nombreUsuario AS nombreVendedor" : ""} FROM ${tabla} ${tabla === "articulos" ? 'INNER JOIN usuarios u ON idVendedor = idUsuario' : ''}`, conn);
            res.json({ results })
        } catch (error) {
            console.log(error)
        }
    },
    obtenerProducto: async (req, res) => {
        const { id } = req.params;
        try {
            if (req.session.loggedIn) {
                const { rol, idUsuario, nombreUsuario, imagen } = req.session.dataLogin;
                const conn = await connection(req);
                const productoComprado = await queryWithParams("SELECT d.idArticulo FROM detallesventa d INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ? AND d.idArticulo = ?", [idUsuario, id], conn);
                const calificacionesPositivas = await queryWithParams("SELECT d.idArticulo FROM calificaciones c INNER JOIN detallesventa d ON c.idDetalle = d.idDetalle INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE d.idArticulo = ? AND recomendado = 1", [id], conn);
                const calificacionCliente = await queryWithParams("SELECT d.idArticulo FROM calificaciones c INNER JOIN detallesventa d ON c.idDetalle = d.idDetalle INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE v.idComprador = ? AND recomendado = 1", [idUsuario], conn);
                const results = await queryWithParams("SELECT a.*, u.nombreUsuario AS nombreVendedor, u.correo, u.numeroTelefono FROM articulos a INNER JOIN usuarios u ON a.idVendedor = u.idUsuario WHERE idArticulo = ?", [id], conn);
                if (req.query?.request) {
                    res.json(results[0]);
                } else {
                    res.render("producto", {
                        compra: productoComprado.length > 0,
                        calificaciones: calificacionesPositivas.length,
                        calificacionCliente: calificacionCliente.map(item => item.idArticulo),
                        data: results[0],
                        session: { idUsuario, nombreUsuario, imagen, rol },
                        pages: Object.values(enlaces[rol]),
                    })
                }
            } else {
                res.redirect("/login");
            }
            
        } catch (err) {
            console.log(err);
        }
    },
    obtenerVentas: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                const { rol, idUsuario, nombreUsuario, imagen } = req.session.dataLogin;
                const conn = await connection(req);
                const compras = await queryWithParams("SELECT * FROM ventas WHERE idComprador = ?", [idUsuario], conn);
                const calificacionesPositivas = await queryWithParams("SELECT d.idArticulo FROM calificaciones c INNER JOIN detallesventa d ON c.idDetalle = d.idDetalle INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ? AND recomendado = 1", [idUsuario], conn);
                const productosComprados = await queryWithParams("SELECT a.*, d.idVenta, d.idDetalle, d.cantidad, d.valorTotal AS valorCantidad FROM detallesventa d INNER JOIN ventas v ON d.idVenta = v.idVenta INNER JOIN articulos a ON d.idArticulo = a.idArticulo WHERE idComprador = ? ORDER BY d.idVenta ASC", [idUsuario], conn);

                res.render("compras", {
                    compras: compras,
                    calificaciones: calificacionesPositivas.map(item => item.idArticulo),
                    productos: productosComprados,
                    session: { idUsuario, nombreUsuario, imagen, rol },
                    pages: Object.values(enlaces[rol]),
                })
            } else {
                res.redirect("/login");
            }
            
        } catch (err) {
            console.log(err);
        }
    },
    renderCarrito: (req, res) => {
        req.session.loggedIn ? res.render("carrito", {pages: Object.values(enlaces[req.session.dataLogin["rol"]]), session: { idUsuario: req.session.dataLogin["idUsuario"], nombreUsuario: req.session.dataLogin["nombreUsuario"], imagen: req.session.dataLogin["imagen"], rol: req.session.dataLogin["rol"]}}) : res.redirect("/login")
    },
    renderProductos: async (req, res) => {
        if (req.session.loggedIn) {
            try {
                const { idUsuario, nombreUsuario, imagen, rol } = req.session.dataLogin;
                const conn = await connection(req);
                const results = await query("SELECT u.nombreUsuario AS nombreVendedor, a.* FROM articulos a INNER JOIN usuarios u ON a.idVendedor = u.idUsuario", conn);
                const productosComprados = await queryWithParams("SELECT d.idArticulo FROM detallesventa d INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ?", [idUsuario], conn);
                const calificacionesPositivas = await queryWithParams("SELECT d.idArticulo FROM calificaciones c INNER JOIN detallesventa d ON c.idDetalle = d.idDetalle INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ? AND recomendado = 1", [idUsuario], conn);
                const productosMasVendidos = await query("SELECT a.* FROM articulos a INNER JOIN (SELECT dt.idArticulo, COUNT(dt.idArticulo) AS cuenta FROM detallesventa dt GROUP BY(idArticulo) ORDER BY COUNT(idArticulo) DESC) AS d ON a.idArticulo = d.idArticulo ORDER BY d.cuenta DESC", conn)

                Object.keys(filters).map(key => {
                    if (results.length > 0) {
                        if (results[0][key]) filters[key].values = [...new Set(results.map(item => item[key]))]
                    }
                })

                res.render("productos", {
                    masVendidos: productosMasVendidos,
                    compras: productosComprados.map(item => item.idArticulo),
                    calificaciones: calificacionesPositivas.map(item => item.idArticulo),
                    productos: results,
                    filtros: filters,
                    session: { idUsuario, nombreUsuario, imagen, rol },
                    pages: Object.values(enlaces[req.session.dataLogin["rol"]])
                })
            } catch (e) {
                console.log(e);
            }
        } else {
            res.redirect("/login")
        }
    },
    insertarRegistro: async (req, res) => {
        if (req.session.loggedIn) {
            const { tabla } = req.params;
            let data = req.body;

            if (req.originalUrl.includes("multipart")) {
                data = JSON.parse(JSON.stringify(req.body));
                data[req.file.fieldname] = req.file.filename;

                if (tabla === "articulos") {
                    data = {...data, ...defaultValuesModels[tabla](data.valorInicial)}
                    data.idVendedor = req.session.dataLogin["idUsuario"]
                } else {
                    data = {...data, ...defaultValuesModels[tabla]()}
                }

                console.log(data)
            }
            
            try {
                const conn = await connection(req);
                await queryWithParams(`INSERT INTO ${tabla} SET ?`, [data], conn);
                res.json({
                    title: "El registro se ha insertado",
                    message: "Ya se encuentra registrado en el sistema",
                    type: "success"
                })
            } catch (e) {
                res.json({
                    title: "Error en inserción de registro",
                    message: "Intente de Nuevo (Mensaje de error: " + e + ")",
                    type: "error"
                })
            }
        }
    },
    actualizarRegistro: async (req, res) => {
        if (req.session.loggedIn) {
            const { tabla } = req.params;
            const campo = Object.keys(req.query)[0];
            let data = req.body;

            if (req.originalUrl.includes("multipart")) {
                data = JSON.parse(JSON.stringify(req.body));
                data[req.file.fieldname] = req.file.filename;
                data = Object.keys(data).reduce((obj, key) => {
                    if (data[key] !== "") obj[key] = data[key]
                    return obj
                }, {})
                console.log(data)
            }
            
            try {
                const conn = await connection(req);

                const anteriorRegistro = await queryWithParams(`SELECT * FROM ${tabla} WHERE ${campo} = ?`, [req.query[campo]], conn);
                if (data.imagen && anteriorRegistro[0].imagen?.match(/\.[\w]+$/g)) fs.unlinkSync(path.join(__dirname, `../public/img/${anteriorRegistro[0].imagen}`)) 

                await queryWithParams(`UPDATE ${tabla} SET ? WHERE ${campo} = ?`, [data, req.query[campo]], conn);
                res.json({
                    title: "El registro se ha actualizado",
                    message: "Ya se encuentra registrado en el sistema",
                    type: "success"
                })
            } catch (e) {
                res.json({
                    title: "Error en actualización de registro",
                    message: "Intente de Nuevo (Mensaje de error: " + e + ")",
                    type: "error"
                })
            }
        }
    },
    eliminarRegistro: async (req, res) => {
        if (req.session.loggedIn) {
            const { tabla } = req.params;
            const campo = Object.keys(req.query)[0];

            try {
                const conn = await connection(req);

                const anteriorRegistro = await queryWithParams(`SELECT * FROM ${tabla} WHERE ${campo} = ?`, [req.query[campo]], conn);
                if (anteriorRegistro[0].imagen?.match(/\.[\w]+$/g)) fs.unlinkSync(path.join(__dirname, `../public/img/${anteriorRegistro[0].imagen}`))

                await queryWithParams(`DELETE FROM ${tabla} WHERE ${campo} = ?`, [req.query[campo]], conn);
                res.json({
                    title: "El registro se ha eliminado",
                    message: "Ya no se encuentra registrado en el sistema",
                    type: "success"
                })
            } catch (e) {
                res.json({
                    title: "Error en eliminación de registro",
                    message: "Intente de Nuevo (Mensaje de error: " + e + ")",
                    type: "error"
                })
            }
        }
    },
    consultarRegistro: async (req, res) => {
        if (req.session.loggedIn) {
            const { tabla } = req.params;
            const { rol, idUsuario } = req.session.dataLogin;
            const campo = Object.keys(req.query)[0];

            if (Object.keys(consultas[rol]).includes(tabla)) {
                try {
                    const conn = await connection(req);
                    let results = []

                    if (consultas[rol][tabla].includes("?")) {
                        results = await queryWithParams(consultas[rol][tabla] + ` AND ${campo} = ?`, [idUsuario, req.query[campo]], conn);
                    } else {
                        results = await queryWithParams(consultas[rol][tabla] + ` WHERE ${campo} = ?`, [req.query[campo]], conn);
                    }

                    if (results.length > 0) {
                        res.json([
                            results[0], {
                            title: "El registro se ha consultado",
                            message: "Los campos serán rellenados",
                            type: "success"
                        }])
                    } else {
                        res.json([
                            results[0], {
                            title: "No se encontró el registro",
                            message: "El dato buscado no se encuentra registrado",
                            type: "error"
                        }])
                    }
                } catch (e) {
                    res.json([[], {
                        title: "Error en consulta de registro",
                        message: "Intente de Nuevo (Mensaje de error: " + e + ")",
                        type: "error"
                    }])
                }
            } else {
                res.json([[], {
                    title: "Error en consulta de registro",
                    message: "Usted no tiene acceso a este registro",
                    type: "error"
                }])
            }
        }
    },
    revisarPerfil: (req, res) => {
        if (req.session.loggedIn) {
            const data = req.session.dataLogin;
            res.render("perfil", {
                pages: Object.values(enlaces[data["rol"]]),
                session: data
            }) 
        } else {
            res.redirect("/login")
        }
    },
    cerrarSesion: (req, res) => {
        req.session.destroy();
        res.redirect("/");
    },
    realizarCompraStripe: async (req, res) => {
        if (req.session.loggedIn) {
            try {
                const { correo } = req.session.dataLogin;
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    mode: "payment",
                    customer_email: correo,
                    line_items: req.body.map(item => {
                        return {
                            price_data: {
                                currency: "cop",
                                product_data: {
                                    name: item.nombre,
                                    images: [item.imagen]
                                },
                                unit_amount: item.valorInicial * 100,
                            },
                            quantity: item.cantidad
                        }
                    }),
                    success_url: `${process.env.DOMAIN}/success/${req.params.type}`,
                    cancel_url: `${process.env.DOMAIN}/carrito`
                })
                req.session.idCarga = session.payment_intent;
                console.log(session.url);
                res.json({ url: session.url })
            } catch (e) {
                res.status(500).json({error: e.message})
            }
        } else {
            res.status(500).json({error: "Inicie Sesión"})
        }
    },
    manejarExito: (_req, res) => res.render("success"),
    realizarCompraFinal: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                const conn = await connection(req);

                const venta = {};
                const { idUsuario } = req.session.dataLogin;
                const idVenta = await getLastId("ventas", conn);
                const fechaActual = getFullDate();
                const idCarga = req.session.idCarga;

                if (idCarga) {
                    const { detalleVenta } = baseModels;
                    const productos = req.body;

                    venta.idVenta = idVenta;
                    venta.idComprador = idUsuario;
                    venta.fechaVenta = fechaActual;
                    venta.valorTotal = productos.reduce((total, item) => total + item.valorTotal, 0);

                    const ventaResults = await queryWithParams("INSERT INTO ventas SET ?", [venta], conn);
                    let anteriorId = 0;

                    productos.map(async (item) => {
                        const detalleTotal = remapObjectProps(item, detalleVenta);
                        const newId = await getLastId("detallesventa", conn);

                        detalleTotal.idVenta = idVenta;
                        detalleTotal.idDetalle = anteriorId !== 0 ? anteriorId + 1 : newId;

                        anteriorId = detalleTotal.idDetalle;

                        detalleTotal.valorUnitario = item.valorInicial;

                        await queryWithParams("INSERT INTO detallesventa SET ?", [detalleTotal], conn);
                    })

                    await queryWithParams("INSERT INTO cargas SET ?", [{ idCarga, idVenta }], conn)
                    req.session.idCarga = null

                    res.json({url: "/compras", results: ventaResults});
                }
            } else {
                res.send("Debe iniciar sesión");
            }
        } catch (e) {
            console.log(e)
        }
    },
    hacerCalificacion: async (req, res) => {
        const { id } = req.params;

        if (req.session.loggedIn) {
            const { idUsuario } = req.session.dataLogin

            try {
                const conn = await connection(req);
                const calificacionArticulo = await queryWithParams("SELECT c.* FROM calificaciones c INNER JOIN detallesventa d ON c.idDetalle = d.idDetalle INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ? AND idArticulo = ?", [idUsuario, id], conn);

                if (calificacionArticulo.length > 0) {
                    const calificacion = JSON.parse(JSON.stringify(calificacionArticulo[0]));
                    calificacion.recomendado = calificacion.recomendado === 1 ? 0 : 1;
                    await queryWithParams("UPDATE calificaciones SET ? WHERE idCalificacion = ?", [calificacion, calificacion.idCalificacion], conn)

                    res.json({
                        title: "Calificación actualizada con éxito",
                        icon: "success"
                    })
                } else {
                    const ultimoDetalle = await queryWithParams("SELECT idDetalle FROM detallesventa d INNER JOIN ventas v ON d.idVenta = v.idVenta WHERE idComprador = ? AND idArticulo = ?", [idUsuario, id], conn);
                    const idDetalle = ultimoDetalle[ultimoDetalle.length - 1].idDetalle;
                    const idCalificacion = await getLastId("calificaciones", conn);
                    const recomendado = 1;
                    await queryWithParams("INSERT INTO calificaciones SET ?", [{ idCalificacion, idDetalle, recomendado }], conn)

                    res.json({
                        title: "Calificación hecha con éxito",
                        icon: "success"
                    })
                }
            } catch (e) {
                console.log(e)
            }
        }
    },
    hacerReembolso: async (req, res) => {
        const { idPeticion } = req.params;

        if (req.session.loggedIn) {
            try {
                const conn = await connection(req);

                let finalMessage = {
                    title: "Reembolso rechazado",
                    text: "Se ha registrado en el sistema",
                    icon: "success"
                }

                if (req.query?.estado === "Aceptada") {
                    const cargasVenta = await queryWithParams("SELECT idCarga FROM cargas c INNER JOIN peticiones p ON c.idVenta = p.idVenta WHERE idPeticion = ?", [idPeticion], conn);
                    const carga = cargasVenta[0].idCarga;

                    await stripe.refunds.create({
                        payment_intent: carga
                    })

                    finalMessage = {
                        title: "Venta reembolsada con éxito",
                        text: "La venta ha sido reembolsada con éxito",
                        icon: "success"
                    }
                }

                if (req.query) await queryWithParams("UPDATE peticiones SET ? WHERE idPeticion = ?", [req.query, idPeticion], conn);

                res.json(finalMessage)
            } catch (e) {
                res.json({
                    title: "Hubo un problema",
                    text: "Error en servidor (" + e + ")",
                    icon: "error"
                })
            }
        }
    }
}
const { get } = require("express/lib/request");
const { connection, query, queryWithParams } = require("../connection/connection");
const { models, consultas, enlaces } = require("../models/models");
const baseModels = require("../models/baseModels");
const fs = require("fs");

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const replaceObjectValues = async (object, idUsuario, conn) => {
    const modelRol = {...object};

    for (const key of Object.keys(modelRol)) {
        if (modelRol[key].tabla) {
            if (modelRol[key].args) {
                const finalQuery = await queryWithParams(`SELECT ${modelRol[key].campo} FROM ${modelRol[key].tabla} ${modelRol[key].args}`, [idUsuario], conn)
                modelRol[key] = finalQuery.map(item => item[modelRol[key].campo]);
            } else {
                const finalQuery = await query(`SELECT ${modelRol[key].campo} FROM ${modelRol[key].tabla}`, conn);
                console.log(finalQuery);
                modelRol[key] = finalQuery.map(item => item[modelRol[key].campo]);
            }
        }
    }

    return modelRol
}

const getLastId = async (table, conn) => {
    try {
        const lastId = await query(`SELECT COUNT(*) AS lastId FROM ${table}`, conn);
        if (lastId.length > 0 && lastId[0]?.lastId) {
            const { lastId: finalId } = lastId[0];
            return finalId + 1;
        } else {
            return 1;
        }
    } catch (e) {
        console.log(e + ". No se encuentra id")
    }
}

const getFullDate = () => {
    const date = new Date();
    const month = date.getMonth() + 1;
    return `${date.getFullYear()}-${date.getMonth() < 9 ? "0" + month : month}-${date.getDate()}`
}

const remapObjectProps = (object, baseObject) => {
    return Object.keys(baseObject).reduce((obj, key) => {
        if (object[key]) obj[key] = object[key];
        return obj;
    }, {})
}

module.exports = {
    renderInicio: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                const conn = await connection(req);
                const products = await query("SELECT * FROM articulos", conn);
                res.render("index", {
                    products: products,
                    loggedIn: true,
                    session: req.session.dataLogin,
                    pages: [{nombre: "Productos", url: "/productos"}],
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
                res.redirect("/")
            } else {
                res.render("login");
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
                res.redirect(Object.values(enlaces[results[0].rol])[0]["url"])
            } else {
                res.json({message: "Datos Incorrectos o Inexistentes"});
            }
        } catch (err) {
            console.log(err);
        }
    },
    renderFormulario: async (req, res) => {
        const { tabla } = req.params;
        const model = models[tabla];
        let modelRol;
        try {
            if (req.session.loggedIn) {
                const { rol, idUsuario } = req.session.dataLogin;

                if (Object.keys(consultas[rol]).includes(tabla)) {
                    const conn = await connection(req);

                    const results = rol === "Administrador" ? await query(consultas[rol][tabla], conn)
                    : await queryWithParams(consultas[rol][tabla], [idUsuario], conn);

                    if (model) modelRol = await replaceObjectValues(model[rol], idUsuario, conn);

                    res.render("formulario", {
                        nombreTabla: tabla,
                        data: results,
                        model: modelRol ? modelRol : "no existe",
                        pages: Object.values(enlaces[rol]),
                    })
                } else {
                    res.send("No está autorizado para consultar este apartado");
                }
            } else {
                res.send("Debe iniciar sesión");
            }
        } catch (err) {
            console.log(err);
        }
    },
    obtenerProducto: async (req, res) => {
        const { id } = req.params;
        try {
            if (req.session.loggedIn) {
                const { rol } = req.session.dataLogin;
                const conn = await connection(req);
                const results = await queryWithParams("SELECT a.*, u.nombreUsuario AS nombreVendedor, u.correo, u.numeroTelefono FROM articulos a INNER JOIN usuarios u ON a.idVendedor = u.idUsuario WHERE idArticulo = ?", [id], conn);
                if (req.query?.request) {
                    res.json(results[0]);
                } else {
                    res.render("producto", {
                        data: results[0],
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
    renderCarrito: (req, res) => {
        req.session.loggedIn ? res.render("carrito", {pages: Object.values(enlaces[req.session.dataLogin["rol"]])}) : res.redirect("/login")
    },
    renderProductos: async (req, res) => {
        if (req.session.loggedIn) {
            try {
                const conn = await connection(req);
                const results = await query("SELECT * FROM articulos", conn);
                res.render("productos", {
                    productos: results,
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
                console.log(data)
            }
            
            try {
                const conn = await connection(req);
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
                await queryWithParams(`DELETE FROM ${tabla} WHERE ${campo} = ?`, [data, req.query[campo]], conn);
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
                                    images: ["https://www.sanborns.com.mx/imagenes-sanborns-ii/1200/2001595980720.jpg"]
                                },
                                unit_amount: item.valorInicial * 100,
                            },
                            quantity: item.cantidad
                        }
                    }),
                    success_url: `http://localhost:4000/success/${req.params.type}`,
                    cancel_url: `http://localhost:4000/carrito`
                })
                req.session.idCarga = session.id;
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

                    res.json({url: "/data/ventas", results: ventaResults});
                }
            } else {
                res.send("Debe iniciar sesión");
            }
        } catch (e) {
            console.log(e)
        }
    }
}
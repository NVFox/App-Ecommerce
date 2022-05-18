const { connection, query, queryWithParams } = require("../connection/connection");
const { models, consultas } = require("../models/models");

const replaceObjectValues = async (object, idUsuario, conn) => {
    const modelRol = {...object};

    if (modelRol) Object.keys(modelRol).map( async (key) => {
        if (modelRol[key].tabla) {
            if (modelRol[key].args) {
                modelRol[key] = await queryWithParams(`SELECT ${modelRol[key].campo} FROM ${modelRol[key].tabla} ${modelRol[key].args}`, [idUsuario], conn)
            } else {
                modelRol[key] = await query(`SELECT ${modelRol[key].campo} FROM ${modelRol[key].tabla}`, conn)
            }
        }
    })

    return modelRol
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
                    pages: ["Inicio", "Productos"]
                });
            } else {
                res.render("index", {
                    loggedIn: false,
                    pages: ["Iniciar Sesión"]
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
                res.redirect(`/data/${Object.keys(consultas[results[0].rol])[0]}`)
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
        try {
            if (req.session.loggedIn) {
                const { rol, idUsuario } = req.session.dataLogin;

                if (Object.keys(consultas[rol]).includes(tabla)) {
                    const conn = await connection(req);

                    const results = rol === "Administrador" ? await query(consultas[rol][tabla], conn)
                    : await queryWithParams(consultas[rol][tabla], [idUsuario], conn);

                    const modelRol = await replaceObjectValues(model[rol], idUsuario, conn);

                    res.render("formulario", {
                        nombreTabla: tabla,
                        data: results,
                        model: modelRol ? modelRol : "no existe",
                        pages: Object.keys(consultas[rol])
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
    }
}
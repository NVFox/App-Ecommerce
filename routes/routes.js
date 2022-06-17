const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: path.join(__dirname, "../public/img"),
    filename: (_req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const fileUpload = multer({
    storage: diskStorage
}).single("imagen")

const controller = require("../controller/controller");

//Métodos de Inicio, Registro y Cierre de Sesión

router.get("/", controller.renderInicio);
router.get("/login", controller.renderLogin);
router.post("/login/verify", controller.realizarLogin);
router.post("/registro_usuarios/verify", fileUpload, controller.registroUsuario);
router.get("/perfil/:idUsuario", controller.revisarPerfil);
router.get("/cerrar", controller.cerrarSesion);

//Métodos consulta productos

router.get("/producto/:id", controller.obtenerProducto);
router.get("/productos", controller.renderProductos);
router.get("/carrito", controller.renderCarrito);

//Métodos consulta ventas, detalle y calificaciones

router.get("/compras", controller.obtenerVentas);

//Metodos obtener datos general

router.get("/registros/:tabla", controller.obtenerRegistros);

//Métodos formulario CRUD

router.get("/data/:tabla", controller.renderFormulario);
router.get("/registro/:tabla", controller.consultarRegistro);

router.post(`/registro/multipart/:tabla`, fileUpload, controller.insertarRegistro);
router.put(`/registro/multipart/:tabla`, fileUpload, controller.actualizarRegistro);

router.post(`/registro/encoded/:tabla`, controller.insertarRegistro);
router.put(`/registro/encoded/:tabla`, controller.actualizarRegistro);

router.delete(`/registro/:tabla`, controller.eliminarRegistro);

//Métodos manejo de Ventas

router.post("/create-checkout-session/:type", controller.realizarCompraStripe);
router.get("/success/:type", controller.manejarExito);
router.post("/success", controller.realizarCompraFinal);

//Métodos manejo de Calificaciones

router.get("/calificacion/:id", controller.hacerCalificacion);

//Métodos manejo de Reembolsos - Peticiones

router.get("/peticion/:idPeticion", controller.hacerReembolso);

module.exports = router;
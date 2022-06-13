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

//Métodos de Inicio y Cierre de Sesión

router.get("/", controller.renderInicio);
router.get("/login", controller.renderLogin);
router.post("/login/verify", controller.realizarLogin);
router.get("/cerrar", controller.cerrarSesion);

//Métodos consulta productos

router.get("/producto/:id", controller.obtenerProducto);
router.get("/productos", controller.renderProductos);
router.get("/carrito", controller.renderCarrito);

//Métodos formulario CRUD

router.get("/data/:tabla", controller.renderFormulario);

router.post(`/registro/multipart/:tabla`, fileUpload, controller.insertarRegistro);
router.put(`/registro/multipart/:tabla`, fileUpload, controller.actualizarRegistro);

router.post(`/registro/encoded/:tabla`, controller.insertarRegistro);
router.put(`/registro/encoded/:tabla`, controller.actualizarRegistro);

router.delete(`/registro/:tabla`, controller.eliminarRegistro);

//Métodos manejo de Ventas

router.post("/create-checkout-session/:type", controller.realizarCompraStripe);
router.get("/success/:type", controller.manejarExito);
router.post("/success", controller.realizarCompraFinal);

module.exports = router;
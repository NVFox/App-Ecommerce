const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");

router.get("/", controller.renderInicio);
router.get("/login", controller.renderLogin);

router.get("/producto/:id", controller.obtenerProducto);
router.get("/productos", controller.renderProductos);
router.get("/carrito", controller.renderCarrito);

router.get("/data/:tabla", controller.renderFormulario);
router.post("/login/verify", controller.realizarLogin);

router.post("/create-checkout-session/:type", controller.realizarCompraStripe);
router.get("/success/:type", controller.manejarExito);
router.post("/success", controller.realizarCompraFinal);

router.get("/cerrar", controller.cerrarSesion);

module.exports = router;
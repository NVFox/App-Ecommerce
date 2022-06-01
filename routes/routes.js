const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");

router.get("/", controller.renderInicio);
router.get("/login", controller.renderLogin);

router.get("/producto/:id", controller.obtenerProducto);
router.get("/carrito", controller.renderCarrito);

router.get("/data/:tabla", controller.renderFormulario);
router.post("/login/verify", controller.realizarLogin);

router.post("/create-checkout-session", controller.realizarCompraStripe);
router.get("/success", controller.realizarCompraFinal);

router.get("/cerrar", controller.cerrarSesion);

module.exports = router;
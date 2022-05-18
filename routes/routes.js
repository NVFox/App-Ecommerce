const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");

router.get("/", controller.renderInicio);
router.get("/login", controller.renderLogin);

router.get("/data/:tabla", controller.renderFormulario);
router.post("/login/verify", controller.realizarLogin);

module.exports = router;
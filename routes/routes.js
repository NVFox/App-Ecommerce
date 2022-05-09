const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");

router.get("/", controller.renderLogin);
router.get("/usuarios", controller.consultarTodosUsuarios);

module.exports = router;
const express = require("express");
const controller = require("../controllers/systemParameterController");
const { exigirSuper } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/publicos", controller.listarPublicos);
router.use(exigirSuper);
router.get("/", controller.listar);
router.put("/", controller.atualizar);

module.exports = router;

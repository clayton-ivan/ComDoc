const express = require("express");
const controller = require("../controllers/userController");
const { exigirAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(exigirAdmin);
router.get("/", controller.listar);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.put("/:id/senha", controller.redefinirSenha);
router.post("/:id/revogar", controller.revogar);
router.post("/:id/remover-bloqueio", controller.removerBloqueio);

module.exports = router;

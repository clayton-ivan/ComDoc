const express = require("express");
const controller = require("../controllers/authController");
const { exigirApi } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", controller.login);
router.get("/sessao", controller.sessao);
router.post("/logout", controller.logout);
router.post("/alterar-senha", exigirApi, controller.alterarSenha);
router.post("/sair-todos", exigirApi, controller.sairTodos);
router.get("/empresas", exigirApi, controller.listarEmpresas);
router.post("/selecionar-empresa", exigirApi, controller.selecionarEmpresa);

module.exports = router;

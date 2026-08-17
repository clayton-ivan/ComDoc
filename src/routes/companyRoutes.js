const express = require("express");

const companyController = require(
    "../controllers/companyController"
);

const commercialConditionController = require(
    "../controllers/commercialConditionController"
);

const router = express.Router();
const { exigirAdmin, exigirSuper } = require("../middleware/authMiddleware");

router.get("/", companyController.buscar);
router.put("/", exigirAdmin, companyController.atualizar);
router.put("/administrador", exigirSuper, companyController.atualizarAdministrador);
router.put("/administrador/senha", exigirSuper, companyController.redefinirSenhaAdministrador);
router.post("/logo", exigirAdmin, companyController.uploadLogo);
router.delete("/logo", exigirAdmin, companyController.excluirLogo);

router.get(
    "/prazos-entrega",
    commercialConditionController.prazosEntrega.listar
);
router.post(
    "/prazos-entrega",
    exigirAdmin,
    commercialConditionController.prazosEntrega.criar
);
router.delete(
    "/prazos-entrega/:id",
    exigirAdmin,
    commercialConditionController.prazosEntrega.excluir
);

router.get(
    "/formas-pagamento",
    commercialConditionController.formasPagamento.listar
);
router.post(
    "/formas-pagamento",
    exigirAdmin,
    commercialConditionController.formasPagamento.criar
);
router.delete(
    "/formas-pagamento/:id",
    exigirAdmin,
    commercialConditionController.formasPagamento.excluir
);

router.put(
    "/condicoes-comerciais",
    exigirAdmin,
    commercialConditionController.substituirTodas
);

module.exports = router;

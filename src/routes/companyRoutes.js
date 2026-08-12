const express = require("express");

const companyController = require(
    "../controllers/companyController"
);

const commercialConditionController = require(
    "../controllers/commercialConditionController"
);

const router = express.Router();

router.get("/", companyController.buscar);
router.put("/", companyController.atualizar);
router.post("/logo", companyController.uploadLogo);
router.delete("/logo", companyController.excluirLogo);

router.get(
    "/prazos-entrega",
    commercialConditionController.prazosEntrega.listar
);
router.post(
    "/prazos-entrega",
    commercialConditionController.prazosEntrega.criar
);
router.delete(
    "/prazos-entrega/:id",
    commercialConditionController.prazosEntrega.excluir
);

router.get(
    "/formas-pagamento",
    commercialConditionController.formasPagamento.listar
);
router.post(
    "/formas-pagamento",
    commercialConditionController.formasPagamento.criar
);
router.delete(
    "/formas-pagamento/:id",
    commercialConditionController.formasPagamento.excluir
);

router.put(
    "/condicoes-comerciais",
    commercialConditionController.substituirTodas
);

module.exports = router;

const express = require("express");

const productController = require(
    "../controllers/productController"
);

const router = express.Router();

router.get(
    "/",
    productController.listar
);

router.get(
    "/proximo-codigo",
    productController.obterProximoCodigo
);

router.get(
    "/:codigo",
    productController.buscarPorCodigo
);

router.post(
    "/",
    productController.criar
);

router.put(
    "/:codigo",
    productController.atualizar
);

router.delete(
    "/:codigo",
    productController.excluir
);

module.exports = router;
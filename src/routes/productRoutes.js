const express = require("express");

const productController = require(
    "../controllers/productController"
);

const productBlockController = require(
    "../controllers/productBlockController"
);

const productImageController = require(
    "../controllers/productImageController"
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
    "/tipos-bloco",
    productBlockController.listarTipos
);

router.get(
    "/:codigo/blocos",
    productBlockController.listarPorProduto
);

router.put(
    "/:codigo/blocos",
    productBlockController.substituirPorProduto
);

router.post(
    "/:codigo/imagens",
    productImageController.upload
);

router.delete(
    "/:codigo/imagens/:nome",
    productImageController.excluir
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

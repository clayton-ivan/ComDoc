const express = require("express");

const clientController =
    require("../controllers/clientController");

const router = express.Router();

router.get(
    "/",
    clientController.listar
);

router.get(
    "/:id",
    clientController.buscarPorId
);

router.post(
    "/",
    clientController.criar
);

router.put(
    "/:id",
    clientController.atualizar
);

router.delete(
    "/:id",
    clientController.excluir
);

module.exports = router;
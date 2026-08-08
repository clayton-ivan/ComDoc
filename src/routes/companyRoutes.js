const express = require("express");

const companyController = require(
    "../controllers/companyController"
);

const router = express.Router();

router.get("/", companyController.buscar);
router.put("/", companyController.atualizar);
router.post("/logo", companyController.uploadLogo);
router.delete("/logo", companyController.excluirLogo);

module.exports = router;

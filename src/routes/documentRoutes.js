const express = require("express");

const router = express.Router();

const documentController = require("../controllers/documentController");

router.post("/gerar", documentController.gerar);

module.exports = router;
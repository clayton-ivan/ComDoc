const express = require("express");

const router = express.Router();

const pdfController = require("../controllers/pdfController");

router.post("/gerar", pdfController.gerar);

module.exports = router;
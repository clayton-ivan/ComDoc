const express = require("express");
const companyController = require("../controllers/companyController");
const { exigirSuper } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(exigirSuper);
router.get("/", companyController.listar);
router.post("/", companyController.criar);

module.exports = router;

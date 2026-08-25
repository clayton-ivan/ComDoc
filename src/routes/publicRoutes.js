const express = require('express');
const registration = require('../controllers/publicRegistrationController');
const legal = require('../controllers/legalDocumentController');
const router = express.Router();
router.get('/documentos-legais', legal.listarPublicos);
router.post('/cadastros', registration.cadastrar);
router.post('/confirmar-email', registration.confirmar);
router.post('/reenviar-confirmacao', registration.reenviar);
module.exports = router;

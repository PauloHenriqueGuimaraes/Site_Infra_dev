const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Definir as rotas conectando aos métodos do controlador
router.get('/', homeController.renderIndex);
router.get('/Contact', homeController.renderContact);

module.exports = router;

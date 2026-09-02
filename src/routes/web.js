const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const orcamentoController = require('../controllers/orcamentoController');
const adminController = require('../controllers/adminController');

// Home and Contact
router.get('/', homeController.renderIndex);
router.get('/Contact', homeController.renderContact);

// Orçamento
router.get('/orcamento', orcamentoController.showForm);
router.post('/orcamento', orcamentoController.submitForm);

// Painel Admin - Autenticação
router.get('/admin', adminController.showLogin);
router.post('/admin/login', adminController.login);
router.get('/admin/logout', adminController.logout);

// Painel Admin - Orçamentos
router.get('/admin/dashboard', adminController.requireAuth, adminController.dashboard);
router.post('/admin/orcamento/deletar/:id', adminController.requireAuth, adminController.deleteOrcamento);

// Painel Admin - Usuários
router.get('/admin/usuarios', adminController.requireAuth, adminController.listUsers);
router.get('/admin/usuarios/novo', adminController.requireAuth, adminController.showCreateUser);
router.post('/admin/usuarios/novo', adminController.requireAuth, adminController.createUser);
router.post('/admin/usuarios/deletar/:id', adminController.requireAuth, adminController.deleteUser);

module.exports = router;

const express = require('express');
const path = require('path');
const webRoutes = require('./routes/web');

const app = express();
const cookieParser = require('cookie-parser');
require('./database/db'); // Inicializa o banco

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Configurar o EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos da pasta public (na raiz)
app.use(express.static(path.join(__dirname, '../public')));

// Usar as rotas definidas no arquivo web.js
app.use('/', webRoutes);

module.exports = app;

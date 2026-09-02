const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const SECRET_KEY = 'pg-tech-secret-key-123'; // Em produção usar variáveis de ambiente

// Exibir login
exports.showLogin = (req, res) => {
    const token = req.cookies.admin_token;
    if (token) {
        try {
            jwt.verify(token, SECRET_KEY);
            return res.redirect('/admin/dashboard');
        } catch (err) {}
    }
    res.render('admin/login', { title: 'Admin Login', error: null });
};

// Processar login com BD
exports.login = (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM Usuarios WHERE Email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.render('admin/login', { title: 'Admin Login', error: 'Credenciais inválidas!' });
        }
        
        const validPass = bcrypt.compareSync(password, user.Senha);
        if (!validPass) {
            return res.render('admin/login', { title: 'Admin Login', error: 'Credenciais inválidas!' });
        }
        
        const token = jwt.sign({ id: user.Id, email: user.Email, nome: user.Nome }, SECRET_KEY, { expiresIn: '8h' });
        res.cookie('admin_token', token, { httpOnly: true });
        res.redirect('/admin/dashboard');
    });
};

exports.logout = (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/admin');
};

exports.dashboard = (req, res) => {
    db.all(`SELECT * FROM Orcamentos ORDER BY DataCriacao DESC`, [], (err, rows) => {
        res.render('admin/dashboard', { title: 'Dashboard - Orçamentos', orcamentos: rows || [] });
    });
};

exports.deleteOrcamento = (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM Orcamentos WHERE Id = ?`, [id], (err) => {
        res.redirect('/admin/dashboard');
    });
};

// -- CRUD DE USUÁRIOS --

exports.listUsers = (req, res) => {
    db.all(`SELECT Id, Nome, Email, DataCriacao FROM Usuarios ORDER BY DataCriacao DESC`, [], (err, rows) => {
        res.render('admin/usuarios', { title: 'Gestão de Usuários', usuarios: rows || [] });
    });
};

exports.showCreateUser = (req, res) => {
    res.render('admin/usuario_novo', { title: 'Novo Usuário', error: null });
};

exports.createUser = (req, res) => {
    const { nome, email, password } = req.body;
    
    if (!nome || !email || !password) {
        return res.render('admin/usuario_novo', { title: 'Novo Usuário', error: 'Todos os campos são obrigatórios.' });
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    db.run(`INSERT INTO Usuarios (Nome, Email, Senha) VALUES (?, ?, ?)`, [nome, email, hash], function(err) {
        if (err) {
            return res.render('admin/usuario_novo', { title: 'Novo Usuário', error: 'Este e-mail já está em uso.' });
        }
        res.redirect('/admin/usuarios');
    });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    // Evitar deletar a si mesmo seria ideal, mas vamos simplificar
    db.run(`DELETE FROM Usuarios WHERE Id = ?`, [id], (err) => {
        res.redirect('/admin/usuarios');
    });
};

// Middleware para proteger as rotas
exports.requireAuth = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.redirect('/admin');
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.adminUser = decoded;
        next();
    } catch (err) {
        res.clearCookie('admin_token');
        return res.redirect('/admin');
    }
};

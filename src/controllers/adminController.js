const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../database/db');

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

// Processar login com BD Supabase
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('Email', email)
        .single();
        
    if (error || !user) {
        return res.render('admin/login', { title: 'Admin Login', error: 'Credenciais inválidas!' });
    }
    
    const validPass = bcrypt.compareSync(password, user.Senha);
    if (!validPass) {
        return res.render('admin/login', { title: 'Admin Login', error: 'Credenciais inválidas!' });
    }
    
    const token = jwt.sign({ id: user.Id, email: user.Email, nome: user.Nome }, SECRET_KEY, { expiresIn: '8h' });
    res.cookie('admin_token', token, { httpOnly: true });
    res.redirect('/admin/dashboard');
};

exports.logout = (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/admin');
};

// -- CRUD DE ORÇAMENTOS --
exports.dashboard = async (req, res) => {
    const { data: rows, error } = await supabase
        .from('Orcamentos')
        .select('*')
        .order('DataCriacao', { ascending: false });
        
    res.render('admin/dashboard', { title: 'Dashboard - Orçamentos', orcamentos: rows || [] });
};

exports.deleteOrcamento = async (req, res) => {
    const id = req.params.id;
    await supabase.from('Orcamentos').delete().eq('Id', id);
    res.redirect('/admin/dashboard');
};

// -- CRUD DE USUÁRIOS --

exports.listUsers = async (req, res) => {
    const { data: rows, error } = await supabase
        .from('Usuarios')
        .select('Id, Nome, Email, DataCriacao')
        .order('DataCriacao', { ascending: false });
        
    res.render('admin/usuarios', { title: 'Gestão de Usuários', usuarios: rows || [] });
};

exports.showCreateUser = (req, res) => {
    res.render('admin/usuario_novo', { title: 'Novo Usuário', error: null });
};

exports.createUser = async (req, res) => {
    const { nome, email, password } = req.body;
    
    if (!nome || !email || !password) {
        return res.render('admin/usuario_novo', { title: 'Novo Usuário', error: 'Todos os campos são obrigatórios.' });
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    const { error } = await supabase
        .from('Usuarios')
        .insert([{ Nome: nome, Email: email, Senha: hash }]);
        
    if (error) {
        return res.render('admin/usuario_novo', { title: 'Novo Usuário', error: 'Este e-mail já está em uso ou ocorreu um erro.' });
    }
    res.redirect('/admin/usuarios');
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    await supabase.from('Usuarios').delete().eq('Id', id);
    res.redirect('/admin/usuarios');
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

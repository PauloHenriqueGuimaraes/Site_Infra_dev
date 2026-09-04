const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase, isConfigured } = require('../database/db');

const SECRET_KEY = process.env.JWT_SECRET || 'pg-tech-secret-key-123';

const databaseUnavailableMessage =
    'Banco de dados não configurado. Preencha as variáveis do Supabase.';

exports.showLogin = (req, res) => {
    const token = req.cookies.admin_token;

    if (token) {
        try {
            jwt.verify(token, SECRET_KEY);
            return res.redirect('/admin/dashboard');
        } catch (error) {
            res.clearCookie('admin_token');
        }
    }

    return res.render('admin/login', { title: 'Admin Login', error: null });
};

exports.login = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
        return res.status(400).render('admin/login', {
            title: 'Admin Login',
            error: 'Informe o e-mail e a senha.'
        });
    }

    if (!isConfigured) {
        return res.status(503).render('admin/login', {
            title: 'Admin Login',
            error: databaseUnavailableMessage
        });
    }

    const { data: user, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('Email', email)
        .maybeSingle();

    if (error) {
        console.error('Erro ao consultar usuário no Supabase:', error.message);
        return res.status(500).render('admin/login', {
            title: 'Admin Login',
            error: 'Não foi possível acessar o banco de dados.'
        });
    }

    if (!user || !bcrypt.compareSync(password, user.Senha)) {
        return res.status(401).render('admin/login', {
            title: 'Admin Login',
            error: 'Credenciais inválidas!'
        });
    }

    const token = jwt.sign(
        { id: user.Id, email: user.Email, nome: user.Nome },
        SECRET_KEY,
        { expiresIn: '8h' }
    );

    res.cookie('admin_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000
    });

    return res.redirect('/admin/dashboard');
};

exports.logout = (req, res) => {
    res.clearCookie('admin_token');
    return res.redirect('/admin');
};

exports.dashboard = async (req, res) => {
    if (!isConfigured) {
        return res.status(503).send(databaseUnavailableMessage);
    }

    const { data: rows, error } = await supabase
        .from('Orcamentos')
        .select('*')
        .order('DataCriacao', { ascending: false });

    if (error) {
        console.error('Erro ao carregar orçamentos do Supabase:', error.message);
    }

    return res.render('admin/dashboard', {
        title: 'Dashboard - Orçamentos',
        orcamentos: rows || []
    });
};

exports.deleteOrcamento = async (req, res) => {
    if (!isConfigured) {
        return res.status(503).send(databaseUnavailableMessage);
    }

    const { error } = await supabase
        .from('Orcamentos')
        .delete()
        .eq('Id', req.params.id);

    if (error) {
        console.error('Erro ao excluir orçamento no Supabase:', error.message);
    }

    return res.redirect('/admin/dashboard');
};

exports.listUsers = async (req, res) => {
    if (!isConfigured) {
        return res.status(503).send(databaseUnavailableMessage);
    }

    const { data: rows, error } = await supabase
        .from('Usuarios')
        .select('Id, Nome, Email, DataCriacao')
        .order('DataCriacao', { ascending: false });

    if (error) {
        console.error('Erro ao carregar usuários do Supabase:', error.message);
    }

    return res.render('admin/usuarios', {
        title: 'Gestão de Usuários',
        usuarios: rows || []
    });
};

exports.showCreateUser = (req, res) => {
    return res.render('admin/usuario_novo', {
        title: 'Novo Usuário',
        error: null
    });
};

exports.createUser = async (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!nome || !email || !password) {
        return res.status(400).render('admin/usuario_novo', {
            title: 'Novo Usuário',
            error: 'Todos os campos são obrigatórios.'
        });
    }

    if (!isConfigured) {
        return res.status(503).render('admin/usuario_novo', {
            title: 'Novo Usuário',
            error: databaseUnavailableMessage
        });
    }

    const hash = bcrypt.hashSync(password, 10);
    const { error } = await supabase
        .from('Usuarios')
        .insert([{ Nome: nome, Email: email, Senha: hash }]);

    if (error) {
        console.error('Erro ao cadastrar usuário no Supabase:', error.message);
        return res.status(409).render('admin/usuario_novo', {
            title: 'Novo Usuário',
            error: 'Este e-mail já está em uso ou ocorreu um erro.'
        });
    }

    return res.redirect('/admin/usuarios');
};

exports.deleteUser = async (req, res) => {
    const id = Number(req.params.id);

    if (id === req.adminUser.id) {
        return res.redirect('/admin/usuarios');
    }

    if (!isConfigured) {
        return res.status(503).send(databaseUnavailableMessage);
    }

    const { error } = await supabase.from('Usuarios').delete().eq('Id', id);

    if (error) {
        console.error('Erro ao excluir usuário no Supabase:', error.message);
    }

    return res.redirect('/admin/usuarios');
};

exports.requireAuth = (req, res, next) => {
    const token = req.cookies.admin_token;

    if (!token) {
        return res.redirect('/admin');
    }

    try {
        req.adminUser = jwt.verify(token, SECRET_KEY);
        return next();
    } catch (error) {
        res.clearCookie('admin_token');
        return res.redirect('/admin');
    }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const SECRET_KEY = process.env.JWT_SECRET || 'pg-tech-secret-key-123';

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

exports.login = (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
        return res.status(400).render('admin/login', {
            title: 'Admin Login',
            error: 'Informe o e-mail e a senha.'
        });
    }

    return db.get(
        'SELECT * FROM Usuarios WHERE LOWER(Email) = ?',
        [email],
        (error, user) => {
            if (error) {
                console.error('Erro ao consultar usuário:', error.message);
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
        }
    );
};

exports.logout = (req, res) => {
    res.clearCookie('admin_token');
    return res.redirect('/admin');
};

exports.dashboard = (req, res) => {
    db.all(
        'SELECT * FROM Orcamentos ORDER BY DataCriacao DESC',
        [],
        (error, rows) => {
            if (error) {
                console.error('Erro ao carregar orçamentos:', error.message);
            }

            return res.render('admin/dashboard', {
                title: 'Dashboard - Orçamentos',
                orcamentos: rows || []
            });
        }
    );
};

exports.deleteOrcamento = (req, res) => {
    db.run(
        'DELETE FROM Orcamentos WHERE Id = ?',
        [req.params.id],
        (error) => {
            if (error) {
                console.error('Erro ao excluir orçamento:', error.message);
            }

            return res.redirect('/admin/dashboard');
        }
    );
};

exports.listUsers = (req, res) => {
    db.all(
        'SELECT Id, Nome, Email, DataCriacao FROM Usuarios ORDER BY DataCriacao DESC',
        [],
        (error, rows) => {
            if (error) {
                console.error('Erro ao carregar usuários:', error.message);
            }

            return res.render('admin/usuarios', {
                title: 'Gestão de Usuários',
                usuarios: rows || []
            });
        }
    );
};

exports.showCreateUser = (req, res) => {
    return res.render('admin/usuario_novo', {
        title: 'Novo Usuário',
        error: null
    });
};

exports.createUser = (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!nome || !email || !password) {
        return res.status(400).render('admin/usuario_novo', {
            title: 'Novo Usuário',
            error: 'Todos os campos são obrigatórios.'
        });
    }

    const hash = bcrypt.hashSync(password, 10);

    return db.run(
        'INSERT INTO Usuarios (Nome, Email, Senha) VALUES (?, ?, ?)',
        [nome, email, hash],
        (error) => {
            if (error) {
                console.error('Erro ao cadastrar usuário:', error.message);
                return res.status(409).render('admin/usuario_novo', {
                    title: 'Novo Usuário',
                    error: 'Este e-mail já está em uso.'
                });
            }

            return res.redirect('/admin/usuarios');
        }
    );
};

exports.deleteUser = (req, res) => {
    const id = Number(req.params.id);

    if (id === req.adminUser.id) {
        return res.redirect('/admin/usuarios');
    }

    return db.run('DELETE FROM Usuarios WHERE Id = ?', [id], (error) => {
        if (error) {
            console.error('Erro ao excluir usuário:', error.message);
        }

        return res.redirect('/admin/usuarios');
    });
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

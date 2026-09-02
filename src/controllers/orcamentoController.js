const db = require('../database/db');

exports.showForm = (req, res) => {
    res.render('orcamento', { title: 'Solicitar Orçamento', success: false });
};

exports.submitForm = (req, res) => {
    const { nome, telefone, categoria, descricao } = req.body;

    if (!nome || !telefone || !categoria) {
        return res.status(400).send('Nome, telefone e categoria são obrigatórios.');
    }

    db.run(
        `INSERT INTO Orcamentos (Nome, Telefone, Categoria, Descricao) VALUES (?, ?, ?, ?)`,
        [nome, telefone, categoria, descricao || ''],
        function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Erro ao salvar o orçamento.');
            }
            res.render('orcamento', { title: 'Orçamento Enviado', success: true });
        }
    );
};

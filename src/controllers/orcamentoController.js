const db = require('../database/db');

exports.showForm = (req, res) => {
    return res.render('orcamento', {
        title: 'Solicitar Orçamento',
        success: false
    });
};

exports.submitForm = (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const telefone = String(req.body.telefone || '').trim();
    const categoria = String(req.body.categoria || '').trim();
    const descricao = String(req.body.descricao || '').trim();

    if (!nome || !telefone || !categoria) {
        return res.status(400).send('Nome, telefone e categoria são obrigatórios.');
    }

    return db.run(
        `INSERT INTO Orcamentos (Nome, Telefone, Categoria, Descricao)
         VALUES (?, ?, ?, ?)`,
        [nome, telefone, categoria, descricao],
        (error) => {
            if (error) {
                console.error('Erro ao salvar o orçamento:', error.message);
                return res.status(500).send('Erro ao salvar o orçamento.');
            }

            return res.render('orcamento', {
                title: 'Orçamento Enviado',
                success: true
            });
        }
    );
};

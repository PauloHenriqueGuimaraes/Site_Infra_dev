const { supabase, isConfigured } = require('../database/db');

exports.showForm = (req, res) => {
    return res.render('orcamento', {
        title: 'Solicitar Orçamento',
        success: false
    });
};

exports.submitForm = async (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const telefone = String(req.body.telefone || '').trim();
    const categoria = String(req.body.categoria || '').trim();
    const descricao = String(req.body.descricao || '').trim();

    if (!nome || !telefone || !categoria) {
        return res.status(400).send('Nome, telefone e categoria são obrigatórios.');
    }

    if (!isConfigured) {
        return res.status(503).send(
            'Banco de dados não configurado. Preencha as variáveis do Supabase.'
        );
    }

    const { error } = await supabase.from('Orcamentos').insert([
        {
            Nome: nome,
            Telefone: telefone,
            Categoria: categoria,
            Descricao: descricao
        }
    ]);

    if (error) {
        console.error('Erro ao salvar orçamento no Supabase:', error.message);
        return res.status(500).send('Erro ao salvar o orçamento.');
    }

    return res.render('orcamento', {
        title: 'Orçamento Enviado',
        success: true
    });
};

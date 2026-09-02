const supabase = require('../database/db');

exports.showForm = (req, res) => {
    res.render('orcamento', { title: 'Solicitar Orçamento', success: false });
};

exports.submitForm = async (req, res) => {
    try {
        const { nome, telefone, categoria, descricao } = req.body;

        if (!nome || !telefone || !categoria) {
            return res.status(400).send('Nome, telefone e categoria são obrigatórios.');
        }

        const { data, error } = await supabase
            .from('Orcamentos')
            .insert([{ Nome: nome, Telefone: telefone, Categoria: categoria, Descricao: descricao || '' }]);

        if (error) {
            console.error('Erro no Supabase:', error);
            return res.status(500).send(`Erro ao salvar o orçamento no banco: ${error.message}`);
        }
        
        res.render('orcamento', { title: 'Orçamento Enviado', success: true });
    } catch (err) {
        console.error('Erro crítico no servidor:', err);
        return res.status(500).send(`Erro interno: ${err.message || err}`);
    }
};

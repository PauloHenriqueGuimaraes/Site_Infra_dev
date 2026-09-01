// Controlador responsável pelas páginas principais do site

exports.renderIndex = (req, res) => {
    res.render('index', { title: 'Soluções Avançadas em TI' });
};

exports.renderContact = (req, res) => {
    res.render('contact', { title: 'Fale Conosco' });
};

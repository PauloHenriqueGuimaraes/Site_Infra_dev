const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Na Vercel, o sistema de arquivos é read-only, exceto a pasta /tmp.
// IMPORTANTE: Arquivos no /tmp são apagados a cada deploy ou quando a Vercel desliga a função por inatividade.
const dbPath = process.env.VERCEL 
    ? path.join('/tmp', 'database.sqlite') 
    : path.resolve(__dirname, 'database.sqlite');

// Ensure directory exists
if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`
            CREATE TABLE IF NOT EXISTS Orcamentos (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Nome TEXT NOT NULL,
                Telefone TEXT NOT NULL,
                Categoria TEXT NOT NULL,
                Descricao TEXT,
                DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (createErr) => {
            if (createErr) {
                console.error('Erro ao criar tabela Orcamentos:', createErr.message);
            } else {
                // Tenta adicionar a coluna caso a tabela já exista de uma versão anterior
                db.run(`ALTER TABLE Orcamentos ADD COLUMN Descricao TEXT`, () => {});
            }
        });

        // Tabela de Usuarios
        db.run(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Nome TEXT NOT NULL,
                Email TEXT UNIQUE NOT NULL,
                Senha TEXT NOT NULL,
                DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (createErr) => {
            if (createErr) {
                console.error('Erro ao criar tabela Usuarios:', createErr.message);
            } else {
                // Verificar se existe algum usuário
                db.get(`SELECT COUNT(*) as count FROM Usuarios`, [], (err, row) => {
                    if (!err && row.count === 0) {
                        const bcrypt = require('bcryptjs');
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync('SenhaPC+', salt);
                        db.run(`INSERT INTO Usuarios (Nome, Email, Senha) VALUES (?, ?, ?)`, ['Administrador', 'adm@pgxtech.com', hash]);
                        console.log('Usuário administrador padrão criado.');
                    }
                });
            }
        });
    }
});

module.exports = db;

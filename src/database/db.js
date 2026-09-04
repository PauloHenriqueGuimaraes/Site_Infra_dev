const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.error('Erro ao conectar ao banco de dados SQLite:', error.message);
        return;
    }

    console.log(`Banco de dados SQLite conectado: ${dbPath}`);
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Orcamentos (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome TEXT NOT NULL,
            Telefone TEXT NOT NULL,
            Categoria TEXT NOT NULL,
            Descricao TEXT,
            DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Usuarios (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            Senha TEXT NOT NULL,
            DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const pastaDatabase = path.join(
    __dirname,
    "..",
    "..",
    "database"
);

const caminhoDatabase = path.join(
    pastaDatabase,
    "comdoc.db"
);

let database = null;

function garantirPastaDatabase() {
    if (!fs.existsSync(pastaDatabase)) {
        fs.mkdirSync(pastaDatabase, {
            recursive: true
        });
    }
}

function criarTabelas() {
    database.exec(`
        CREATE TABLE IF NOT EXISTS produtos (
            codigo TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            descricao TEXT NOT NULL DEFAULT ''
        ) STRICT;

        CREATE TABLE IF NOT EXISTS produto_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto_codigo TEXT NOT NULL,
            codigo TEXT NOT NULL,
            descricao TEXT NOT NULL,
            quantidade INTEGER NOT NULL DEFAULT 1,
            valor_sugerido REAL NOT NULL DEFAULT 0,

            FOREIGN KEY (produto_codigo)
                REFERENCES produtos(codigo)
                ON DELETE CASCADE,

            UNIQUE (produto_codigo, codigo)
        ) STRICT;
    `);
}

function inicializarDatabase() {
    if (database) {
        return database;
    }

    garantirPastaDatabase();

    database = new DatabaseSync(caminhoDatabase);

    database.exec(`
        PRAGMA foreign_keys = ON;
    `);

    criarTabelas();

    return database;
}

function obterDatabase() {
    if (!database) {
        return inicializarDatabase();
    }

    return database;
}

module.exports = {
    inicializarDatabase,
    obterDatabase
};
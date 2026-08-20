const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const config = require("../config/environment");

const executarMigrations =
    require("./migrations");

const caminhoDatabase = config.caminhoDatabase;

let database = null;

function garantirPastaDatabase() {
    const pastaDatabase = path.dirname(caminhoDatabase);
    if (!fs.existsSync(pastaDatabase)) {
        fs.mkdirSync(pastaDatabase, {
            recursive: true
        });
    }
}

function inicializarDatabase() {
    if (database) {
        return database;
    }

    garantirPastaDatabase();

    database = new DatabaseSync(
        caminhoDatabase
    );

    database.exec(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
    `);

    executarMigrations(database);

    return database;
}

function obterDatabase() {
    if (!database) {
        return inicializarDatabase();
    }

    return database;
}

function verificarDatabase() {
    return obterDatabase().prepare("SELECT 1 AS ok").get().ok === 1;
}

function encerrarDatabase() {
    if (!database) return;
    database.exec("PRAGMA wal_checkpoint(TRUNCATE);");
    database.close();
    database = null;
}

module.exports = {
    inicializarDatabase,
    obterDatabase,
    verificarDatabase,
    encerrarDatabase,
    caminhoDatabase
};

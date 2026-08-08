const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const executarMigrations =
    require("./migrations");

const pastaDatabase = path.join(
    __dirname,
    "..",
    "..",
    "database"
);

const caminhoDatabase = process.env.COMDOC_DATABASE_PATH
    ? path.resolve(
        process.env.COMDOC_DATABASE_PATH
    )
    : path.join(
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

module.exports = {
    inicializarDatabase,
    obterDatabase
};

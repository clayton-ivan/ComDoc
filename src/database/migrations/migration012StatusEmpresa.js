const { colunaExiste } = require("../support/databaseStructure");

function migration012StatusEmpresa(database) {
    if (!colunaExiste(database, "empresa", "fg_status")) {
        database.exec(`
            ALTER TABLE empresa
            ADD COLUMN fg_status INTEGER NOT NULL DEFAULT 1
                CHECK (fg_status IN (0, 1));
        `);
    }

    database.exec("PRAGMA user_version = 12;");
}

module.exports = migration012StatusEmpresa;

const {
    colunaExiste,
    definirVersaoDatabase
} = require("../support/databaseStructure");

function migration006ApresentacaoBlocos(database) {
    if (
        !colunaExiste(
            database,
            "produto_bloco",
            "sg_alinhamento"
        )
    ) {
        database.exec(`
            ALTER TABLE produto_bloco
            ADD COLUMN sg_alinhamento TEXT
                NOT NULL
                DEFAULT 'ESQUERDA'
                CHECK (
                    sg_alinhamento IN (
                        'ESQUERDA',
                        'CENTRO',
                        'DIREITA'
                    )
                );
        `);
    }

    if (
        !colunaExiste(
            database,
            "produto_bloco",
            "sg_tipo_lista"
        )
    ) {
        database.exec(`
            ALTER TABLE produto_bloco
            ADD COLUMN sg_tipo_lista TEXT
                NOT NULL
                DEFAULT 'MARCADOR'
                CHECK (
                    sg_tipo_lista IN (
                        'MARCADOR',
                        'NUMERADOR'
                    )
                );
        `);
    }

    definirVersaoDatabase(database, 6);
}

module.exports = migration006ApresentacaoBlocos;

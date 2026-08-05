const {
    colunaExiste,
    definirVersaoDatabase
} = require("../support/databaseStructure");

function migration007TamanhoImagemBloco(database) {
    if (
        !colunaExiste(
            database,
            "produto_bloco",
            "sg_tamanho_imagem"
        )
    ) {
        database.exec(`
            ALTER TABLE produto_bloco
            ADD COLUMN sg_tamanho_imagem TEXT
                NOT NULL
                DEFAULT 'NORMAL'
                CHECK (
                    sg_tamanho_imagem IN (
                        'PEQUENO',
                        'NORMAL',
                        'GRANDE'
                    )
                );
        `);
    }

    definirVersaoDatabase(database, 7);
}

module.exports = migration007TamanhoImagemBloco;

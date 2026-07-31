function criarTabelaProduto(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS produto (
            id_produto INTEGER
                PRIMARY KEY AUTOINCREMENT,

            cod_produto TEXT
                NOT NULL
                UNIQUE,

            nom_produto TEXT
                NOT NULL,

            des_produto TEXT
                NOT NULL
                DEFAULT '',

            dt_criacao TEXT
                NOT NULL
                DEFAULT (
                    strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    )
                ),

            dt_edicao TEXT,

            cod_usu_edicao TEXT
        ) STRICT;
    `);
}

function criarTabelaProdutoItem(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS produto_item (
            id_produto INTEGER
                NOT NULL,

            id_produto_item INTEGER
                NOT NULL,

            des_item TEXT
                NOT NULL,

            num_quantidade INTEGER
                NOT NULL
                DEFAULT 1,

            val_unitario REAL
                NOT NULL
                DEFAULT 0,

            dt_criacao TEXT
                NOT NULL
                DEFAULT (
                    strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    )
                ),

            dt_edicao TEXT,

            cod_usu_edicao TEXT,

            PRIMARY KEY (
                id_produto,
                id_produto_item
            ),

            FOREIGN KEY (
                id_produto
            )
            REFERENCES produto (
                id_produto
            )
            ON DELETE CASCADE
        ) STRICT;
    `);
}

module.exports = {
    criarTabelaProduto,
    criarTabelaProdutoItem
};

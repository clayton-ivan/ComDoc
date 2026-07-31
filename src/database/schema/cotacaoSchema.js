function criarTabelaCotacao(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS cotacao (
            id_cotacao INTEGER
                PRIMARY KEY AUTOINCREMENT,

            id_empresa INTEGER NOT NULL,

            id_cliente INTEGER NOT NULL,

            id_produto INTEGER NOT NULL,

            num_cotacao INTEGER NOT NULL,

            dt_cotacao TEXT NOT NULL DEFAULT (
                strftime(
                    '%Y-%m-%dT%H:%M:%fZ',
                    'now'
                )
            ),

            val_total REAL NOT NULL DEFAULT 0,

            des_prazo_entrega TEXT NOT NULL
                DEFAULT '',

            des_condicao_pagamento TEXT NOT NULL
                DEFAULT '',

            sg_status TEXT NOT NULL
                DEFAULT 'GERADA',

            dt_criacao TEXT NOT NULL DEFAULT (
                strftime(
                    '%Y-%m-%dT%H:%M:%fZ',
                    'now'
                )
            ),

            cod_usu_criacao TEXT NOT NULL,

            UNIQUE (
                id_empresa,
                num_cotacao
            ),

            FOREIGN KEY (
                id_empresa
            )
                REFERENCES empresa (
                    id_empresa
                )
                ON DELETE RESTRICT,

            FOREIGN KEY (
                id_cliente
            )
                REFERENCES cliente (
                    id_cliente
                )
                ON DELETE RESTRICT,

            FOREIGN KEY (
                id_produto
            )
                REFERENCES produto (
                    id_produto
                )
                ON DELETE RESTRICT,

            CHECK (
                num_cotacao > 0
            ),

            CHECK (
                val_total >= 0
            ),

            CHECK (
                sg_status IN (
                    'GERADA',
                    'CANCELADA'
                )
            )
        ) STRICT;
    `);
}

function criarTabelaCotacaoItem(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS cotacao_item (
            id_cotacao INTEGER NOT NULL,

            id_cotacao_item INTEGER NOT NULL,

            des_item TEXT NOT NULL,

            num_quantidade INTEGER NOT NULL
                DEFAULT 1,

            val_unitario REAL NOT NULL
                DEFAULT 0,

            val_total REAL NOT NULL
                DEFAULT 0,

            PRIMARY KEY (
                id_cotacao,
                id_cotacao_item
            ),

            FOREIGN KEY (
                id_cotacao
            )
                REFERENCES cotacao (
                    id_cotacao
                )
                ON DELETE CASCADE,

            CHECK (
                num_quantidade >= 0
            ),

            CHECK (
                val_unitario >= 0
            ),

            CHECK (
                val_total >= 0
            )
        ) STRICT;
    `);
}

function criarIndicesCotacao(database) {
    database.exec(`
        CREATE INDEX IF NOT EXISTS
            idx_cotacao_empresa
        ON cotacao (
            id_empresa
        );

        CREATE INDEX IF NOT EXISTS
            idx_cotacao_cliente
        ON cotacao (
            id_cliente
        );

        CREATE INDEX IF NOT EXISTS
            idx_cotacao_produto
        ON cotacao (
            id_produto
        );

        CREATE INDEX IF NOT EXISTS
            idx_cotacao_data
        ON cotacao (
            id_empresa,
            dt_cotacao
        );
    `);
}

module.exports = {
    criarTabelaCotacao,
    criarTabelaCotacaoItem,
    criarIndicesCotacao
};

function criarTabelaPrazoEntrega(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS prazo_entrega (
            id_prazo_entrega INTEGER
                PRIMARY KEY AUTOINCREMENT,

            id_empresa INTEGER NOT NULL,

            des_prazo_entrega TEXT NOT NULL,

            dt_criacao TEXT NOT NULL DEFAULT (
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            ),

            cod_usu_criacao TEXT NOT NULL,

            FOREIGN KEY (id_empresa)
                REFERENCES empresa (id_empresa)
                ON DELETE CASCADE,

            CHECK (length(trim(des_prazo_entrega)) > 0)
        ) STRICT;

        CREATE UNIQUE INDEX IF NOT EXISTS
            uq_prazo_entrega_empresa_descricao
        ON prazo_entrega (
            id_empresa,
            des_prazo_entrega COLLATE NOCASE
        );
    `);
}

function criarTabelaFormaPagamento(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS forma_pagamento (
            id_forma_pagamento INTEGER
                PRIMARY KEY AUTOINCREMENT,

            id_empresa INTEGER NOT NULL,

            des_forma_pagamento TEXT NOT NULL,

            dt_criacao TEXT NOT NULL DEFAULT (
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            ),

            cod_usu_criacao TEXT NOT NULL,

            FOREIGN KEY (id_empresa)
                REFERENCES empresa (id_empresa)
                ON DELETE CASCADE,

            CHECK (length(trim(des_forma_pagamento)) > 0)
        ) STRICT;

        CREATE UNIQUE INDEX IF NOT EXISTS
            uq_forma_pagamento_empresa_descricao
        ON forma_pagamento (
            id_empresa,
            des_forma_pagamento COLLATE NOCASE
        );
    `);
}

module.exports = {
    criarTabelaPrazoEntrega,
    criarTabelaFormaPagamento
};

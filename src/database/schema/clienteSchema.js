const {
    indiceExiste
} = require("../support/databaseStructure");

function criarTabelaCliente(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS cliente (
            id_cliente INTEGER
                PRIMARY KEY AUTOINCREMENT,

            id_empresa INTEGER
                NOT NULL,

            nom_cliente TEXT
                NOT NULL,

            end_email TEXT,

            num_telefone TEXT,

            num_cpf TEXT,

            num_cnpj TEXT,

            nom_logradouro TEXT,

            num_endereco INTEGER,

            nom_complem TEXT,

            nom_cidade TEXT,

            sg_uf TEXT,

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

            FOREIGN KEY (
                id_empresa
            )
            REFERENCES empresa (
                id_empresa
            )
            ON DELETE RESTRICT
        ) STRICT;
    `);
}

function criarIndicesCliente(database) {
    database.exec(`
        CREATE INDEX IF NOT EXISTS
            idx_cliente_empresa
        ON cliente (
            id_empresa
        );

        CREATE INDEX IF NOT EXISTS
            idx_cliente_empresa_nome
        ON cliente (
            id_empresa,
            nom_cliente
        );
    `);

    if (
        !indiceExiste(
            database,
            "uq_cliente_empresa_cnpj"
        )
    ) {
        database.exec(`
            CREATE UNIQUE INDEX
                uq_cliente_empresa_cnpj
            ON cliente (
                id_empresa,
                num_cnpj
            )
            WHERE
                num_cnpj IS NOT NULL
                AND TRIM(num_cnpj) <> '';
        `);
    }

    if (
        !indiceExiste(
            database,
            "uq_cliente_empresa_cpf"
        )
    ) {
        database.exec(`
            CREATE UNIQUE INDEX
                uq_cliente_empresa_cpf
            ON cliente (
                id_empresa,
                num_cpf
            )
            WHERE
                num_cpf IS NOT NULL
                AND TRIM(num_cpf) <> '';
        `);
    }
}

module.exports = {
    criarTabelaCliente,
    criarIndicesCliente
};

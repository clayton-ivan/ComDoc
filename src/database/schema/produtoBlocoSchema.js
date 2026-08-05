function criarTabelaTipoBloco(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS dom_tipo_bloco (
            sg_tipo_bloco TEXT
                PRIMARY KEY,

            nom_tipo_bloco TEXT
                NOT NULL
                UNIQUE,

            num_ordem INTEGER
                NOT NULL
                UNIQUE,

            sg_ativo TEXT
                NOT NULL
                DEFAULT 'S',

            CHECK (
                num_ordem > 0
            ),

            CHECK (
                sg_ativo IN (
                    'S',
                    'N'
                )
            )
        ) STRICT;
    `);
}

function criarTiposBlocoPadrao(database) {
    const statement = database.prepare(`
        INSERT INTO dom_tipo_bloco (
            sg_tipo_bloco,
            nom_tipo_bloco,
            num_ordem,
            sg_ativo
        )
        VALUES (
            ?,
            ?,
            ?,
            'S'
        )
        ON CONFLICT (
            sg_tipo_bloco
        )
        DO UPDATE SET
            nom_tipo_bloco =
                excluded.nom_tipo_bloco,

            num_ordem =
                excluded.num_ordem
    `);

    const tiposBloco = [
        ["TEXTO", "Texto", 1],
        ["LISTA", "Lista", 2],
        ["TABELA", "Tabela", 3],
        ["IMAGEM", "Imagem", 4]
    ];

    for (const tipoBloco of tiposBloco) {
        statement.run(...tipoBloco);
    }
}

function criarTabelaProdutoBloco(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS produto_bloco (
            id_produto INTEGER
                NOT NULL,

            id_produto_bloco INTEGER
                NOT NULL,

            sg_tipo_bloco TEXT
                NOT NULL,

            num_ordem INTEGER
                NOT NULL,

            des_titulo TEXT
                NOT NULL
                DEFAULT '',

            des_conteudo TEXT
                NOT NULL
                DEFAULT '',

            sg_alinhamento TEXT
                NOT NULL
                DEFAULT 'ESQUERDA',

            sg_tipo_lista TEXT
                NOT NULL
                DEFAULT 'MARCADOR',

            sg_tamanho_imagem TEXT
                NOT NULL
                DEFAULT 'NORMAL',

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
                id_produto_bloco
            ),

            UNIQUE (
                id_produto,
                num_ordem
            ),

            FOREIGN KEY (
                id_produto
            )
            REFERENCES produto (
                id_produto
            )
            ON DELETE CASCADE,

            FOREIGN KEY (
                sg_tipo_bloco
            )
            REFERENCES dom_tipo_bloco (
                sg_tipo_bloco
            )
            ON DELETE RESTRICT,

            CHECK (
                id_produto_bloco > 0
            ),

            CHECK (
                num_ordem > 0
            ),

            CHECK (
                sg_alinhamento IN (
                    'ESQUERDA',
                    'CENTRO',
                    'DIREITA'
                )
            ),

            CHECK (
                sg_tipo_lista IN (
                    'MARCADOR',
                    'NUMERADOR'
                )
            ),

            CHECK (
                sg_tamanho_imagem IN (
                    'PEQUENO',
                    'NORMAL',
                    'GRANDE'
                )
            )
        ) STRICT;
    `);
}

function criarTabelaProdutoBlocoItem(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS produto_bloco_item (
            id_produto INTEGER
                NOT NULL,

            id_produto_bloco INTEGER
                NOT NULL,

            id_produto_bloco_item INTEGER
                NOT NULL,

            num_ordem INTEGER
                NOT NULL,

            num_linha INTEGER
                NOT NULL,

            num_coluna INTEGER
                NOT NULL,

            des_conteudo TEXT
                NOT NULL
                DEFAULT '',

            sg_cabecalho TEXT
                NOT NULL
                DEFAULT 'N',

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
                id_produto_bloco,
                id_produto_bloco_item
            ),

            UNIQUE (
                id_produto,
                id_produto_bloco,
                num_ordem
            ),

            UNIQUE (
                id_produto,
                id_produto_bloco,
                num_linha,
                num_coluna
            ),

            FOREIGN KEY (
                id_produto,
                id_produto_bloco
            )
            REFERENCES produto_bloco (
                id_produto,
                id_produto_bloco
            )
            ON DELETE CASCADE,

            CHECK (
                id_produto_bloco_item > 0
            ),

            CHECK (
                num_ordem > 0
            ),

            CHECK (
                num_linha > 0
            ),

            CHECK (
                num_coluna > 0
            ),

            CHECK (
                sg_cabecalho IN (
                    'S',
                    'N'
                )
            )
        ) STRICT;
    `);
}

module.exports = {
    criarTabelaTipoBloco,
    criarTiposBlocoPadrao,
    criarTabelaProdutoBloco,
    criarTabelaProdutoBlocoItem
};

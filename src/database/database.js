const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require("../constants/application");

const pastaDatabase = path.join(
    __dirname,
    "..",
    "..",
    "database"
);

const caminhoDatabase = path.join(
    pastaDatabase,
    "comdoc.db"
);

const VERSAO_ATUAL_DATABASE = 3;

let database = null;

/*
|--------------------------------------------------------------------------
| Estrutura física
|--------------------------------------------------------------------------
*/

function garantirPastaDatabase() {
    if (!fs.existsSync(pastaDatabase)) {
        fs.mkdirSync(pastaDatabase, {
            recursive: true
        });
    }
}

/*
|--------------------------------------------------------------------------
| Consultas estruturais
|--------------------------------------------------------------------------
*/

function tabelaExiste(nomeTabela) {
    const statement = database.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
    `);

    return Boolean(
        statement.get(nomeTabela)
    );
}

function colunaExiste(
    nomeTabela,
    nomeColuna
) {
    if (!tabelaExiste(nomeTabela)) {
        return false;
    }

    const colunas = database
        .prepare(
            `PRAGMA table_info(${nomeTabela})`
        )
        .all();

    return colunas.some(
        (coluna) =>
            coluna.name === nomeColuna
    );
}

function indiceExiste(nomeIndice) {
    const statement = database.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'index'
          AND name = ?
    `);

    return Boolean(
        statement.get(nomeIndice)
    );
}

function obterVersaoDatabase() {
    const resultado = database
        .prepare("PRAGMA user_version")
        .get();

    return Number(
        resultado.user_version
    ) || 0;
}

function definirVersaoDatabase(versao) {
    if (
        !Number.isInteger(versao) ||
        versao < 0
    ) {
        throw new Error(
            "A versão do banco deve ser um número inteiro não negativo."
        );
    }

    database.exec(
        `PRAGMA user_version = ${versao}`
    );
}

/*
|--------------------------------------------------------------------------
| Criação das tabelas
|--------------------------------------------------------------------------
*/

function criarTabelaProduto() {
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

function criarTabelaProdutoItem() {
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

function criarTabelaEmpresa() {
    database.exec(`
        CREATE TABLE IF NOT EXISTS empresa (
            id_empresa INTEGER
                PRIMARY KEY AUTOINCREMENT,

            nom_empresa TEXT
                NOT NULL,

            num_cnpj TEXT,

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

function criarTabelaCliente() {
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

function criarIndicesCliente() {
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

function criarEstruturaAtual() {
    criarTabelaProduto();
    criarTabelaProdutoItem();
    criarTabelaEmpresa();
    criarTabelaCliente();
    criarIndicesCliente();
}

/*
|--------------------------------------------------------------------------
| Dados iniciais
|--------------------------------------------------------------------------
*/

function criarEmpresaPadrao() {
    const empresaExistente = database
        .prepare(`
            SELECT id_empresa
            FROM empresa
            WHERE id_empresa = ?
        `)
        .get(ID_EMPRESA_PADRAO);

    if (empresaExistente) {
        return;
    }

    database
        .prepare(`
            INSERT INTO empresa (
                id_empresa,
                nom_empresa,
                num_cnpj,
                cod_usu_edicao
            )
            VALUES (
                ?,
                ?,
                NULL,
                ?
            )
        `)
        .run(
            ID_EMPRESA_PADRAO,
            "Empresa padrão",
            COD_USUARIO_SISTEMA
        );
}

/*
|--------------------------------------------------------------------------
| Migração das tabelas antigas de produtos
|--------------------------------------------------------------------------
*/

function migrarProdutosParaNovoModelo() {
    const possuiTabelaProdutos =
        tabelaExiste("produtos");

    const possuiTabelaProdutoItens =
        tabelaExiste("produto_itens");

    if (
        !possuiTabelaProdutos &&
        !possuiTabelaProdutoItens
    ) {
        return false;
    }

    if (
        !possuiTabelaProdutos ||
        !possuiTabelaProdutoItens
    ) {
        throw new Error(
            [
                "Estrutura antiga do banco incompleta.",
                "As tabelas produtos e produto_itens",
                "deveriam existir em conjunto."
            ].join(" ")
        );
    }

    database.exec(
        "PRAGMA foreign_keys = OFF"
    );

    try {
        database.exec(
            "BEGIN TRANSACTION"
        );

        database.exec(`
            ALTER TABLE produto_itens
            RENAME TO produto_itens_legado;

            ALTER TABLE produtos
            RENAME TO produtos_legado;
        `);

        criarTabelaProduto();
        criarTabelaProdutoItem();

        database.exec(`
            INSERT INTO produto (
                cod_produto,
                nom_produto,
                des_produto,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            )
            SELECT
                codigo,
                nome,
                COALESCE(
                    descricao,
                    ''
                ),
                strftime(
                    '%Y-%m-%dT%H:%M:%fZ',
                    'now'
                ),
                NULL,
                NULL
            FROM produtos_legado
            ORDER BY
                CAST(codigo AS INTEGER),
                codigo;
        `);

        database.exec(`
            INSERT INTO produto_item (
                id_produto,
                id_produto_item,
                des_item,
                num_quantidade,
                val_unitario,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            )
            SELECT
                produto.id_produto,

                ROW_NUMBER() OVER (
                    PARTITION BY
                        item.produto_codigo
                    ORDER BY
                        item.id
                ),

                item.descricao,
                item.quantidade,
                item.valor_sugerido,

                strftime(
                    '%Y-%m-%dT%H:%M:%fZ',
                    'now'
                ),

                NULL,
                NULL

            FROM produto_itens_legado
                AS item

            INNER JOIN produto
                ON produto.cod_produto =
                   item.produto_codigo

            ORDER BY
                produto.id_produto,
                item.id;
        `);

        database.exec(`
            DROP TABLE produto_itens_legado;
            DROP TABLE produtos_legado;
        `);

        database.exec("COMMIT");

        console.log(
            "Tabelas de produtos migradas para o novo padrão."
        );

        return true;
    } catch (erro) {
        try {
            database.exec("ROLLBACK");
        } catch {
            // A transação pode já ter sido encerrada.
        }

        throw erro;
    } finally {
        database.exec(
            "PRAGMA foreign_keys = ON"
        );
    }
}

/*
|--------------------------------------------------------------------------
| Migração do cliente para empresa
|--------------------------------------------------------------------------
*/

function migrarClienteParaEmpresa() {
    criarTabelaEmpresa();
    criarEmpresaPadrao();

    if (!tabelaExiste("cliente")) {
        criarTabelaCliente();
        criarIndicesCliente();

        return;
    }

    if (
        colunaExiste(
            "cliente",
            "id_empresa"
        )
    ) {
        database
            .prepare(`
                UPDATE cliente
                SET id_empresa = ?
                WHERE id_empresa IS NULL
            `)
            .run(ID_EMPRESA_PADRAO);

        criarIndicesCliente();

        return;
    }

    database.exec(
        "PRAGMA foreign_keys = OFF"
    );

    try {
        database.exec(
            "BEGIN TRANSACTION"
        );

        database.exec(`
            ALTER TABLE cliente
            RENAME TO cliente_legado;
        `);

        criarTabelaCliente();

        database
            .prepare(`
                INSERT INTO cliente (
                    id_cliente,
                    id_empresa,
                    nom_cliente,
                    end_email,
                    num_telefone,
                    num_cpf,
                    num_cnpj,
                    nom_logradouro,
                    num_endereco,
                    nom_complem,
                    nom_cidade,
                    sg_uf,
                    dt_criacao,
                    dt_edicao,
                    cod_usu_edicao
                )
                SELECT
                    id_cliente,
                    ?,
                    nom_cliente,
                    end_email,
                    num_telefone,
                    num_cpf,
                    num_cnpj,
                    nom_logradouro,
                    num_endereco,
                    nom_complem,
                    nom_cidade,
                    sg_uf,
                    dt_criacao,
                    dt_edicao,
                    cod_usu_edicao
                FROM cliente_legado
            `)
            .run(ID_EMPRESA_PADRAO);

        database.exec(`
            DROP TABLE cliente_legado;
        `);

        criarIndicesCliente();

        database.exec("COMMIT");

        console.log(
            "Clientes vinculados à empresa padrão."
        );
    } catch (erro) {
        try {
            database.exec("ROLLBACK");
        } catch {
            // A transação pode já ter sido encerrada.
        }

        throw erro;
    } finally {
        database.exec(
            "PRAGMA foreign_keys = ON"
        );
    }
}

/*
|--------------------------------------------------------------------------
| Migrations
|--------------------------------------------------------------------------
*/

function executarMigrations() {
    const versaoInicial =
        obterVersaoDatabase();

    /*
    |--------------------------------------------------------------------------
    | Versão 1: produtos
    |--------------------------------------------------------------------------
    */

    if (versaoInicial < 1) {
        const possuiEstruturaAntiga =
            tabelaExiste("produtos") ||
            tabelaExiste("produto_itens");

        if (possuiEstruturaAntiga) {
            migrarProdutosParaNovoModelo();
        } else {
            criarTabelaProduto();
            criarTabelaProdutoItem();
        }

        definirVersaoDatabase(1);
    }

    /*
    |--------------------------------------------------------------------------
    | Versão 2: clientes
    |--------------------------------------------------------------------------
    */

    if (obterVersaoDatabase() < 2) {
        /*
         * A tabela da versão 2 não tinha id_empresa.
         * Ela é criada nesse formato para manter a sequência
         * histórica das migrations.
         */
        database.exec(`
            CREATE TABLE IF NOT EXISTS cliente (
                id_cliente INTEGER
                    PRIMARY KEY AUTOINCREMENT,

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

                cod_usu_edicao TEXT
            ) STRICT;
        `);

        definirVersaoDatabase(2);
    }

    /*
    |--------------------------------------------------------------------------
    | Versão 3: empresas e isolamento de clientes
    |--------------------------------------------------------------------------
    */

    if (obterVersaoDatabase() < 3) {
        migrarClienteParaEmpresa();
        definirVersaoDatabase(3);
    }

    /*
    |--------------------------------------------------------------------------
    | Garantia estrutural
    |--------------------------------------------------------------------------
    */

    criarEstruturaAtual();
    criarEmpresaPadrao();

    const versaoFinal =
        obterVersaoDatabase();

    if (
        versaoFinal !==
        VERSAO_ATUAL_DATABASE
    ) {
        throw new Error(
            [
                "Versão inesperada do banco.",
                `Esperada: ${VERSAO_ATUAL_DATABASE}.`,
                `Encontrada: ${versaoFinal}.`
            ].join(" ")
        );
    }
}

/*
|--------------------------------------------------------------------------
| Inicialização
|--------------------------------------------------------------------------
*/

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

    executarMigrations();

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
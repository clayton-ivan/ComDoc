const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

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

const VERSAO_ATUAL_DATABASE = 2;

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

function obterVersaoDatabase() {
    const resultado = database
        .prepare("PRAGMA user_version")
        .get();

    return Number(resultado.user_version) || 0;
}

function definirVersaoDatabase(versao) {
    if (!Number.isInteger(versao) || versao < 0) {
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
            id_produto INTEGER PRIMARY KEY AUTOINCREMENT,

            cod_produto TEXT NOT NULL UNIQUE,

            nom_produto TEXT NOT NULL,

            des_produto TEXT NOT NULL DEFAULT '',

            dt_criacao TEXT NOT NULL DEFAULT (
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
            id_produto INTEGER NOT NULL,

            id_produto_item INTEGER NOT NULL,

            des_item TEXT NOT NULL,

            num_quantidade INTEGER NOT NULL DEFAULT 1,

            val_unitario REAL NOT NULL DEFAULT 0,

            dt_criacao TEXT NOT NULL DEFAULT (
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

            FOREIGN KEY (id_produto)
                REFERENCES produto(id_produto)
                ON DELETE CASCADE
        ) STRICT;
    `);
}

function criarTabelaCliente() {
    database.exec(`
        CREATE TABLE IF NOT EXISTS cliente (
            id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,

            nom_cliente TEXT NOT NULL,

            end_email TEXT,

            num_telefone TEXT,

            num_cpf TEXT,

            num_cnpj TEXT,

            nom_logradouro TEXT,

            num_endereco INTEGER,

            nom_complem TEXT,

            nom_cidade TEXT,

            sg_uf TEXT,

            dt_criacao TEXT NOT NULL DEFAULT (
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

function criarEstruturaAtual() {
    criarTabelaProduto();
    criarTabelaProdutoItem();
    criarTabelaCliente();
}

/*
|--------------------------------------------------------------------------
| Migração das tabelas antigas
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

    database.exec("PRAGMA foreign_keys = OFF");

    try {
        database.exec("BEGIN TRANSACTION");

        /*
        |--------------------------------------------------------------------------
        | Renomeia as tabelas antigas
        |--------------------------------------------------------------------------
        */

        database.exec(`
            ALTER TABLE produto_itens
            RENAME TO produto_itens_legado;

            ALTER TABLE produtos
            RENAME TO produtos_legado;
        `);

        /*
        |--------------------------------------------------------------------------
        | Cria as tabelas padronizadas
        |--------------------------------------------------------------------------
        */

        criarTabelaProduto();
        criarTabelaProdutoItem();

        /*
        |--------------------------------------------------------------------------
        | Migra os produtos
        |--------------------------------------------------------------------------
        */

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
                COALESCE(descricao, ''),
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

        /*
        |--------------------------------------------------------------------------
        | Migra os itens
        |--------------------------------------------------------------------------
        |
        | O id_produto_item é gerado sequencialmente para cada produto,
        | respeitando a ordem dos IDs existentes.
        |--------------------------------------------------------------------------
        */

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
                    PARTITION BY item.produto_codigo
                    ORDER BY item.id
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

            FROM produto_itens_legado AS item

            INNER JOIN produto
                ON produto.cod_produto =
                   item.produto_codigo

            ORDER BY
                produto.id_produto,
                item.id;
        `);

        /*
        |--------------------------------------------------------------------------
        | Remove as tabelas antigas
        |--------------------------------------------------------------------------
        */

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
        database.exec("PRAGMA foreign_keys = ON");
    }
}

/*
|--------------------------------------------------------------------------
| Migrations
|--------------------------------------------------------------------------
*/

function executarMigrations() {
    const versaoInicial = obterVersaoDatabase();

    /*
    |--------------------------------------------------------------------------
    | Banco antigo ou banco vazio
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
    | Versão 2: cadastro de clientes
    |--------------------------------------------------------------------------
    */

    if (obterVersaoDatabase() < 2) {
        criarTabelaCliente();

        definirVersaoDatabase(2);
    }

    /*
    |--------------------------------------------------------------------------
    | Garantia estrutural
    |--------------------------------------------------------------------------
    */

    criarEstruturaAtual();

    const versaoFinal = obterVersaoDatabase();

    if (versaoFinal !== VERSAO_ATUAL_DATABASE) {
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
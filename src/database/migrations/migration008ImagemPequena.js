const {
    definirVersaoDatabase
} = require("../support/databaseStructure");

const {
    criarTabelaProdutoBloco,
    criarTabelaProdutoBlocoItem
} = require("../schema/produtoBlocoSchema");

function suportaImagemPequena(database) {
    const registro = database.prepare(`
        SELECT sql
        FROM sqlite_master
        WHERE type = 'table'
          AND name = 'produto_bloco'
    `).get();

    return Boolean(
        registro?.sql?.includes("'PEQUENO'")
    );
}

function reconstruirTabelas(database) {
    database.exec("PRAGMA foreign_keys = OFF;");

    try {
        database.exec(`
            BEGIN IMMEDIATE;

            ALTER TABLE produto_bloco_item
            RENAME TO produto_bloco_item_legado_008;

            ALTER TABLE produto_bloco
            RENAME TO produto_bloco_legado_008;
        `);

        criarTabelaProdutoBloco(database);
        criarTabelaProdutoBlocoItem(database);

        database.exec(`
            INSERT INTO produto_bloco (
                id_produto,
                id_produto_bloco,
                sg_tipo_bloco,
                num_ordem,
                des_titulo,
                des_conteudo,
                sg_alinhamento,
                sg_tipo_lista,
                sg_tamanho_imagem,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            )
            SELECT
                id_produto,
                id_produto_bloco,
                sg_tipo_bloco,
                num_ordem,
                des_titulo,
                des_conteudo,
                sg_alinhamento,
                sg_tipo_lista,
                sg_tamanho_imagem,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            FROM produto_bloco_legado_008;

            INSERT INTO produto_bloco_item (
                id_produto,
                id_produto_bloco,
                id_produto_bloco_item,
                num_ordem,
                num_linha,
                num_coluna,
                des_conteudo,
                sg_cabecalho,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            )
            SELECT
                id_produto,
                id_produto_bloco,
                id_produto_bloco_item,
                num_ordem,
                num_linha,
                num_coluna,
                des_conteudo,
                sg_cabecalho,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            FROM produto_bloco_item_legado_008;

            DROP TABLE produto_bloco_item_legado_008;
            DROP TABLE produto_bloco_legado_008;

            COMMIT;
        `);
    } catch (erro) {
        try {
            database.exec("ROLLBACK;");
        } catch {
            // A transação pode já ter sido encerrada pelo SQLite.
        }

        throw erro;
    } finally {
        database.exec("PRAGMA foreign_keys = ON;");
    }

    const violacao = database
        .prepare("PRAGMA foreign_key_check")
        .get();

    if (violacao) {
        throw new Error(
            "A migration 008 encontrou uma referência inválida."
        );
    }
}

function migration008ImagemPequena(database) {
    if (!suportaImagemPequena(database)) {
        reconstruirTabelas(database);
    }

    definirVersaoDatabase(database, 8);
}

module.exports = migration008ImagemPequena;

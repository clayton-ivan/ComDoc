const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require("../../constants/application");

const {
    colunaExiste,
    definirVersaoDatabase
} = require("../support/databaseStructure");

const {
    criarTabelaProduto,
    criarIndicesProduto
} = require("../schema/produtoSchema");

const COLUNAS_EMPRESA = [
    ["nom_fantasia", "TEXT NOT NULL DEFAULT ''"],
    ["end_email", "TEXT NOT NULL DEFAULT ''"],
    ["num_telefone", "TEXT NOT NULL DEFAULT ''"],
    ["num_whatsapp", "TEXT NOT NULL DEFAULT ''"],
    ["nom_logradouro", "TEXT NOT NULL DEFAULT ''"],
    ["num_endereco", "TEXT NOT NULL DEFAULT ''"],
    ["nom_complem", "TEXT NOT NULL DEFAULT ''"],
    ["nom_bairro", "TEXT NOT NULL DEFAULT ''"],
    ["nom_cidade", "TEXT NOT NULL DEFAULT ''"],
    ["sg_uf", "TEXT NOT NULL DEFAULT ''"],
    ["num_cep", "TEXT NOT NULL DEFAULT ''"],
    ["end_site", "TEXT NOT NULL DEFAULT ''"],
    ["nom_instagram", "TEXT NOT NULL DEFAULT ''"],
    ["dsc_slogan", "TEXT NOT NULL DEFAULT ''"],
    ["cod_cor_primaria", "TEXT NOT NULL DEFAULT '#F36B21'"],
    ["cod_cor_secundaria", "TEXT NOT NULL DEFAULT '#1F2937'"],
    ["nom_arquivo_logo", "TEXT"]
];

function ampliarEmpresa(database) {
    for (const [nome, definicao] of COLUNAS_EMPRESA) {
        if (!colunaExiste(database, "empresa", nome)) {
            database.exec(
                `ALTER TABLE empresa ADD COLUMN ${nome} ${definicao}`
            );
        }
    }

    database.prepare(`
        UPDATE empresa
        SET
            nom_empresa = ?,
            nom_fantasia = ?,
            num_whatsapp = ?,
            nom_logradouro = ?,
            num_endereco = ?,
            nom_bairro = ?,
            nom_cidade = ?,
            sg_uf = ?,
            num_cep = ?,
            end_site = ?,
            nom_instagram = ?,
            dsc_slogan = ?,
            cod_cor_primaria = ?,
            cod_cor_secundaria = ?,
            dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            cod_usu_edicao = ?
        WHERE id_empresa = ?
          AND nom_empresa = 'Empresa padrão'
    `).run(
        "Alfa Gruas e Elevadores",
        "Alfa Gruas e Elevadores",
        "47996254427",
        "Rua Ver. Milton Ribeiro da Luz",
        "160",
        "Fazenda",
        "Itajaí",
        "SC",
        "88306025",
        "www.alfaelevadorescremlaheira.com.br",
        "@alfaelevadoresegruas",
        "Transformando projetos em grandes obras.",
        "#F36B21",
        "#1F2937",
        COD_USUARIO_SISTEMA,
        ID_EMPRESA_PADRAO
    );
}

function migrarProdutos(database) {
    if (colunaExiste(database, "produto", "id_empresa")) {
        criarIndicesProduto(database);
        return;
    }

    database.exec("PRAGMA foreign_keys = OFF");
    database.exec("PRAGMA legacy_alter_table = ON");

    try {
        database.exec("BEGIN TRANSACTION");
        database.exec("ALTER TABLE produto RENAME TO produto_legado");

        criarTabelaProduto(database);

        database.prepare(`
            INSERT INTO produto (
                id_produto,
                id_empresa,
                cod_produto,
                nom_produto,
                des_produto,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            )
            SELECT
                id_produto,
                ?,
                cod_produto,
                nom_produto,
                des_produto,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            FROM produto_legado
        `).run(ID_EMPRESA_PADRAO);

        database.exec("DROP TABLE produto_legado");
        criarIndicesProduto(database);
        database.exec("COMMIT");
    } catch (erro) {
        try {
            database.exec("ROLLBACK");
        } catch {
            // A transação pode já ter sido encerrada.
        }

        throw erro;
    } finally {
        database.exec("PRAGMA legacy_alter_table = OFF");
        database.exec("PRAGMA foreign_keys = ON");
    }
}

function migration009Multiempresa(database) {
    ampliarEmpresa(database);
    migrarProdutos(database);
    definirVersaoDatabase(database, 9);
}

module.exports = migration009Multiempresa;

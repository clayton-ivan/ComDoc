const {
    ID_EMPRESA_PADRAO
} = require("../../constants/application");

const {
    tabelaExiste,
    colunaExiste,
    definirVersaoDatabase
} = require("../support/databaseStructure");

const {
    criarTabelaEmpresa,
    criarEmpresaPadrao
} = require("../schema/empresaSchema");

const {
    criarTabelaCliente,
    criarIndicesCliente
} = require("../schema/clienteSchema");

function migrarClienteParaEmpresa(database) {
    criarTabelaEmpresa(database);
    criarEmpresaPadrao(database);

    if (!tabelaExiste(database, "cliente")) {
        criarTabelaCliente(database);
        criarIndicesCliente(database);

        return;
    }

    if (
        colunaExiste(
            database,
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

        criarIndicesCliente(database);

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

        criarTabelaCliente(database);

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

        criarIndicesCliente(database);

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

function migration003Empresas(database) {
    migrarClienteParaEmpresa(database);
    definirVersaoDatabase(database, 3);
}

module.exports = migration003Empresas;

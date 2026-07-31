const {
    obterVersaoDatabase
} = require("../support/databaseStructure");

const {
    criarEstruturaAtual
} = require("../schema");

const {
    criarEmpresaPadrao
} = require("../schema/empresaSchema");

const migration001Produtos =
    require("./migration001Produtos");

const migration002Clientes =
    require("./migration002Clientes");

const migration003Empresas =
    require("./migration003Empresas");

const migration004Cotacoes =
    require("./migration004Cotacoes");

const VERSAO_ATUAL_DATABASE = 4;

const migrations = [
    {
        versao: 1,
        executar: migration001Produtos
    },
    {
        versao: 2,
        executar: migration002Clientes
    },
    {
        versao: 3,
        executar: migration003Empresas
    },
    {
        versao: 4,
        executar: migration004Cotacoes
    }
];

function executarMigrations(database) {
    for (const migration of migrations) {
        if (
            obterVersaoDatabase(database) <
            migration.versao
        ) {
            migration.executar(database);
        }
    }

    criarEstruturaAtual(database);
    criarEmpresaPadrao(database);

    const versaoFinal =
        obterVersaoDatabase(database);

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

module.exports = executarMigrations;

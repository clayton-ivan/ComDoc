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

const migration005BlocosProduto =
    require("./migration005BlocosProduto");

const migration006ApresentacaoBlocos =
    require("./migration006ApresentacaoBlocos");

const migration007TamanhoImagemBloco =
    require("./migration007TamanhoImagemBloco");

const migration008ImagemPequena =
    require("./migration008ImagemPequena");

const migration009Multiempresa =
    require("./migration009Multiempresa");

const migration010CondicoesComerciais =
    require("./migration010CondicoesComerciais");

const VERSAO_ATUAL_DATABASE = 10;

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
    },
    {
        versao: 5,
        executar: migration005BlocosProduto
    },
    {
        versao: 6,
        executar: migration006ApresentacaoBlocos
    },
    {
        versao: 7,
        executar: migration007TamanhoImagemBloco
    },
    {
        versao: 8,
        executar: migration008ImagemPequena
    },
    {
        versao: 9,
        executar: migration009Multiempresa
    },
    {
        versao: 10,
        executar: migration010CondicoesComerciais
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

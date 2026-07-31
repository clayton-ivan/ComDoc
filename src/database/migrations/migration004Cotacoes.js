const {
    definirVersaoDatabase
} = require("../support/databaseStructure");

const {
    criarTabelaCotacao,
    criarTabelaCotacaoItem,
    criarIndicesCotacao
} = require("../schema/cotacaoSchema");

function migration004Cotacoes(database) {
    criarTabelaCotacao(database);
    criarTabelaCotacaoItem(database);
    criarIndicesCotacao(database);

    definirVersaoDatabase(database, 4);
}

module.exports = migration004Cotacoes;

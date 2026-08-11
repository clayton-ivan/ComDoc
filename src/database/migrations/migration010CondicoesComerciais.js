const {
    criarTabelaPrazoEntrega,
    criarTabelaFormaPagamento
} = require("../schema/condicaoComercialSchema");

const {
    definirVersaoDatabase
} = require("../support/databaseStructure");

function migration010CondicoesComerciais(database) {
    criarTabelaPrazoEntrega(database);
    criarTabelaFormaPagamento(database);
    definirVersaoDatabase(database, 10);
}

module.exports = migration010CondicoesComerciais;

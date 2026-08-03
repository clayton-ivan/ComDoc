const {
    definirVersaoDatabase
} = require("../support/databaseStructure");

const {
    criarTabelaTipoBloco,
    criarTiposBlocoPadrao,
    criarTabelaProdutoBloco,
    criarTabelaProdutoBlocoItem
} = require("../schema/produtoBlocoSchema");

function migration005BlocosProduto(database) {
    criarTabelaTipoBloco(database);
    criarTiposBlocoPadrao(database);

    criarTabelaProdutoBloco(database);
    criarTabelaProdutoBlocoItem(database);

    definirVersaoDatabase(database, 5);
}

module.exports = migration005BlocosProduto;
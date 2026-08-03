const {
    criarTabelaProduto,
    criarTabelaProdutoItem
} = require("./produtoSchema");

const {
    criarTabelaTipoBloco,
    criarTiposBlocoPadrao,
    criarTabelaProdutoBloco,
    criarTabelaProdutoBlocoItem
} = require("./produtoBlocoSchema");

const {
    criarTabelaEmpresa,
    criarEmpresaPadrao
} = require("./empresaSchema");

const {
    criarTabelaCliente,
    criarIndicesCliente
} = require("./clienteSchema");

const {
    criarTabelaCotacao,
    criarTabelaCotacaoItem,
    criarIndicesCotacao
} = require("./cotacaoSchema");

function criarEstruturaAtual(database) {
    criarTabelaProduto(database);
    criarTabelaProdutoItem(database);

    criarTabelaTipoBloco(database);
    criarTiposBlocoPadrao(database);
    criarTabelaProdutoBloco(database);
    criarTabelaProdutoBlocoItem(database);

    criarTabelaEmpresa(database);

    criarTabelaCliente(database);
    criarIndicesCliente(database);

    criarTabelaCotacao(database);
    criarTabelaCotacaoItem(database);
    criarIndicesCotacao(database);
}

module.exports = {
    criarEstruturaAtual,
    criarTabelaProduto,
    criarTabelaProdutoItem,
    criarTabelaTipoBloco,
    criarTiposBlocoPadrao,
    criarTabelaProdutoBloco,
    criarTabelaProdutoBlocoItem,
    criarTabelaEmpresa,
    criarEmpresaPadrao,
    criarTabelaCliente,
    criarIndicesCliente,
    criarTabelaCotacao,
    criarTabelaCotacaoItem,
    criarIndicesCotacao
};
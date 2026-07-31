const {
    criarTabelaProduto,
    criarTabelaProdutoItem
} = require("./produtoSchema");

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
    criarTabelaEmpresa,
    criarEmpresaPadrao,
    criarTabelaCliente,
    criarIndicesCliente,
    criarTabelaCotacao,
    criarTabelaCotacaoItem,
    criarIndicesCotacao
};

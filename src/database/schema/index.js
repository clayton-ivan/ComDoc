const {
    criarTabelaProduto,
    criarTabelaProdutoItem,
    criarIndicesProduto
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

const {
    criarTabelaPrazoEntrega,
    criarTabelaFormaPagamento
} = require("./condicaoComercialSchema");

const { criarTabelaUsuario } = require("./usuarioSchema");
const { criarTabelaParametroSistema } = require("./parametroSistemaSchema");

function criarEstruturaAtual(database) {
    criarTabelaProduto(database);
    criarTabelaProdutoItem(database);
    criarIndicesProduto(database);

    criarTabelaTipoBloco(database);
    criarTiposBlocoPadrao(database);
    criarTabelaProdutoBloco(database);
    criarTabelaProdutoBlocoItem(database);

    criarTabelaEmpresa(database);
    criarTabelaUsuario(database);
    criarTabelaParametroSistema(database);

    criarTabelaPrazoEntrega(database);
    criarTabelaFormaPagamento(database);

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
    criarIndicesProduto,
    criarTabelaTipoBloco,
    criarTiposBlocoPadrao,
    criarTabelaProdutoBloco,
    criarTabelaProdutoBlocoItem,
    criarTabelaEmpresa,
    criarEmpresaPadrao,
    criarTabelaPrazoEntrega,
    criarTabelaFormaPagamento,
    criarTabelaUsuario,
    criarTabelaParametroSistema,
    criarTabelaCliente,
    criarIndicesCliente,
    criarTabelaCotacao,
    criarTabelaCotacaoItem,
    criarIndicesCotacao
};

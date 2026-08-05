const cotacaoRepository =
    require(
        "../repositories/cotacaoRepository"
    );

const clientRepository =
    require(
        "../repositories/clientRepository"
    );

const productRepository =
    require(
        "../repositories/productRepository"
    );

const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require(
    "../constants/application"
);

/*
|--------------------------------------------------------------------------
| Normalização
|--------------------------------------------------------------------------
*/

function normalizarTexto(valor) {
    return String(
        valor ?? ""
    ).trim();
}

function normalizarId(valor, nomeCampo) {
    const id = Number(valor);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new Error(
            `${nomeCampo} é inválido.`
        );
    }

    return id;
}

function normalizarValor(
    valor,
    nomeCampo
) {
    const numero = Number(valor);

    if (
        !Number.isFinite(numero) ||
        numero < 0
    ) {
        throw new Error(
            `${nomeCampo} é inválido.`
        );
    }

    return numero;
}

function normalizarQuantidade(valor) {
    const quantidade = Number(valor);

    if (
        !Number.isInteger(quantidade) ||
        quantidade < 0
    ) {
        throw new Error(
            "A quantidade do item é inválida."
        );
    }

    return quantidade;
}

function normalizarItem(
    item,
    indice
) {
    const descricao =
        normalizarTexto(
            item?.descricao
        );

    if (!descricao) {
        throw new Error(
            `A descrição do item ${
                indice + 1
            } é obrigatória.`
        );
    }

    const quantidade =
        normalizarQuantidade(
            item?.quantidade
        );

    const valorUnitario =
        normalizarValor(
            item?.valorUnitario,
            "O valor unitário do item"
        );

    /*
     * O total é recalculado pelo backend.
     * Não confiamos no valor enviado pela tela.
     */
    const valorTotal =
        quantidade * valorUnitario;

    return {
        descricao,
        quantidade,
        valorUnitario,
        valorTotal
    };
}

/*
|--------------------------------------------------------------------------
| Normalização da cotação
|--------------------------------------------------------------------------
*/

function normalizarCotacao(
    dados = {}
) {
    const itensRecebidos =
        Array.isArray(dados.itens)
            ? dados.itens
            : [];

    if (itensRecebidos.length === 0) {
        throw new Error(
            "A cotação deve possuir ao menos um item."
        );
    }

    const itens =
        itensRecebidos.map(
            normalizarItem
        );

    const valorTotal =
        itens.reduce(
            (total, item) =>
                total +
                item.valorTotal,
            0
        );

    return {
        idCliente:
            normalizarId(
                dados.idCliente,
                "O cliente"
            ),

        produtoCodigo:
            normalizarTexto(
                dados.produtoCodigo
            ),

        valorTotal,

        prazoEntrega:
            normalizarTexto(
                dados.prazoEntrega
            ),

        condicaoPagamento:
            normalizarTexto(
                dados.pagamento
            ),

        itens
    };
}

/*
|--------------------------------------------------------------------------
| Validação das referências
|--------------------------------------------------------------------------
*/

function validarCliente(
    idEmpresa,
    idCliente
) {
    const cliente =
        clientRepository.buscarPorId(
            idEmpresa,
            idCliente
        );

    if (!cliente) {
        throw new Error(
            "Cliente não encontrado."
        );
    }

    return cliente;
}

function obterProduto(
    produtoCodigo
) {
    if (!produtoCodigo) {
        throw new Error(
            "O produto é obrigatório."
        );
    }

    const produto =
        productRepository
            .buscarPorCodigo(
                produtoCodigo
            );

    if (!produto) {
        throw new Error(
            "Produto não encontrado."
        );
    }

    return produto;
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(
    dados,
    codUsuarioCriacao =
        COD_USUARIO_SISTEMA
) {
    const idEmpresa =
        ID_EMPRESA_PADRAO;

    const cotacao =
        normalizarCotacao(dados);

    validarCliente(
        idEmpresa,
        cotacao.idCliente
    );

    const produto =
        obterProduto(
            cotacao.produtoCodigo
        );

    const cotacaoCriada =
        cotacaoRepository.criar(
        idEmpresa,
        {
            idCliente:
                cotacao.idCliente,

            idProduto:
                productRepository
                    .buscarIdPorCodigo(
                        produto.codigo
                    ),

            valorTotal:
                cotacao.valorTotal,

            prazoEntrega:
                cotacao.prazoEntrega,

            condicaoPagamento:
                cotacao
                    .condicaoPagamento,

            itens:
                cotacao.itens
        },
        codUsuarioCriacao
    );

    return {
        ...cotacaoCriada,
        produto
    };
}

module.exports = {
    criar
};

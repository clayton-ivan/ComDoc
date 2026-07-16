const productRepository = require(
    "../repositories/productRepository"
);

function listar() {
    const produtos = productRepository.listar();

    return produtos.sort((produtoA, produtoB) =>
        produtoA.nome.localeCompare(
            produtoB.nome,
            "pt-BR"
        )
    );
}

function buscarPorCodigo(codigo) {
    if (!codigo) {
        return null;
    }

    return productRepository.buscarPorCodigo(codigo);
}

function validarItens(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
        throw new Error(
            "O produto deve possuir ao menos um item."
        );
    }

    return itens.map((item, indice) => {
        const codigo = String(
            item.codigo || ""
        ).trim();

        const descricao = String(
            item.descricao || ""
        ).trim();

        const quantidade = Number(item.quantidade);
        const valorSugerido = Number(item.valorSugerido);

        if (!codigo) {
            throw new Error(
                `O código do item ${indice + 1} é obrigatório.`
            );
        }

        if (!descricao) {
            throw new Error(
                `A descrição do item ${indice + 1} é obrigatória.`
            );
        }

        if (
            !Number.isInteger(quantidade) ||
            quantidade < 1
        ) {
            throw new Error(
                `A quantidade do item ${indice + 1} deve ser um número inteiro maior que zero.`
            );
        }

        if (
            !Number.isFinite(valorSugerido) ||
            valorSugerido < 0
        ) {
            throw new Error(
                `O valor sugerido do item ${indice + 1} é inválido.`
            );
        }

        return {
            codigo,
            descricao,
            quantidade,
            valorSugerido
        };
    });
}

function montarProduto(codigo, dadosProduto) {
    const nome = String(
        dadosProduto.nome || ""
    ).trim();

    const descricao = String(
        dadosProduto.descricao || ""
    ).trim();

    if (!codigo) {
        throw new Error(
            "O código do produto é obrigatório."
        );
    }

    if (!nome) {
        throw new Error(
            "O nome do produto é obrigatório."
        );
    }

    if (!descricao) {
        throw new Error(
            "A descrição do produto é obrigatória."
        );
    }

    const itens = validarItens(dadosProduto.itens);

    return {
        codigo,
        nome,
        descricao,
        itens
    };
}

function criar(dadosProduto) {
    const codigo = String(
        dadosProduto.codigo || ""
    ).trim();

    const produtoExistente =
        productRepository.buscarPorCodigo(codigo);

    if (produtoExistente) {
        throw new Error(
            `Já existe um produto com o código "${codigo}".`
        );
    }

    const produto = montarProduto(
        codigo,
        dadosProduto
    );

    return productRepository.criar(produto);
}

function atualizar(codigo, dadosProduto) {
    const codigoNormalizado = String(
        codigo || ""
    ).trim();

    const produtoExistente =
        productRepository.buscarPorCodigo(
            codigoNormalizado
        );

    if (!produtoExistente) {
        return null;
    }

    const produto = montarProduto(
        codigoNormalizado,
        dadosProduto
    );

    return productRepository.atualizar(
        codigoNormalizado,
        produto
    );
}

function excluir(codigo) {
    const codigoNormalizado = String(
        codigo || ""
    ).trim();

    if (!codigoNormalizado) {
        return false;
    }

    return productRepository.excluir(
        codigoNormalizado
    );
}

module.exports = {
    listar,
    buscarPorCodigo,
    criar,
    atualizar,
    excluir
};
const databaseRepository =
    require("../database/databaseRepository");

/*
|--------------------------------------------------------------------------
| Mapeamento
|--------------------------------------------------------------------------
*/

function mapearItem(registro) {
    return {
        codigo: registro.codigo,
        descricao: registro.descricao,
        quantidade: registro.quantidade,
        valorSugerido: registro.valor_sugerido
    };
}

function mapearProduto(registro, itens = []) {
    return {
        codigo: registro.codigo,
        nome: registro.nome,
        descricao: registro.descricao,
        itens
    };
}

function organizarProdutosComItens(
    registrosProdutos,
    registrosItens
) {
    const itensPorProduto = new Map();

    registrosItens.forEach((registroItem) => {
        const codigoProduto =
            registroItem.produto_codigo;

        if (!itensPorProduto.has(codigoProduto)) {
            itensPorProduto.set(codigoProduto, []);
        }

        itensPorProduto
            .get(codigoProduto)
            .push(mapearItem(registroItem));
    });

    return registrosProdutos.map((registroProduto) => {
        const itens =
            itensPorProduto.get(registroProduto.codigo) || [];

        return mapearProduto(
            registroProduto,
            itens
        );
    });
}

/*
|--------------------------------------------------------------------------
| Itens
|--------------------------------------------------------------------------
*/

function inserirItensProduto(
    produtoCodigo,
    itens = []
) {
    itens.forEach((item, indice) => {
        databaseRepository.executar(
            `
                INSERT INTO produto_itens (
                    produto_codigo,
                    codigo,
                    descricao,
                    quantidade,
                    valor_sugerido
                )
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                produtoCodigo,
                String(item.codigo || indice + 1),
                item.descricao || "",
                Number(item.quantidade) || 0,
                Number(item.valorSugerido) || 0
            ]
        );
    });
}

function excluirItensProduto(produtoCodigo) {
    databaseRepository.executar(
        `
            DELETE FROM produto_itens
            WHERE produto_codigo = ?
        `,
        [produtoCodigo]
    );
}

/*
|--------------------------------------------------------------------------
| Consultas
|--------------------------------------------------------------------------
*/

function listar() {
    const produtos =
        databaseRepository.buscarTodos(
            `
                SELECT
                    codigo,
                    nome,
                    descricao
                FROM produtos
                ORDER BY CAST(codigo AS INTEGER), codigo
            `
        );

    if (produtos.length === 0) {
        return [];
    }

    const itens =
        databaseRepository.buscarTodos(
            `
                SELECT
                    produto_codigo,
                    codigo,
                    descricao,
                    quantidade,
                    valor_sugerido
                FROM produto_itens
                ORDER BY
                    CAST(produto_codigo AS INTEGER),
                    produto_codigo,
                    CAST(codigo AS INTEGER),
                    codigo
            `
        );

    return organizarProdutosComItens(
        produtos,
        itens
    );
}

function buscarPorCodigo(codigo) {
    const produto =
        databaseRepository.buscarUm(
            `
                SELECT
                    codigo,
                    nome,
                    descricao
                FROM produtos
                WHERE codigo = ?
            `,
            [String(codigo)]
        );

    if (!produto) {
        return null;
    }

    const itens =
        databaseRepository.buscarTodos(
            `
                SELECT
                    produto_codigo,
                    codigo,
                    descricao,
                    quantidade,
                    valor_sugerido
                FROM produto_itens
                WHERE produto_codigo = ?
                ORDER BY
                    CAST(codigo AS INTEGER),
                    codigo
            `,
            [String(codigo)]
        );

    return mapearProduto(
        produto,
        itens.map(mapearItem)
    );
}

/*
|--------------------------------------------------------------------------
| Escrita
|--------------------------------------------------------------------------
*/

function criar(produto) {
    const codigo = String(produto.codigo);

    return databaseRepository.executarTransacao(() => {
        databaseRepository.executar(
            `
                INSERT INTO produtos (
                    codigo,
                    nome,
                    descricao
                )
                VALUES (?, ?, ?)
            `,
            [
                codigo,
                produto.nome,
                produto.descricao || ""
            ]
        );

        inserirItensProduto(
            codigo,
            produto.itens
        );

        return buscarPorCodigo(codigo);
    });
}

function atualizar(codigo, produto) {
    const codigoProduto = String(codigo);

    return databaseRepository.executarTransacao(() => {
        const produtoExistente =
            databaseRepository.buscarUm(
                `
                    SELECT codigo
                    FROM produtos
                    WHERE codigo = ?
                `,
                [codigoProduto]
            );

        if (!produtoExistente) {
            return null;
        }

        databaseRepository.executar(
            `
                UPDATE produtos
                SET
                    nome = ?,
                    descricao = ?
                WHERE codigo = ?
            `,
            [
                produto.nome,
                produto.descricao || "",
                codigoProduto
            ]
        );

        excluirItensProduto(codigoProduto);

        inserirItensProduto(
            codigoProduto,
            produto.itens
        );

        return buscarPorCodigo(codigoProduto);
    });
}

function excluir(codigo) {
    const resultado =
        databaseRepository.executar(
            `
                DELETE FROM produtos
                WHERE codigo = ?
            `,
            [String(codigo)]
        );

    return Number(resultado.changes) > 0;
}

/*
|--------------------------------------------------------------------------
| Próximo código
|--------------------------------------------------------------------------
*/

function obterProximoCodigo() {
    const resultado =
        databaseRepository.buscarUm(
            `
                SELECT
                    COALESCE(
                        MAX(
                            CASE
                                WHEN codigo GLOB '[0-9]*'
                                THEN CAST(codigo AS INTEGER)
                                ELSE 0
                            END
                        ),
                        0
                    ) + 1 AS proximo_codigo
                FROM produtos
            `
        );

    return String(resultado.proximo_codigo);
}

module.exports = {
    listar,
    buscarPorCodigo,
    criar,
    atualizar,
    excluir,
    obterProximoCodigo
};
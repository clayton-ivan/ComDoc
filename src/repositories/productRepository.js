const databaseRepository =
    require("../database/databaseRepository");

const productBlockRepository = require(
    "./productBlockRepository"
);

/*
|--------------------------------------------------------------------------
| Mapeamento
|--------------------------------------------------------------------------
*/

function mapearItem(registro) {
    return {
        codigo: String(
            registro.id_produto_item
        ),

        descricao:
            registro.des_item,

        quantidade:
            registro.num_quantidade,

        valorSugerido:
            registro.val_unitario
    };
}

function mapearProduto(
    registro,
    itens = [],
    blocos = []
) {
    return {
        codigo:
            registro.cod_produto,

        nome:
            registro.nom_produto,

        descricao:
            registro.des_produto,

        itens,
        blocos
    };
}

function organizarProdutosComItens(
    registrosProdutos,
    registrosItens
) {
    const itensPorProduto = new Map();

    registrosItens.forEach((registroItem) => {
        const idProduto =
            registroItem.id_produto;

        if (!itensPorProduto.has(idProduto)) {
            itensPorProduto.set(
                idProduto,
                []
            );
        }

        itensPorProduto
            .get(idProduto)
            .push(
                mapearItem(registroItem)
            );
    });

    return registrosProdutos.map(
        (registroProduto) => {
            const itens =
                itensPorProduto.get(
                    registroProduto.id_produto
                ) || [];

            const blocos =
                productBlockRepository
                    .listarPorIdProduto(
                        registroProduto.id_produto
                    );

            return mapearProduto(
                registroProduto,
                itens,
                blocos
            );
        }
    );
}

/*
|--------------------------------------------------------------------------
| Consultas internas
|--------------------------------------------------------------------------
*/

function buscarRegistroPorCodigo(idEmpresa, codigo) {
    return databaseRepository.buscarUm(
        `
            SELECT
                id_produto,
                cod_produto,
                nom_produto,
                des_produto,
                dt_criacao,
                dt_edicao,
                cod_usu_edicao
            FROM produto
            WHERE id_empresa = ?
              AND cod_produto = ?
        `,
        [idEmpresa, String(codigo)]
    );
}

/*
|--------------------------------------------------------------------------
| Itens
|--------------------------------------------------------------------------
*/

function inserirItensProduto(
    idProduto,
    itens = []
) {
    itens.forEach((item, indice) => {
        databaseRepository.executar(
            `
                INSERT INTO produto_item (
                    id_produto,
                    id_produto_item,
                    des_item,
                    num_quantidade,
                    val_unitario,
                    dt_criacao,
                    dt_edicao,
                    cod_usu_edicao
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    strftime(
                        '%Y-%m-%dT%H:%M:%fZ',
                        'now'
                    ),
                    NULL,
                    NULL
                )
            `,
            [
                idProduto,
                indice + 1,
                item.descricao || "",
                Number(item.quantidade) || 0,
                Number(item.valorSugerido) || 0
            ]
        );
    });
}

function excluirItensProduto(idProduto) {
    databaseRepository.executar(
        `
            DELETE FROM produto_item
            WHERE id_produto = ?
        `,
        [idProduto]
    );
}

/*
|--------------------------------------------------------------------------
| Consultas públicas
|--------------------------------------------------------------------------
*/

function listar(idEmpresa) {
    const produtos =
        databaseRepository.buscarTodos(
            `
                SELECT
                    id_produto,
                    cod_produto,
                    nom_produto,
                    des_produto
                FROM produto
                WHERE id_empresa = ?
                ORDER BY
                    CAST(cod_produto AS INTEGER),
                    cod_produto
            `,
            [idEmpresa]
        );

    if (produtos.length === 0) {
        return [];
    }

    const itens =
        databaseRepository.buscarTodos(
            `
                SELECT
                    id_produto,
                    id_produto_item,
                    des_item,
                    num_quantidade,
                    val_unitario
                FROM produto_item
                WHERE id_produto IN (
                    SELECT id_produto
                    FROM produto
                    WHERE id_empresa = ?
                )
                ORDER BY
                    id_produto,
                    id_produto_item
            `,
            [idEmpresa]
        );

    return organizarProdutosComItens(
        produtos,
        itens
    );
}

function buscarPorCodigo(idEmpresa, codigo) {
    const produto =
        buscarRegistroPorCodigo(idEmpresa, codigo);

    if (!produto) {
        return null;
    }

    const itens =
        databaseRepository.buscarTodos(
            `
                SELECT
                    id_produto,
                    id_produto_item,
                    des_item,
                    num_quantidade,
                    val_unitario
                FROM produto_item
                WHERE id_produto = ?
                ORDER BY id_produto_item
            `,
            [produto.id_produto]
        );

    const blocos =
        productBlockRepository
            .listarPorIdProduto(
                produto.id_produto
            );

    return mapearProduto(
        produto,
        itens.map(mapearItem),
        blocos
    );
}

function buscarIdPorCodigo(idEmpresa, codigo) {
    const registro =
        buscarRegistroPorCodigo(idEmpresa, codigo);

    if (!registro) {
        return null;
    }

    return Number(
        registro.id_produto
    );
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(idEmpresa, produto) {
    const codigoProduto =
        String(produto.codigo);

    return databaseRepository
        .executarTransacao(() => {
            const resultado =
                databaseRepository.executar(
                    `
                        INSERT INTO produto (
                            id_empresa,
                            cod_produto,
                            nom_produto,
                            des_produto,
                            dt_criacao,
                            dt_edicao,
                            cod_usu_edicao
                        )
                        VALUES (
                            ?,
                            ?,
                            ?,
                            ?,
                            strftime(
                                '%Y-%m-%dT%H:%M:%fZ',
                                'now'
                            ),
                            NULL,
                            NULL
                        )
                    `,
                    [
                        idEmpresa,
                        codigoProduto,
                        produto.nome,
                        produto.descricao || ""
                    ]
                );

            const idProduto =
                Number(resultado.lastInsertRowid);

            inserirItensProduto(
                idProduto,
                produto.itens
            );

            return buscarPorCodigo(
                idEmpresa,
                codigoProduto
            );
        });
}

/*
|--------------------------------------------------------------------------
| Atualização
|--------------------------------------------------------------------------
*/

function atualizar(idEmpresa, codigo, produto) {
    const codigoProduto =
        String(codigo);

    return databaseRepository
        .executarTransacao(() => {
            const produtoExistente =
                buscarRegistroPorCodigo(
                    idEmpresa,
                    codigoProduto
                );

            if (!produtoExistente) {
                return null;
            }

            databaseRepository.executar(
                `
                    UPDATE produto
                    SET
                        nom_produto = ?,
                        des_produto = ?,
                        dt_edicao = strftime(
                            '%Y-%m-%dT%H:%M:%fZ',
                            'now'
                        ),
                        cod_usu_edicao = NULL
                    WHERE id_produto = ?
                `,
                [
                    produto.nome,
                    produto.descricao || "",
                    produtoExistente.id_produto
                ]
            );

            excluirItensProduto(
                produtoExistente.id_produto
            );

            inserirItensProduto(
                produtoExistente.id_produto,
                produto.itens
            );

            return buscarPorCodigo(
                idEmpresa,
                codigoProduto
            );
        });
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

function excluir(idEmpresa, codigo) {
    const resultado =
        databaseRepository.executar(
            `
                DELETE FROM produto
                WHERE id_empresa = ?
                  AND cod_produto = ?
            `,
            [idEmpresa, String(codigo)]
        );

    return Number(resultado.changes) > 0;
}

/*
|--------------------------------------------------------------------------
| Próximo código
|--------------------------------------------------------------------------
*/

function obterProximoCodigo(idEmpresa) {
    const resultado =
        databaseRepository.buscarUm(
            `
                SELECT
                    COALESCE(
                        MAX(
                            CASE
                                WHEN cod_produto
                                    GLOB '[0-9]*'
                                THEN CAST(
                                    cod_produto AS INTEGER
                                )
                                ELSE 0
                            END
                        ),
                        0
                    ) + 1 AS proximo_codigo
                FROM produto
                WHERE id_empresa = ?
            `,
            [idEmpresa]
        );

    return String(
        resultado.proximo_codigo
    );
}

module.exports = {
    listar,
    buscarPorCodigo,
    buscarIdPorCodigo,
    criar,
    atualizar,
    excluir,
    obterProximoCodigo
};

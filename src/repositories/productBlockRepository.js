const databaseRepository =
    require("../database/databaseRepository");

/*
|--------------------------------------------------------------------------
| Mapeamento
|--------------------------------------------------------------------------
*/

function mapearItem(registro) {
    return {
        codigo: String(
            registro.id_produto_bloco_item
        ),

        ordem:
            registro.num_ordem,

        linha:
            registro.num_linha,

        coluna:
            registro.num_coluna,

        conteudo:
            registro.des_conteudo,

        cabecalho:
            registro.sg_cabecalho === "S"
    };
}

function mapearBloco(
    registro,
    itens = []
) {
    return {
        codigo: String(
            registro.id_produto_bloco
        ),

        tipo:
            registro.sg_tipo_bloco,

        ordem:
            registro.num_ordem,

        titulo:
            registro.des_titulo,

        conteudo:
            registro.des_conteudo,

        alinhamento:
            registro.sg_alinhamento,

        tipoLista:
            registro.sg_tipo_lista,

        tamanhoImagem:
            registro.sg_tamanho_imagem,

        itens
    };
}

function organizarBlocosComItens(
    registrosBlocos,
    registrosItens
) {
    const itensPorBloco = new Map();

    registrosItens.forEach((registroItem) => {
        const chave = [
            registroItem.id_produto,
            registroItem.id_produto_bloco
        ].join(":");

        if (!itensPorBloco.has(chave)) {
            itensPorBloco.set(
                chave,
                []
            );
        }

        itensPorBloco
            .get(chave)
            .push(
                mapearItem(registroItem)
            );
    });

    return registrosBlocos.map(
        (registroBloco) => {
            const chave = [
                registroBloco.id_produto,
                registroBloco.id_produto_bloco
            ].join(":");

            const itens =
                itensPorBloco.get(chave) || [];

            return mapearBloco(
                registroBloco,
                itens
            );
        }
    );
}

/*
|--------------------------------------------------------------------------
| Consultas internas
|--------------------------------------------------------------------------
*/

function buscarIdProdutoPorCodigo(codigoProduto) {
    const registro =
        databaseRepository.buscarUm(
            `
                SELECT id_produto
                FROM produto
                WHERE cod_produto = ?
            `,
            [String(codigoProduto)]
        );

    if (!registro) {
        return null;
    }

    return Number(
        registro.id_produto
    );
}

function buscarBlocosPorIdProduto(idProduto) {
    return databaseRepository.buscarTodos(
        `
            SELECT
                id_produto,
                id_produto_bloco,
                sg_tipo_bloco,
                num_ordem,
                des_titulo,
                des_conteudo,
                sg_alinhamento,
                sg_tipo_lista,
                sg_tamanho_imagem
            FROM produto_bloco
            WHERE id_produto = ?
            ORDER BY
                num_ordem,
                id_produto_bloco
        `,
        [idProduto]
    );
}

function buscarItensPorIdProduto(idProduto) {
    return databaseRepository.buscarTodos(
        `
            SELECT
                id_produto,
                id_produto_bloco,
                id_produto_bloco_item,
                num_ordem,
                num_linha,
                num_coluna,
                des_conteudo,
                sg_cabecalho
            FROM produto_bloco_item
            WHERE id_produto = ?
            ORDER BY
                id_produto_bloco,
                num_ordem,
                num_linha,
                num_coluna
        `,
        [idProduto]
    );
}

/*
|--------------------------------------------------------------------------
| Tipos de bloco
|--------------------------------------------------------------------------
*/

function listarTiposAtivos() {
    const registros =
        databaseRepository.buscarTodos(
            `
                SELECT
                    sg_tipo_bloco,
                    nom_tipo_bloco,
                    num_ordem
                FROM dom_tipo_bloco
                WHERE sg_ativo = 'S'
                ORDER BY num_ordem
            `
        );

    return registros.map((registro) => ({
        codigo:
            registro.sg_tipo_bloco,

        nome:
            registro.nom_tipo_bloco,

        ordem:
            registro.num_ordem
    }));
}

/*
|--------------------------------------------------------------------------
| Consulta dos blocos
|--------------------------------------------------------------------------
*/

function listarPorIdProduto(idProduto) {
    const registrosBlocos =
        buscarBlocosPorIdProduto(idProduto);

    if (registrosBlocos.length === 0) {
        return [];
    }

    const registrosItens =
        buscarItensPorIdProduto(idProduto);

    return organizarBlocosComItens(
        registrosBlocos,
        registrosItens
    );
}

function listarPorCodigoProduto(codigoProduto) {
    const idProduto =
        buscarIdProdutoPorCodigo(
            codigoProduto
        );

    if (idProduto === null) {
        return null;
    }

    return listarPorIdProduto(idProduto);
}

/*
|--------------------------------------------------------------------------
| Inserção
|--------------------------------------------------------------------------
*/

function inserirItensBloco(
    idProduto,
    idProdutoBloco,
    itens = []
) {
    itens.forEach((item, indice) => {
        databaseRepository.executar(
            `
                INSERT INTO produto_bloco_item (
                    id_produto,
                    id_produto_bloco,
                    id_produto_bloco_item,
                    num_ordem,
                    num_linha,
                    num_coluna,
                    des_conteudo,
                    sg_cabecalho,
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
                idProdutoBloco,
                indice + 1,
                indice + 1,
                Number(item.linha) || indice + 1,
                Number(item.coluna) || 1,
                item.conteudo || "",
                item.cabecalho ? "S" : "N"
            ]
        );
    });
}

function inserirBlocos(
    idProduto,
    blocos = []
) {
    blocos.forEach((bloco, indice) => {
        const idProdutoBloco =
            indice + 1;

        databaseRepository.executar(
            `
                INSERT INTO produto_bloco (
                    id_produto,
                    id_produto_bloco,
                    sg_tipo_bloco,
                    num_ordem,
                    des_titulo,
                    des_conteudo,
                    sg_alinhamento,
                    sg_tipo_lista,
                    sg_tamanho_imagem,
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
                idProdutoBloco,
                bloco.tipo,
                indice + 1,
                bloco.titulo || "",
                bloco.conteudo || "",
                bloco.alinhamento || "ESQUERDA",
                bloco.tipoLista || "MARCADOR",
                bloco.tamanhoImagem || "NORMAL"
            ]
        );

        inserirItensBloco(
            idProduto,
            idProdutoBloco,
            bloco.itens
        );
    });
}

/*
|--------------------------------------------------------------------------
| Exclusão e substituição
|--------------------------------------------------------------------------
*/

function excluirPorIdProduto(idProduto) {
    const resultado =
        databaseRepository.executar(
            `
                DELETE FROM produto_bloco
                WHERE id_produto = ?
            `,
            [idProduto]
        );

    return Number(resultado.changes);
}

function substituirPorIdProduto(
    idProduto,
    blocos = []
) {
    return databaseRepository
        .executarTransacao(() => {
            excluirPorIdProduto(idProduto);

            inserirBlocos(
                idProduto,
                blocos
            );

            return listarPorIdProduto(
                idProduto
            );
        });
}

function substituirPorCodigoProduto(
    codigoProduto,
    blocos = []
) {
    const idProduto =
        buscarIdProdutoPorCodigo(
            codigoProduto
        );

    if (idProduto === null) {
        return null;
    }

    return substituirPorIdProduto(
        idProduto,
        blocos
    );
}

module.exports = {
    listarTiposAtivos,
    listarPorIdProduto,
    listarPorCodigoProduto,
    inserirBlocos,
    excluirPorIdProduto,
    substituirPorIdProduto,
    substituirPorCodigoProduto
};

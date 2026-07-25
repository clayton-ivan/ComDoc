const databaseRepository =
    require(
        "../database/databaseRepository"
    );

/*
|--------------------------------------------------------------------------
| Campos
|--------------------------------------------------------------------------
*/

const CAMPOS_COTACAO = `
    id_cotacao,
    id_empresa,
    id_cliente,
    id_produto,
    num_cotacao,
    dt_cotacao,
    val_total,
    des_prazo_entrega,
    des_condicao_pagamento,
    sg_status,
    dt_criacao,
    cod_usu_criacao
`;

/*
|--------------------------------------------------------------------------
| Mapeamento
|--------------------------------------------------------------------------
*/

function mapearItem(registro) {
    return {
        idCotacao:
            registro.id_cotacao,

        idCotacaoItem:
            registro.id_cotacao_item,

        descricao:
            registro.des_item,

        quantidade:
            registro.num_quantidade,

        valorUnitario:
            registro.val_unitario,

        valorTotal:
            registro.val_total
    };
}

function mapearCotacao(
    registro,
    itens = []
) {
    if (!registro) {
        return null;
    }

    return {
        idCotacao:
            registro.id_cotacao,

        idEmpresa:
            registro.id_empresa,

        idCliente:
            registro.id_cliente,

        idProduto:
            registro.id_produto,

        numero:
            registro.num_cotacao,

        dataCotacao:
            registro.dt_cotacao,

        valorTotal:
            registro.val_total,

        prazoEntrega:
            registro.des_prazo_entrega,

        condicaoPagamento:
            registro
                .des_condicao_pagamento,

        status:
            registro.sg_status,

        dataCriacao:
            registro.dt_criacao,

        usuarioCriacao:
            registro.cod_usu_criacao,

        itens
    };
}

/*
|--------------------------------------------------------------------------
| Consultas internas
|--------------------------------------------------------------------------
*/

function obterProximoNumero(
    idEmpresa
) {
    const resultado =
        databaseRepository.buscarUm(
            `
                SELECT
                    COALESCE(
                        MAX(num_cotacao),
                        0
                    ) + 1
                        AS proximo_numero
                FROM cotacao
                WHERE id_empresa = ?
            `,
            [idEmpresa]
        );

    return Number(
        resultado.proximo_numero
    );
}

function inserirItens(
    idCotacao,
    itens
) {
    itens.forEach((item, indice) => {
        databaseRepository.executar(
            `
                INSERT INTO cotacao_item (
                    id_cotacao,
                    id_cotacao_item,
                    des_item,
                    num_quantidade,
                    val_unitario,
                    val_total
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
            `,
            [
                idCotacao,
                indice + 1,
                item.descricao,
                item.quantidade,
                item.valorUnitario,
                item.valorTotal
            ]
        );
    });
}

/*
|--------------------------------------------------------------------------
| Busca
|--------------------------------------------------------------------------
*/

function buscarPorId(
    idEmpresa,
    idCotacao
) {
    const registro =
        databaseRepository.buscarUm(
            `
                SELECT
                    ${CAMPOS_COTACAO}
                FROM cotacao
                WHERE id_empresa = ?
                  AND id_cotacao = ?
            `,
            [
                idEmpresa,
                idCotacao
            ]
        );

    if (!registro) {
        return null;
    }

    const registrosItens =
        databaseRepository.buscarTodos(
            `
                SELECT
                    id_cotacao,
                    id_cotacao_item,
                    des_item,
                    num_quantidade,
                    val_unitario,
                    val_total
                FROM cotacao_item
                WHERE id_cotacao = ?
                ORDER BY id_cotacao_item
            `,
            [idCotacao]
        );

    return mapearCotacao(
        registro,
        registrosItens.map(mapearItem)
    );
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(
    idEmpresa,
    cotacao,
    codUsuarioCriacao
) {
    return databaseRepository
        .executarTransacaoImediata(
            () => {
                const numero =
                    obterProximoNumero(
                        idEmpresa
                    );

                const resultado =
                    databaseRepository.executar(
                        `
                            INSERT INTO cotacao (
                                id_empresa,
                                id_cliente,
                                id_produto,
                                num_cotacao,
                                dt_cotacao,
                                val_total,
                                des_prazo_entrega,
                                des_condicao_pagamento,
                                sg_status,
                                dt_criacao,
                                cod_usu_criacao
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
                                ?,
                                ?,
                                ?,
                                'GERADA',
                                strftime(
                                    '%Y-%m-%dT%H:%M:%fZ',
                                    'now'
                                ),
                                ?
                            )
                        `,
                        [
                            idEmpresa,
                            cotacao.idCliente,
                            cotacao.idProduto,
                            numero,
                            cotacao.valorTotal,
                            cotacao.prazoEntrega,
                            cotacao
                                .condicaoPagamento,
                            codUsuarioCriacao
                        ]
                    );

                const idCotacao = Number(
                    resultado.lastInsertRowid
                );

                inserirItens(
                    idCotacao,
                    cotacao.itens
                );

                return buscarPorId(
                    idEmpresa,
                    idCotacao
                );
            }
        );
}

module.exports = {
    buscarPorId,
    criar
};
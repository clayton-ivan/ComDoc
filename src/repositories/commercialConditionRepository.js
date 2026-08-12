const {
    obterDatabase
} = require("../database/database");

const CONFIGURACOES = {
    prazoEntrega: {
        tabela: "prazo_entrega",
        id: "id_prazo_entrega",
        descricao: "des_prazo_entrega"
    },
    formaPagamento: {
        tabela: "forma_pagamento",
        id: "id_forma_pagamento",
        descricao: "des_forma_pagamento"
    }
};

function obterConfiguracao(tipo) {
    const configuracao = CONFIGURACOES[tipo];

    if (!configuracao) {
        throw new Error("Tipo de condição comercial inválido.");
    }

    return configuracao;
}

function listar(tipo, idEmpresa) {
    const { tabela, id, descricao } = obterConfiguracao(tipo);

    return obterDatabase().prepare(`
        SELECT
            ${id} AS id,
            ${descricao} AS descricao
        FROM ${tabela}
        WHERE id_empresa = ?
        ORDER BY ${descricao} COLLATE NOCASE, ${id}
    `).all(idEmpresa);
}

function buscarPorDescricao(tipo, idEmpresa, descricaoInformada) {
    const { tabela, id, descricao } = obterConfiguracao(tipo);

    return obterDatabase().prepare(`
        SELECT
            ${id} AS id,
            ${descricao} AS descricao
        FROM ${tabela}
        WHERE id_empresa = ?
          AND ${descricao} = ? COLLATE NOCASE
    `).get(idEmpresa, descricaoInformada);
}

function criar(tipo, idEmpresa, descricaoInformada, codUsuarioCriacao) {
    const { tabela, descricao } = obterConfiguracao(tipo);

    obterDatabase().prepare(`
        INSERT INTO ${tabela} (
            id_empresa,
            ${descricao},
            cod_usu_criacao
        ) VALUES (?, ?, ?)
    `).run(idEmpresa, descricaoInformada, codUsuarioCriacao);

    return buscarPorDescricao(tipo, idEmpresa, descricaoInformada);
}

function excluir(tipo, idEmpresa, idRegistro) {
    const { tabela, id } = obterConfiguracao(tipo);

    return obterDatabase().prepare(`
        DELETE FROM ${tabela}
        WHERE id_empresa = ?
          AND ${id} = ?
    `).run(idEmpresa, idRegistro).changes > 0;
}

function substituirTodas(
    idEmpresa,
    condicoes,
    codUsuarioCriacao
) {
    const database = obterDatabase();

    database.exec("BEGIN TRANSACTION");

    try {
        for (const [tipo, descricoes] of Object.entries(condicoes)) {
            const { tabela, descricao } = obterConfiguracao(tipo);

            database.prepare(`
                DELETE FROM ${tabela}
                WHERE id_empresa = ?
            `).run(idEmpresa);

            const inserir = database.prepare(`
                INSERT INTO ${tabela} (
                    id_empresa,
                    ${descricao},
                    cod_usu_criacao
                ) VALUES (?, ?, ?)
            `);

            descricoes.forEach((descricaoInformada) => {
                inserir.run(
                    idEmpresa,
                    descricaoInformada,
                    codUsuarioCriacao
                );
            });
        }

        database.exec("COMMIT");
    } catch (erro) {
        database.exec("ROLLBACK");
        throw erro;
    }
}

module.exports = {
    listar,
    buscarPorDescricao,
    criar,
    excluir,
    substituirTodas
};

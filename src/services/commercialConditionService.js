const repository = require(
    "../repositories/commercialConditionRepository"
);

const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require("../constants/application");

function normalizarDescricao(valor) {
    return String(valor ?? "").trim();
}

function normalizarId(valor) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Identificador inválido.");
    }

    return id;
}

function listar(tipo) {
    return repository.listar(tipo, ID_EMPRESA_PADRAO);
}

function obterOuCriar(tipo, valor) {
    const descricao = normalizarDescricao(valor);

    if (!descricao) {
        return null;
    }

    if (descricao.length > 200) {
        throw new Error(
            "A descrição deve possuir no máximo 200 caracteres."
        );
    }

    const existente = repository.buscarPorDescricao(
        tipo,
        ID_EMPRESA_PADRAO,
        descricao
    );

    if (existente) {
        return existente;
    }

    return repository.criar(
        tipo,
        ID_EMPRESA_PADRAO,
        descricao,
        COD_USUARIO_SISTEMA
    );
}

function excluir(tipo, valorId) {
    return repository.excluir(
        tipo,
        ID_EMPRESA_PADRAO,
        normalizarId(valorId)
    );
}

module.exports = {
    listar,
    obterOuCriar,
    excluir
};

const repository = require(
    "../repositories/commercialConditionRepository"
);

const { obterIdEmpresaAtual, obterCodigoUsuarioAtual } = require("../context/requestContext");

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
    return repository.listar(tipo, obterIdEmpresaAtual());
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
        obterIdEmpresaAtual(),
        descricao
    );

    if (existente) {
        return existente;
    }

    return repository.criar(
        tipo,
        obterIdEmpresaAtual(),
        descricao,
        obterCodigoUsuarioAtual()
    );
}

function excluir(tipo, valorId) {
    return repository.excluir(
        tipo,
        obterIdEmpresaAtual(),
        normalizarId(valorId)
    );
}

function normalizarLista(valores, nomeCampo) {
    if (!Array.isArray(valores)) {
        throw new Error(`${nomeCampo} deve ser uma lista.`);
    }

    const unicos = new Map();

    valores.forEach((valor) => {
        const descricao = normalizarDescricao(valor);

        if (!descricao) {
            throw new Error(`${nomeCampo} possui uma opção vazia.`);
        }

        if (descricao.length > 200) {
            throw new Error(
                `${nomeCampo} possui uma opção com mais de 200 caracteres.`
            );
        }

        const chave = descricao.toLocaleLowerCase("pt-BR");

        if (!unicos.has(chave)) {
            unicos.set(chave, descricao);
        }
    });

    return Array.from(unicos.values()).sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
}

function substituirTodas(dados = {}) {
    const condicoes = {
        prazoEntrega: normalizarLista(
            dados.prazosEntrega,
            "Os prazos de entrega"
        ),
        formaPagamento: normalizarLista(
            dados.formasPagamento,
            "As formas de pagamento"
        )
    };

    repository.substituirTodas(
        obterIdEmpresaAtual(),
        condicoes,
        obterCodigoUsuarioAtual()
    );

    return {
        prazosEntrega: listar("prazoEntrega"),
        formasPagamento: listar("formaPagamento")
    };
}

module.exports = {
    listar,
    obterOuCriar,
    excluir,
    substituirTodas
};

const productBlockRepository = require(
    "../repositories/productBlockRepository"
);

const productImageService = require(
    "./productImageService"
);

const TIPOS_BLOCO = {
    TEXTO: "TEXTO",
    LISTA: "LISTA",
    TABELA: "TABELA",
    IMAGEM: "IMAGEM"
};

const ALINHAMENTOS_BLOCO = new Set([
    "ESQUERDA",
    "CENTRO",
    "DIREITA"
]);

const TIPOS_LISTA = new Set([
    "MARCADOR",
    "NUMERADOR"
]);

const TAMANHOS_IMAGEM = new Set([
    "PEQUENO",
    "NORMAL",
    "GRANDE"
]);

function normalizarTexto(valor) {
    return String(
        valor || ""
    ).trim();
}

function validarItemLista(
    item,
    indiceBloco,
    indiceItem
) {
    const conteudo =
        normalizarTexto(item.conteudo);

    if (!conteudo) {
        throw new Error(
            [
                `O item ${indiceItem + 1}`,
                `do bloco ${indiceBloco + 1}`,
                "deve possuir conteúdo."
            ].join(" ")
        );
    }

    return {
        linha: indiceItem + 1,
        coluna: 1,
        conteudo,
        cabecalho: false
    };
}

function validarCelulaTabela(
    item,
    indiceBloco,
    indiceItem
) {
    const linha = Number(item.linha);
    const coluna = Number(item.coluna);

    const conteudo =
        normalizarTexto(item.conteudo);

    if (
        !Number.isInteger(linha) ||
        linha < 1
    ) {
        throw new Error(
            [
                `A linha da célula ${indiceItem + 1}`,
                `do bloco ${indiceBloco + 1}`,
                "deve ser um número inteiro maior que zero."
            ].join(" ")
        );
    }

    if (
        !Number.isInteger(coluna) ||
        coluna < 1
    ) {
        throw new Error(
            [
                `A coluna da célula ${indiceItem + 1}`,
                `do bloco ${indiceBloco + 1}`,
                "deve ser um número inteiro maior que zero."
            ].join(" ")
        );
    }

    if (!conteudo) {
        throw new Error(
            [
                `A célula ${indiceItem + 1}`,
                `do bloco ${indiceBloco + 1}`,
                "deve possuir conteúdo."
            ].join(" ")
        );
    }

    return {
        linha,
        coluna,
        conteudo,
        cabecalho:
            Boolean(item.cabecalho)
    };
}

function validarItensLista(
    itens,
    indiceBloco
) {
    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {
        throw new Error(
            `O bloco ${indiceBloco + 1} deve possuir ao menos um item.`
        );
    }

    return itens.map(
        (item, indiceItem) =>
            validarItemLista(
                item,
                indiceBloco,
                indiceItem
            )
    );
}

function validarCelulasTabela(
    itens,
    indiceBloco
) {
    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {
        throw new Error(
            `O bloco ${indiceBloco + 1} deve possuir ao menos uma célula.`
        );
    }

    const posicoes = new Set();

    return itens.map((item, indiceItem) => {
        const celula =
            validarCelulaTabela(
                item,
                indiceBloco,
                indiceItem
            );

        const chavePosicao = [
            celula.linha,
            celula.coluna
        ].join(":");

        if (posicoes.has(chavePosicao)) {
            throw new Error(
                [
                    `O bloco ${indiceBloco + 1}`,
                    "possui mais de uma célula",
                    `na linha ${celula.linha}`,
                    `e coluna ${celula.coluna}.`
                ].join(" ")
            );
        }

        posicoes.add(chavePosicao);

        return celula;
    });
}

function validarBloco(
    bloco,
    indiceBloco,
    tiposAtivos
) {
    const tipo =
        normalizarTexto(bloco.tipo)
            .toUpperCase();

    const titulo =
        normalizarTexto(bloco.titulo);

    const conteudo =
        normalizarTexto(bloco.conteudo);

    const alinhamento =
        normalizarTexto(
            bloco.alinhamento || "ESQUERDA"
        ).toUpperCase();

    const tipoLista =
        normalizarTexto(
            bloco.tipoLista || "MARCADOR"
        ).toUpperCase();

    const tamanhoImagem =
        normalizarTexto(
            bloco.tamanhoImagem || "NORMAL"
        ).toUpperCase();

    if (!tipo) {
        throw new Error(
            `O tipo do bloco ${indiceBloco + 1} é obrigatório.`
        );
    }

    if (!tiposAtivos.has(tipo)) {
        throw new Error(
            `O tipo "${tipo}" do bloco ${indiceBloco + 1} é inválido ou está inativo.`
        );
    }

    if (!ALINHAMENTOS_BLOCO.has(alinhamento)) {
        throw new Error(
            `O alinhamento do bloco ${indiceBloco + 1} é inválido.`
        );
    }

    if (
        tipo === TIPOS_BLOCO.LISTA &&
        !TIPOS_LISTA.has(tipoLista)
    ) {
        throw new Error(
            `O estilo da lista do bloco ${indiceBloco + 1} é inválido.`
        );
    }

    if (
        tipo === TIPOS_BLOCO.IMAGEM &&
        !TAMANHOS_IMAGEM.has(tamanhoImagem)
    ) {
        throw new Error(
            `O tamanho da imagem do bloco ${indiceBloco + 1} é inválido.`
        );
    }

    if (
        (
            tipo === TIPOS_BLOCO.TEXTO ||
            tipo === TIPOS_BLOCO.IMAGEM
        ) &&
        !conteudo
    ) {
        throw new Error(
            `O conteúdo do bloco ${indiceBloco + 1} é obrigatório.`
        );
    }

    let itens = [];

    if (tipo === TIPOS_BLOCO.LISTA) {
        itens = validarItensLista(
            bloco.itens,
            indiceBloco
        );
    }

    if (tipo === TIPOS_BLOCO.TABELA) {
        itens = validarCelulasTabela(
            bloco.itens,
            indiceBloco
        );
    }

    return {
        tipo,
        titulo,
        conteudo,
        alinhamento,
        tipoLista:
            tipo === TIPOS_BLOCO.LISTA
                ? tipoLista
                : "MARCADOR",
        tamanhoImagem:
            tipo === TIPOS_BLOCO.IMAGEM
                ? tamanhoImagem
                : "NORMAL",
        itens
    };
}

function validarBlocos(blocos) {
    if (blocos === undefined || blocos === null) {
        return [];
    }

    if (!Array.isArray(blocos)) {
        throw new Error(
            "Os blocos do produto devem ser enviados em uma lista."
        );
    }

    const tiposAtivos = new Set(
        productBlockRepository
            .listarTiposAtivos()
            .map((tipo) => tipo.codigo)
    );

    return blocos.map(
        (bloco, indiceBloco) =>
            validarBloco(
                bloco || {},
                indiceBloco,
                tiposAtivos
            )
    );
}

function listarTiposAtivos() {
    return productBlockRepository
        .listarTiposAtivos();
}

function listarPorCodigoProduto(codigoProduto) {
    const codigoNormalizado =
        normalizarTexto(codigoProduto);

    if (!codigoNormalizado) {
        return null;
    }

    return productBlockRepository
        .listarPorCodigoProduto(
            codigoNormalizado
        );
}

function substituirPorCodigoProduto(
    codigoProduto,
    blocos
) {
    const codigoNormalizado =
        normalizarTexto(codigoProduto);

    if (!codigoNormalizado) {
        return null;
    }

    const blocosValidados =
        validarBlocos(blocos);

    blocosValidados.forEach(
        (bloco, indice) => {
            if (
                bloco.tipo === TIPOS_BLOCO.IMAGEM &&
                !productImageService
                    .caminhoPertenceAoProduto(
                        codigoNormalizado,
                        bloco.conteudo
                    )
            ) {
                throw new Error(
                    `A imagem do bloco ${indice + 1} não é válida para este produto.`
                );
            }
        }
    );

    return productBlockRepository
        .substituirPorCodigoProduto(
            codigoNormalizado,
            blocosValidados
        );
}

module.exports = {
    TIPOS_BLOCO,
    validarBlocos,
    listarTiposAtivos,
    listarPorCodigoProduto,
    substituirPorCodigoProduto
};

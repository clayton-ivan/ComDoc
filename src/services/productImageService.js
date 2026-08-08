const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const productBlockRepository = require(
    "../repositories/productBlockRepository"
);

const {
    ID_EMPRESA_PADRAO
} = require("../constants/application");

const DIRETORIO_UPLOADS = path.join(
    __dirname,
    "..",
    "uploads",
    "produtos"
);

const FORMATOS = {
    "image/jpeg": {
        extensao: ".jpg",
        assinatura: (buffer) =>
            buffer.length >= 3 &&
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff
    },

    "image/png": {
        extensao: ".png",
        assinatura: (buffer) =>
            buffer.length >= 8 &&
            buffer.subarray(0, 8).equals(
                Buffer.from([
                    0x89, 0x50, 0x4e, 0x47,
                    0x0d, 0x0a, 0x1a, 0x0a
                ])
            )
    }
};

function normalizarCodigo(codigoProduto) {
    return String(codigoProduto || "").trim();
}

function produtoExiste(idEmpresa, codigoProduto) {
    return productBlockRepository
        .listarPorCodigoProduto(
            idEmpresa,
            codigoProduto
        ) !== null;
}

function obterIdentificadorProduto(
    idEmpresa,
    codigoProduto
) {
    const identificador = idEmpresa === ID_EMPRESA_PADRAO
        ? codigoProduto
        : `${idEmpresa}:${codigoProduto}`;

    return crypto
        .createHash("sha256")
        .update(identificador)
        .digest("hex")
        .slice(0, 16);
}

function obterDiretorioProduto(idEmpresa, codigoProduto) {
    return path.join(
        DIRETORIO_UPLOADS,
        obterIdentificadorProduto(
            idEmpresa,
            codigoProduto
        )
    );
}

function obterProximoNome(diretorio, extensao) {
    const nomes = fs.existsSync(diretorio)
        ? fs.readdirSync(diretorio)
        : [];

    const maiorSequencial = nomes.reduce(
        (maior, nome) => {
            const resultado = nome.match(
                /^imagem-(\d+)\.(?:jpg|png)$/i
            );

            return resultado
                ? Math.max(maior, Number(resultado[1]))
                : maior;
        },
        0
    );

    return `imagem-${String(
        maiorSequencial + 1
    ).padStart(3, "0")}${extensao}`;
}

function salvar(idEmpresa, codigoProduto, arquivo) {
    const codigo = normalizarCodigo(codigoProduto);

    if (!codigo || !produtoExiste(idEmpresa, codigo)) {
        return null;
    }

    if (!arquivo) {
        throw new Error("Selecione uma imagem.");
    }

    const formato = FORMATOS[arquivo.mimetype];

    if (!formato || !formato.assinatura(arquivo.buffer)) {
        throw new Error(
            "A imagem deve estar no formato JPEG ou PNG."
        );
    }

    const diretorio = obterDiretorioProduto(
        idEmpresa,
        codigo
    );
    fs.mkdirSync(diretorio, { recursive: true });

    const nome = obterProximoNome(
        diretorio,
        formato.extensao
    );

    fs.writeFileSync(
        path.join(diretorio, nome),
        arquivo.buffer,
        { flag: "wx" }
    );

    const pastaProduto =
        obterIdentificadorProduto(idEmpresa, codigo);

    return {
        nome,
        caminho:
            `/uploads/produtos/${pastaProduto}/${nome}`
    };
}

function excluir(idEmpresa, codigoProduto, nomeArquivo) {
    const codigo = normalizarCodigo(codigoProduto);

    if (!codigo || !produtoExiste(idEmpresa, codigo)) {
        return null;
    }

    const nome = String(nomeArquivo || "").trim();

    if (!/^imagem-\d+\.(?:jpg|png)$/i.test(nome)) {
        throw new Error("Nome de imagem inválido.");
    }

    const caminho = path.join(
        obterDiretorioProduto(idEmpresa, codigo),
        nome
    );

    if (!fs.existsSync(caminho)) {
        return false;
    }

    fs.unlinkSync(caminho);

    const diretorio = obterDiretorioProduto(
        idEmpresa,
        codigo
    );

    if (fs.readdirSync(diretorio).length === 0) {
        fs.rmdirSync(diretorio);
    }

    return true;
}

function caminhoPertenceAoProduto(
    idEmpresa,
    codigoProduto,
    caminhoImagem
) {
    const codigo = normalizarCodigo(codigoProduto);

    if (!codigo) {
        return false;
    }

    const pastaProduto =
        obterIdentificadorProduto(idEmpresa, codigo);

    const resultado = String(caminhoImagem || "").match(
        /^\/uploads\/produtos\/([a-f0-9]{16})\/(imagem-\d+\.(?:jpg|png))$/i
    );

    if (!resultado || resultado[1] !== pastaProduto) {
        return false;
    }

    return fs.existsSync(
        path.join(
            obterDiretorioProduto(idEmpresa, codigo),
            resultado[2]
        )
    );
}

function obterDataUrl(
    idEmpresa,
    codigoProduto,
    caminhoImagem
) {
    if (
        !caminhoPertenceAoProduto(
            idEmpresa,
            codigoProduto,
            caminhoImagem
        )
    ) {
        throw new Error(
            "Arquivo de imagem do produto não encontrado."
        );
    }

    const nome = path.basename(caminhoImagem);
    const extensao = path.extname(nome).toLowerCase();
    const mime = extensao === ".png"
        ? "image/png"
        : "image/jpeg";

    const arquivo = fs.readFileSync(
        path.join(
            obterDiretorioProduto(
                idEmpresa,
                normalizarCodigo(codigoProduto)
            ),
            nome
        )
    );

    return `data:${mime};base64,${arquivo.toString("base64")}`;
}

function excluirPendentes(
    idEmpresa,
    codigoProduto,
    nomesArquivos
) {
    const codigo = normalizarCodigo(codigoProduto);

    if (!codigo || !produtoExiste(idEmpresa, codigo)) {
        return null;
    }

    if (!Array.isArray(nomesArquivos)) {
        throw new Error(
            "A lista de imagens pendentes é inválida."
        );
    }

    const nomesUnicos = new Set(
        nomesArquivos.map((nome) =>
            String(nome || "").trim()
        )
    );

    let quantidade = 0;

    nomesUnicos.forEach((nome) => {
        if (!nome) {
            return;
        }

        const excluida = excluir(
            idEmpresa,
            codigo,
            nome
        );

        if (excluida) {
            quantidade += 1;
        }
    });

    return quantidade;
}

function excluirTodasPorProduto(
    idEmpresa,
    codigoProduto
) {
    const codigo = normalizarCodigo(codigoProduto);

    if (!codigo) {
        return false;
    }

    const diretorio = obterDiretorioProduto(
        idEmpresa,
        codigo
    );

    if (!fs.existsSync(diretorio)) {
        return false;
    }

    fs.rmSync(diretorio, {
        recursive: true,
        force: true
    });

    return true;
}

module.exports = {
    DIRETORIO_UPLOADS,
    salvar,
    excluir,
    excluirPendentes,
    excluirTodasPorProduto,
    caminhoPertenceAoProduto,
    obterDataUrl
};

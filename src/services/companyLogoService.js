const fs = require("fs");
const path = require("path");

const companyRepository = require(
    "../repositories/companyRepository"
);

const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require("../constants/application");

const DIRETORIO_EMPRESAS = path.join(
    __dirname,
    "..",
    "uploads",
    "empresas"
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

function diretorio(idEmpresa) {
    return path.join(
        DIRETORIO_EMPRESAS,
        String(idEmpresa)
    );
}

function caminho(idEmpresa, nomeArquivo) {
    return path.join(
        diretorio(idEmpresa),
        nomeArquivo
    );
}

function salvarAtual(arquivo) {
    if (!arquivo) {
        throw new Error("Selecione uma imagem.");
    }

    const formato = FORMATOS[arquivo.mimetype];

    if (!formato || !formato.assinatura(arquivo.buffer)) {
        throw new Error("A logo deve estar no formato JPEG ou PNG.");
    }

    const empresa = companyRepository.buscarPorId(
        ID_EMPRESA_PADRAO
    );

    if (!empresa) {
        return null;
    }

    const pasta = diretorio(ID_EMPRESA_PADRAO);
    fs.mkdirSync(pasta, { recursive: true });

    const nomeArquivo = `logo${formato.extensao}`;
    const caminhoNovo = caminho(
        ID_EMPRESA_PADRAO,
        nomeArquivo
    );

    fs.writeFileSync(caminhoNovo, arquivo.buffer);

    if (
        empresa.arquivoLogo &&
        empresa.arquivoLogo !== nomeArquivo
    ) {
        const caminhoAnterior = caminho(
            ID_EMPRESA_PADRAO,
            empresa.arquivoLogo
        );

        if (fs.existsSync(caminhoAnterior)) {
            fs.unlinkSync(caminhoAnterior);
        }
    }

    return companyRepository.atualizarLogo(
        ID_EMPRESA_PADRAO,
        nomeArquivo,
        COD_USUARIO_SISTEMA
    );
}

function excluirAtual() {
    const empresa = companyRepository.buscarPorId(
        ID_EMPRESA_PADRAO
    );

    if (!empresa) {
        return null;
    }

    if (empresa.arquivoLogo) {
        const arquivo = caminho(
            ID_EMPRESA_PADRAO,
            empresa.arquivoLogo
        );

        if (fs.existsSync(arquivo)) {
            fs.unlinkSync(arquivo);
        }

        const pasta = diretorio(
            ID_EMPRESA_PADRAO
        );

        if (
            fs.existsSync(pasta) &&
            fs.readdirSync(pasta).length === 0
        ) {
            fs.rmdirSync(pasta);
        }
    }

    return companyRepository.atualizarLogo(
        ID_EMPRESA_PADRAO,
        null,
        COD_USUARIO_SISTEMA
    );
}

function obterDataUrl(empresa) {
    if (!empresa?.arquivoLogo) {
        return null;
    }

    const arquivo = caminho(
        empresa.id,
        empresa.arquivoLogo
    );

    if (!fs.existsSync(arquivo)) {
        return null;
    }

    const extensao = path.extname(arquivo).toLowerCase();
    const mime = extensao === ".png"
        ? "image/png"
        : "image/jpeg";

    return `data:${mime};base64,${fs.readFileSync(arquivo).toString("base64")}`;
}

module.exports = {
    DIRETORIO_EMPRESAS,
    salvarAtual,
    excluirAtual,
    obterDataUrl
};

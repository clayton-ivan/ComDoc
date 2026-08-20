const fs = require("fs");
const path = require("path");
const companyRepository = require("../repositories/companyRepository");
const { obterIdEmpresaAtual, obterCodigoUsuarioAtual } = require("../context/requestContext");
const systemParameterService = require("./systemParameterService");

const DIRETORIO_EMPRESAS = path.join(__dirname, "..", "uploads", "empresas");
const FORMATOS = {
    "image/jpeg": {
        extensao: ".jpg",
        assinatura: (buffer) => buffer.length >= 3 &&
            buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    },
    "image/png": {
        extensao: ".png",
        assinatura: (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        )
    }
};

function diretorio(idEmpresa) {
    return path.join(DIRETORIO_EMPRESAS, String(idEmpresa));
}

function caminho(idEmpresa, nomeArquivo) {
    return path.join(diretorio(idEmpresa), nomeArquivo);
}

function validarImagem(arquivo, nome) {
    if (!arquivo) throw new Error("Selecione uma imagem.");
    if (arquivo.size > systemParameterService.limiteUploadBytes()) {
        throw new Error(
            `A ${nome} deve possuir no máximo ${systemParameterService.obter("MB_LIMITE_UPLOAD_IMAGEM")} MB.`
        );
    }
    const formato = FORMATOS[arquivo.mimetype];
    if (!formato || !formato.assinatura(arquivo.buffer)) {
        throw new Error(`A ${nome} deve estar no formato JPEG ou PNG.`);
    }
    return formato;
}

function salvarImagem(arquivo, tipo) {
    const formato = validarImagem(arquivo, tipo === "logo" ? "logo" : "capa");
    const idEmpresa = obterIdEmpresaAtual();
    const empresa = companyRepository.buscarPorId(idEmpresa);
    if (!empresa) return null;
    const campoAnterior = tipo === "logo" ? empresa.arquivoLogo : empresa.arquivoCapa;
    fs.mkdirSync(diretorio(idEmpresa), { recursive: true });
    const nomeArquivo = `${tipo}${formato.extensao}`;
    fs.writeFileSync(caminho(idEmpresa, nomeArquivo), arquivo.buffer);
    if (campoAnterior && campoAnterior !== nomeArquivo) {
        const anterior = caminho(idEmpresa, campoAnterior);
        if (fs.existsSync(anterior)) fs.unlinkSync(anterior);
    }
    return tipo === "logo"
        ? companyRepository.atualizarLogo(idEmpresa, nomeArquivo, obterCodigoUsuarioAtual())
        : companyRepository.atualizarCapa(idEmpresa, nomeArquivo, obterCodigoUsuarioAtual());
}

function excluirImagem(tipo) {
    const idEmpresa = obterIdEmpresaAtual();
    const empresa = companyRepository.buscarPorId(idEmpresa);
    if (!empresa) return null;
    const nomeArquivo = tipo === "logo" ? empresa.arquivoLogo : empresa.arquivoCapa;
    if (nomeArquivo) {
        const arquivo = caminho(idEmpresa, nomeArquivo);
        if (fs.existsSync(arquivo)) fs.unlinkSync(arquivo);
    }
    return tipo === "logo"
        ? companyRepository.atualizarLogo(idEmpresa, null, obterCodigoUsuarioAtual())
        : companyRepository.atualizarCapa(idEmpresa, null, obterCodigoUsuarioAtual());
}

function obterArquivoDataUrl(empresa, nomeArquivo) {
    if (!empresa || !nomeArquivo) return null;
    const arquivo = caminho(empresa.id, nomeArquivo);
    if (!fs.existsSync(arquivo)) return null;
    const mime = path.extname(arquivo).toLowerCase() === ".png"
        ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${fs.readFileSync(arquivo).toString("base64")}`;
}

module.exports = {
    DIRETORIO_EMPRESAS,
    salvarAtual: (arquivo) => salvarImagem(arquivo, "logo"),
    salvarCapaAtual: (arquivo) => salvarImagem(arquivo, "capa"),
    excluirAtual: () => excluirImagem("logo"),
    excluirCapaAtual: () => excluirImagem("capa"),
    obterDataUrl: (empresa) => obterArquivoDataUrl(empresa, empresa?.arquivoLogo),
    obterCapaDataUrl: (empresa) => obterArquivoDataUrl(empresa, empresa?.arquivoCapa)
};

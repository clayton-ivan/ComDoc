const path = require("node:path");

const RAIZ_PROJETO = path.resolve(__dirname, "..", "..");

function texto(nome, padrao = "") {
    return String(process.env[nome] ?? padrao).trim();
}

function inteiro(nome, padrao, minimo, maximo) {
    const valor = Number(texto(nome, padrao));
    if (!Number.isInteger(valor) || valor < minimo || valor > maximo) {
        throw new Error(`${nome} deve ser um número inteiro entre ${minimo} e ${maximo}.`);
    }
    return valor;
}

function booleano(nome, padrao) {
    const valor = texto(nome, padrao ? "true" : "false").toLowerCase();
    if (["1", "true", "sim", "yes"].includes(valor)) return true;
    if (["0", "false", "nao", "não", "no"].includes(valor)) return false;
    throw new Error(`${nome} deve ser informado como true ou false.`);
}

function caminho(nome, padrao) {
    return path.resolve(texto(nome, padrao));
}

const ambiente = texto("NODE_ENV", "development").toLowerCase();
if (!["development", "test", "production"].includes(ambiente)) {
    throw new Error("NODE_ENV deve ser development, test ou production.");
}

const producao = ambiente === "production";
const diretorioDadosInformado = texto("COMDOC_DATA_DIR");
const diretorioDados = caminho(
    "COMDOC_DATA_DIR",
    RAIZ_PROJETO
);

const urlPublicaTexto = texto("COMDOC_PUBLIC_URL");
let urlPublica = null;
if (urlPublicaTexto) {
    try {
        urlPublica = new URL(urlPublicaTexto);
    } catch {
        throw new Error("COMDOC_PUBLIC_URL deve ser uma URL válida.");
    }
    if (producao && urlPublica.protocol !== "https:") {
        throw new Error("COMDOC_PUBLIC_URL deve usar HTTPS em produção.");
    }
}
if (producao && !urlPublica) {
    throw new Error("COMDOC_PUBLIC_URL deve ser configurada em produção.");
}

const segredoSessao = texto("COMDOC_SESSION_SECRET");
if (producao && segredoSessao.length < 32) {
    throw new Error("COMDOC_SESSION_SECRET deve possuir ao menos 32 caracteres em produção.");
}

const nivelLog = texto("COMDOC_LOG_LEVEL", producao ? "info" : "debug").toLowerCase();
if (!["debug", "info", "warn", "error"].includes(nivelLog)) {
    throw new Error("COMDOC_LOG_LEVEL deve ser debug, info, warn ou error.");
}

const basePersistente = diretorioDadosInformado
    ? diretorioDados
    : null;

const config = Object.freeze({
    ambiente,
    producao,
    host: texto("HOST", "0.0.0.0"),
    porta: inteiro("PORT", 3000, 1, 65535),
    urlPublica,
    segredoSessao: segredoSessao || "comdoc-desenvolvimento-altere-este-segredo",
    confiarProxy: booleano("COMDOC_TRUST_PROXY", producao),
    forcarHttps: booleano("COMDOC_FORCE_HTTPS", producao),
    limiteJson: texto("COMDOC_JSON_LIMIT", "1mb"),
    nivelLog,
    janelaLoginMs: inteiro("COMDOC_LOGIN_RATE_WINDOW_MIN", 15, 1, 1440) * 60 * 1000,
    maximoLoginPorIp: inteiro("COMDOC_LOGIN_RATE_MAX_PER_IP", 30, 1, 1000),
    tempoEncerramentoMs: inteiro("COMDOC_SHUTDOWN_TIMEOUT_SECONDS", 15, 1, 120) * 1000,
    caminhoDatabase: caminho(
        "COMDOC_DATABASE_PATH",
        basePersistente
            ? path.join(basePersistente, "database", "comdoc.db")
            : path.join(RAIZ_PROJETO, "database", "comdoc.db")
    ),
    diretorioUploads: caminho(
        "COMDOC_UPLOADS_DIR",
        basePersistente
            ? path.join(basePersistente, "uploads")
            : path.join(RAIZ_PROJETO, "src", "uploads")
    ),
    diretorioOutput: caminho(
        "COMDOC_OUTPUT_DIR",
        basePersistente
            ? path.join(basePersistente, "output")
            : path.join(RAIZ_PROJETO, "output")
    ),
    diretorioBackups: caminho(
        "COMDOC_BACKUP_DIR",
        basePersistente
            ? path.join(basePersistente, "backups")
            : path.join(RAIZ_PROJETO, "backups")
    ),
    diasRetencaoBackup: inteiro("COMDOC_BACKUP_RETENTION_DAYS", 30, 1, 3650)
});

module.exports = config;

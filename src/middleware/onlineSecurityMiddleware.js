const crypto = require("node:crypto");
const config = require("../config/environment");
const logger = require("../services/loggerService");

const tentativasLogin = new Map();

function identificacao(req, res, next) {
    req.idRequisicao = req.get("x-request-id") || crypto.randomUUID();
    res.setHeader("X-Request-Id", req.idRequisicao);
    const inicio = process.hrtime.bigint();
    res.on("finish", () => {
        const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1e6;
        logger.info("Requisição concluída", {
            idRequisicao: req.idRequisicao,
            metodo: req.method,
            caminho: req.originalUrl.split("?")[0],
            status: res.statusCode,
            duracaoMs: Number(duracaoMs.toFixed(1)),
            idUsuario: req.usuario?.idUsuario ?? null,
            idEmpresa: req.idEmpresa ?? null
        });
    });
    next();
}

function cabecalhos(req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'"
    );
    if (req.secure) {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
}

function exigirHttps(req, res, next) {
    if (!config.forcarHttps || req.secure) return next();
    if (["GET", "HEAD"].includes(req.method)) {
        const destino = config.urlPublica
            ? new URL(req.originalUrl, config.urlPublica).toString()
            : `https://${req.get("host")}${req.originalUrl}`;
        return res.redirect(308, destino);
    }
    return res.status(426).json({
        sucesso: false,
        mensagem: "Esta operação exige uma conexão HTTPS."
    });
}

function limitarLogin(req, res, next) {
    const agora = Date.now();
    const chave = req.ip || req.socket.remoteAddress || "desconhecido";
    let estado = tentativasLogin.get(chave);
    if (!estado || estado.expiraEm <= agora) {
        estado = { quantidade: 0, expiraEm: agora + config.janelaLoginMs };
    }
    estado.quantidade += 1;
    tentativasLogin.set(chave, estado);

    res.setHeader("RateLimit-Limit", String(config.maximoLoginPorIp));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, config.maximoLoginPorIp - estado.quantidade)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(estado.expiraEm / 1000)));

    if (estado.quantidade > config.maximoLoginPorIp) {
        res.setHeader("Retry-After", String(Math.ceil((estado.expiraEm - agora) / 1000)));
        return res.status(429).json({
            sucesso: false,
            mensagem: "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente."
        });
    }
    next();
}

function limparRateLimitExpirado() {
    const agora = Date.now();
    tentativasLogin.forEach((estado, chave) => {
        if (estado.expiraEm <= agora) tentativasLogin.delete(chave);
    });
}

module.exports = {
    identificacao,
    cabecalhos,
    exigirHttps,
    limitarLogin,
    limparRateLimitExpirado
};

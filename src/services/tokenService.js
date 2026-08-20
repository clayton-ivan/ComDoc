const crypto = require("node:crypto");
const systemParameterService = require("./systemParameterService");
const config = require("../config/environment");

const NOME_COOKIE = "comdoc_auth";
const NOME_COOKIE_EMPRESA = "comdoc_empresa";

function duracaoSessao(manterConectado) {
    return manterConectado
        ? systemParameterService.obter("DIAS_DURACAO_SESSAO_PERSISTENTE") * 24 * 60 * 60
        : systemParameterService.obter("HORAS_DURACAO_SESSAO") * 60 * 60;
}

function segredo() {
    return config.segredoSessao;
}

function assinar(conteudo) {
    return crypto.createHmac("sha256", segredo()).update(conteudo).digest("base64url");
}

function criar(payload) {
    const conteudo = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${conteudo}.${assinar(conteudo)}`;
}

function ler(token) {
    if (!token || !token.includes(".")) return null;
    const [conteudo, assinatura] = token.split(".");
    const esperada = assinar(conteudo);
    if (assinatura.length !== esperada.length ||
        !crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperada))) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(conteudo, "base64url").toString("utf8"));
        return payload.exp > Date.now() ? payload : null;
    } catch {
        return null;
    }
}

function cookies(req) {
    return Object.fromEntries(
        String(req.headers.cookie || "").split(";").map((parte) => {
            const indice = parte.indexOf("=");
            return indice < 0
                ? ["", ""]
                : [parte.slice(0, indice).trim(), decodeURIComponent(parte.slice(indice + 1))];
        })
    );
}

function opcoesCookie(persistente, maxAge) {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: config.producao,
        path: "/",
        ...(persistente ? { maxAge: maxAge * 1000 } : {})
    };
}

function definirSessao(res, usuario, manterConectado) {
    const duracao = duracaoSessao(manterConectado);
    res.cookie(NOME_COOKIE, criar({
        sub: usuario.idUsuario,
        ver: usuario.versaoSessao,
        exp: Date.now() + duracao * 1000,
        manter: Boolean(manterConectado)
    }), opcoesCookie(manterConectado, duracao));
}

function definirEmpresa(res, idEmpresa, manterConectado) {
    const duracao = duracaoSessao(manterConectado);
    res.cookie(NOME_COOKIE_EMPRESA, criar({
        idEmpresa,
        exp: Date.now() + duracao * 1000
    }), opcoesCookie(manterConectado, duracao));
}

function limpar(res) {
    const opcoes = opcoesCookie(false, 0);
    res.clearCookie(NOME_COOKIE, opcoes);
    res.clearCookie(NOME_COOKIE_EMPRESA, opcoes);
}

module.exports = {
    NOME_COOKIE, NOME_COOKIE_EMPRESA, ler, cookies,
    definirSessao, definirEmpresa, limpar
};

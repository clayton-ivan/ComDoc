const userRepository = require("../repositories/userRepository");
const companyRepository = require("../repositories/companyRepository");
const tokenService = require("../services/tokenService");
const authService = require("../services/authService");

function carregar(req, res, next) {
    const cookies = tokenService.cookies(req);
    const sessao = tokenService.ler(cookies[tokenService.NOME_COOKIE]);

    if (sessao) {
        const usuario = userRepository.buscarPorId(sessao.sub);
        const empresaUsuario = usuario?.perfil === "SUPER"
            ? null
            : companyRepository.buscarPorId(usuario?.idEmpresa);
        if (usuario?.ativo && usuario.versaoSessao === sessao.ver &&
            (usuario.perfil === "SUPER" || empresaUsuario?.ativo)) {
            req.usuario = usuario;
            req.manterConectado = Boolean(sessao.manter);
            req.senhaExpirada = authService.senhaExpirada(usuario);
            req.idEmpresa = usuario.idEmpresa;

            if (usuario.perfil === "SUPER") {
                const empresa = tokenService.ler(cookies[tokenService.NOME_COOKIE_EMPRESA]);
                if (empresa && companyRepository.buscarPorId(empresa.idEmpresa)) {
                    req.idEmpresa = empresa.idEmpresa;
                }
            }
        }
    }
    next();
}

function exigirApi(req, res, next) {
    if (!req.usuario) return res.status(401).json({ sucesso: false, mensagem: "Autenticação necessária." });
    if (req.senhaExpirada && req.path !== "/alterar-senha") {
        return res.status(403).json({ sucesso: false, codigo: "TROCAR_SENHA", mensagem: "Troca de senha obrigatória." });
    }
    const rotaCompleta = req.originalUrl.split("?")[0];
    const rotaPermitidaSemEmpresa =
        rotaCompleta === "/auth/empresas" ||
        rotaCompleta === "/auth/selecionar-empresa" ||
        rotaCompleta.startsWith("/empresas") ||
        rotaCompleta.startsWith("/parametros");
    if (req.usuario.perfil === "SUPER" && !req.idEmpresa &&
        !rotaPermitidaSemEmpresa &&
        !["/alterar-senha", "/selecionar-empresa"].includes(req.path)) {
        return res.status(403).json({ sucesso: false, codigo: "SELECIONAR_EMPRESA", mensagem: "Selecione uma empresa." });
    }
    next();
}

function exigirPagina(req, res, next) {
    if (!req.usuario) return res.redirect("/login");
    if (req.senhaExpirada) return res.redirect("/trocar-senha");
    if (req.usuario.perfil === "SUPER" && !req.idEmpresa) return res.redirect("/selecionar-empresa");
    next();
}

function exigirAdmin(req, res, next) {
    if (!req.usuario || !["SUPER", "ADMIN"].includes(req.usuario.perfil)) {
        return res.status(403).json({ sucesso: false, mensagem: "Acesso não autorizado." });
    }
    next();
}

function exigirAdminPagina(req, res, next) {
    if (!req.usuario || !["SUPER", "ADMIN"].includes(req.usuario.perfil)) {
        return res.redirect("/");
    }
    next();
}

function exigirSuper(req, res, next) {
    if (req.usuario?.perfil !== "SUPER") {
        return res.status(403).json({ sucesso: false, mensagem: "Acesso não autorizado." });
    }
    next();
}

function exigirSuperPagina(req, res, next) {
    if (!req.usuario) return res.redirect("/login");
    if (req.senhaExpirada) return res.redirect("/trocar-senha");
    if (req.usuario.perfil !== "SUPER") return res.redirect("/");
    next();
}

module.exports = {
    carregar, exigirApi, exigirPagina, exigirAdmin, exigirAdminPagina,
    exigirSuper, exigirSuperPagina
};

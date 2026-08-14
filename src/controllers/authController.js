const authService = require("../services/authService");
const tokenService = require("../services/tokenService");
const userRepository = require("../repositories/userRepository");
const companyRepository = require("../repositories/companyRepository");
const userService = require("../services/userService");

async function login(req, res) {
    try {
        const resultado = await authService.autenticar(req.body);
        const manter = Boolean(req.body?.manterConectado);
        tokenService.definirSessao(res, resultado.usuario, manter);
        return res.json({
            sucesso: true,
            usuario: userService.publico(resultado.usuario),
            destino: resultado.senhaExpirada
                ? "/trocar-senha"
                : resultado.usuario.perfil === "SUPER"
                    ? "/selecionar-empresa"
                    : "/"
        });
    } catch (erro) {
        return res.status(401).json({ sucesso: false, mensagem: erro.message });
    }
}

function sessao(req, res) {
    return res.json({
        autenticado: Boolean(req.usuario),
        usuario: userService.publico(req.usuario),
        idEmpresaAtiva: req.idEmpresa || null
    });
}

function logout(req, res) {
    tokenService.limpar(res);
    return res.json({ sucesso: true });
}

function sairTodos(req, res) {
    userRepository.revogarTodas(req.usuario.idUsuario);
    tokenService.limpar(res);
    return res.json({ sucesso: true });
}

async function alterarSenha(req, res) {
    try {
        if (req.body?.senha !== req.body?.confirmacao) throw new Error("As senhas não coincidem.");
        const usuario = await authService.alterarSenha(req.usuario, req.body?.senha);
        tokenService.definirSessao(res, usuario, req.manterConectado);
        return res.json({
            sucesso: true,
            destino: usuario.perfil === "SUPER" ? "/selecionar-empresa" : "/"
        });
    } catch (erro) {
        return res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
}

function listarEmpresas(req, res) {
    if (req.usuario.perfil !== "SUPER") return res.status(403).json({ sucesso: false });
    return res.json(companyRepository.listar());
}

function selecionarEmpresa(req, res) {
    if (req.usuario.perfil !== "SUPER") return res.status(403).json({ sucesso: false });
    const empresa = companyRepository.buscarPorId(Number(req.body?.idEmpresa));
    if (!empresa) return res.status(404).json({ sucesso: false, mensagem: "Empresa não encontrada." });
    tokenService.definirEmpresa(res, empresa.id, req.manterConectado);
    return res.json({ sucesso: true, empresa });
}

module.exports = { login, sessao, logout, sairTodos, alterarSenha, listarEmpresas, selecionarEmpresa };

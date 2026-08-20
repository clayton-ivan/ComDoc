const userRepository = require("../repositories/userRepository");
const passwordService = require("./passwordService");
const companyRepository = require("../repositories/companyRepository");
const systemParameterService = require("./systemParameterService");

function email(valor) {
    const normalizado = String(valor ?? "").trim().toLocaleLowerCase("pt-BR");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
        throw new Error("Informe um e-mail válido.");
    }
    return normalizado;
}

function senhaExpirada(usuario) {
    const validadeMs = systemParameterService.obter("DIAS_EXPIRACAO_SENHA") * 24 * 60 * 60 * 1000;
    return usuario.trocarSenha ||
        Date.now() - Date.parse(usuario.senhaAlteradaEm) >= validadeMs;
}

async function autenticar(dados = {}) {
    const mensagem = "E-mail ou senha inválidos.";
    const usuario = userRepository.buscarPorEmail(email(dados.email));

    if (!usuario || !usuario.ativo) throw new Error(mensagem);
    const superUsuario = usuario.perfil === "SUPER";

    if (!superUsuario && !companyRepository.buscarPorId(usuario.idEmpresa)?.ativo) {
        throw new Error(mensagem);
    }

    if (superUsuario && (usuario.tentativasLogin > 0 || usuario.bloqueadoAte)) {
        userRepository.registrarFalha(usuario.idUsuario, 0, null);
    }

    if (!superUsuario && usuario.bloqueadoAte && Date.parse(usuario.bloqueadoAte) > Date.now()) {
        throw new Error("Acesso temporariamente bloqueado. Tente novamente mais tarde.");
    }

    if (!await passwordService.verificar(usuario.senhaHash, dados.senha)) {
        if (!superUsuario) {
            const tentativas = usuario.tentativasLogin + 1;
            const limiteTentativas = systemParameterService.obter("QTD_TENTATIVAS_LOGIN");
            const bloqueioMs = systemParameterService.obter("MIN_BLOQUEIO_LOGIN") * 60 * 1000;
            const bloqueadoAte = tentativas >= limiteTentativas
                ? new Date(Date.now() + bloqueioMs).toISOString()
                : null;
            userRepository.registrarFalha(usuario.idUsuario, tentativas, bloqueadoAte);
        }
        throw new Error(mensagem);
    }

    userRepository.registrarLogin(usuario.idUsuario);
    return { usuario: userRepository.buscarPorId(usuario.idUsuario), senhaExpirada: senhaExpirada(usuario) };
}

async function alterarSenha(usuario, senhaNova) {
    const senhaValidada = passwordService.validarFormato(senhaNova);

    if (await passwordService.verificar(usuario.senhaHash, senhaValidada)) {
        throw new Error(
            "A nova senha deve ser diferente da senha atual."
        );
    }

    const hash = await passwordService.criarHash(senhaValidada);
    return userRepository.atualizarSenha(usuario.idUsuario, hash, false, usuario.idUsuario);
}

module.exports = { autenticar, alterarSenha, senhaExpirada, normalizarEmail: email };

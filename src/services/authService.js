const userRepository = require("../repositories/userRepository");
const passwordService = require("./passwordService");
const companyRepository = require("../repositories/companyRepository");

const LIMITE_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;
const SEIS_MESES_MS = 183 * 24 * 60 * 60 * 1000;

function email(valor) {
    const normalizado = String(valor ?? "").trim().toLocaleLowerCase("pt-BR");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
        throw new Error("Informe um e-mail válido.");
    }
    return normalizado;
}

function senhaExpirada(usuario) {
    return usuario.trocarSenha ||
        Date.now() - Date.parse(usuario.senhaAlteradaEm) >= SEIS_MESES_MS;
}

async function autenticar(dados = {}) {
    const mensagem = "E-mail ou senha inválidos.";
    const usuario = userRepository.buscarPorEmail(email(dados.email));

    if (!usuario || !usuario.ativo) throw new Error(mensagem);
    if (usuario.perfil !== "SUPER" && !companyRepository.buscarPorId(usuario.idEmpresa)?.ativo) {
        throw new Error(mensagem);
    }
    if (usuario.bloqueadoAte && Date.parse(usuario.bloqueadoAte) > Date.now()) {
        throw new Error("Acesso temporariamente bloqueado. Tente novamente mais tarde.");
    }

    if (!await passwordService.verificar(usuario.senhaHash, dados.senha)) {
        const tentativas = usuario.tentativasLogin + 1;
        const bloqueadoAte = tentativas >= LIMITE_TENTATIVAS
            ? new Date(Date.now() + BLOQUEIO_MS).toISOString()
            : null;
        userRepository.registrarFalha(usuario.idUsuario, tentativas, bloqueadoAte);
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

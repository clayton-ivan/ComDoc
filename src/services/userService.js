const userRepository = require("../repositories/userRepository");
const passwordService = require("./passwordService");
const authService = require("./authService");

function publico(usuario) {
    if (!usuario) return null;
    const { senhaHash, ...dados } = usuario;
    return { ...dados, senhaExpirada: authService.senhaExpirada(usuario) };
}

function validarAcesso(ator, alvo) {
    if (ator.perfil === "SUPER") return;
    const propriaConta = ator.idUsuario === alvo.idUsuario;
    if (
        ator.perfil !== "ADMIN" ||
        alvo.idEmpresa !== ator.idEmpresa ||
        (!propriaConta && alvo.perfil !== "VENDEDOR")
    ) {
        throw new Error("Acesso não autorizado.");
    }
}

function normalizar(dados, ator, existente = null) {
    const propriaConta = existente?.idUsuario === ator.idUsuario;
    const perfilInformado = propriaConta && ator.perfil === "ADMIN"
        ? existente.perfil
        : dados.perfil ?? existente?.perfil ?? "VENDEDOR";
    const perfil = String(perfilInformado).toUpperCase();
    const idEmpresa = perfil === "SUPER"
        ? null
        : Number(dados.idEmpresa ?? existente?.idEmpresa ?? ator.idEmpresa);

    if (!["SUPER", "ADMIN", "VENDEDOR"].includes(perfil)) throw new Error("Perfil inválido.");
    if (
        ator.perfil !== "SUPER" &&
        ((!propriaConta && perfil !== "VENDEDOR") || idEmpresa !== ator.idEmpresa)
    ) {
        throw new Error("O administrador pode gerenciar apenas vendedores da própria empresa.");
    }
    if (perfil !== "SUPER" && (!Number.isInteger(idEmpresa) || idEmpresa <= 0)) {
        throw new Error("Selecione uma empresa.");
    }

    const nome = String(dados.nome ?? existente?.nome ?? "").trim();
    if (!nome) throw new Error("O nome é obrigatório.");

    return {
        nome,
        email: authService.normalizarEmail(dados.email ?? existente?.email),
        perfil,
        idEmpresa,
        ativo: dados.ativo === undefined ? (existente?.ativo ?? true) : Boolean(dados.ativo),
        trocarSenha: propriaConta && ator.perfil === "ADMIN"
            ? existente.trocarSenha
            : dados.trocarSenha === undefined
                ? (existente?.trocarSenha ?? true)
                : Boolean(dados.trocarSenha)
    };
}

function listar(ator) {
    return userRepository.listar(ator.idEmpresa, ator.perfil === "SUPER").map(publico);
}

async function criar(ator, dados) {
    const usuario = normalizar(dados, ator);
    if (userRepository.buscarPorEmail(usuario.email)) throw new Error("Já existe um usuário com este e-mail.");
    usuario.senhaHash = await passwordService.criarHash(dados.senha);
    return publico(userRepository.criar(usuario, ator.idUsuario));
}

function atualizar(ator, id, dados) {
    const existente = userRepository.buscarPorId(Number(id));
    if (!existente) return null;
    validarAcesso(ator, existente);
    if (existente.idUsuario === ator.idUsuario && dados.ativo === false) {
        throw new Error("Você não pode inativar a própria conta.");
    }
    const usuario = normalizar(dados, ator, existente);
    const outroEmail = userRepository.buscarPorEmail(usuario.email);
    if (outroEmail && outroEmail.idUsuario !== existente.idUsuario) throw new Error("Já existe um usuário com este e-mail.");
    usuario.revogarSessoes = existente.ativo && !usuario.ativo;
    return publico(userRepository.atualizar(existente.idUsuario, usuario, ator.idUsuario));
}

async function redefinirSenha(ator, id, senha) {
    const existente = userRepository.buscarPorId(Number(id));
    if (!existente) return null;
    validarAcesso(ator, existente);
    const senhaValidada = passwordService.validarFormato(senha);
    if (await passwordService.verificar(existente.senhaHash, senhaValidada)) {
        throw new Error(
            "A nova senha deve ser diferente da senha atual."
        );
    }
    const hash = await passwordService.criarHash(senhaValidada);
    return publico(userRepository.atualizarSenha(existente.idUsuario, hash, true, ator.idUsuario));
}

function revogar(ator, id) {
    const existente = userRepository.buscarPorId(Number(id));
    if (!existente) return null;
    validarAcesso(ator, existente);
    return publico(userRepository.revogarTodas(existente.idUsuario));
}

function removerBloqueio(ator, id) {
    const existente = userRepository.buscarPorId(Number(id));
    if (!existente) return null;
    validarAcesso(ator, existente);
    return publico(
        userRepository.removerBloqueio(existente.idUsuario, ator.idUsuario)
    );
}

module.exports = {
    publico, listar, criar, atualizar, redefinirSenha, revogar,
    removerBloqueio
};

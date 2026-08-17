const companyRepository = require("../repositories/companyRepository");
const userRepository = require("../repositories/userRepository");
const passwordService = require("./passwordService");
const databaseRepository = require("../database/databaseRepository");
const { obterIdEmpresaAtual, obterCodigoUsuarioAtual } = require("../context/requestContext");

function texto(valor) {
    return String(valor ?? "").trim();
}

function digitos(valor) {
    return texto(valor).replace(/\D/g, "");
}

function cor(valor, nomeCampo) {
    const normalizada = texto(valor).toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(normalizada)) {
        throw new Error(`${nomeCampo} deve estar no formato hexadecimal #RRGGBB.`);
    }
    return normalizada;
}

function normalizarEmpresa(dados = {}, existente = null, ator = null) {
    const obter = (campo, padrao = "") => dados[campo] ?? existente?.[campo] ?? padrao;
    const empresa = {
        nome: texto(obter("nome")),
        nomeFantasia: texto(obter("nomeFantasia")),
        cnpj: digitos(obter("cnpj")),
        email: texto(obter("email")).toLowerCase(),
        telefone: digitos(obter("telefone")),
        whatsapp: digitos(obter("whatsapp")),
        logradouro: texto(obter("logradouro")),
        numeroEndereco: texto(obter("numeroEndereco")),
        complemento: texto(obter("complemento")),
        bairro: texto(obter("bairro")),
        cidade: texto(obter("cidade")),
        uf: texto(obter("uf")).toUpperCase(),
        cep: digitos(obter("cep")),
        site: texto(obter("site")),
        instagram: texto(obter("instagram")),
        slogan: texto(obter("slogan")),
        corPrimaria: cor(obter("corPrimaria", "#F36B21"), "A cor primária"),
        corSecundaria: cor(obter("corSecundaria", "#1F2937"), "A cor secundária"),
        ativo: ator?.perfil === "SUPER"
            ? Boolean(dados.ativo ?? existente?.ativo ?? true)
            : Boolean(existente?.ativo ?? true),
        usuarioEdicao: ator?.idUsuario ?? obterCodigoUsuarioAtual()
    };

    if (!empresa.nome) throw new Error("A razão social é obrigatória.");
    if (!empresa.nomeFantasia) throw new Error("O nome fantasia é obrigatório.");
    if (empresa.cnpj && empresa.cnpj.length !== 14) throw new Error("O CNPJ deve possuir 14 dígitos.");
    if (empresa.telefone && !/^\d{10,11}$/.test(empresa.telefone)) {
        throw new Error("O telefone deve possuir 10 ou 11 dígitos.");
    }
    if (empresa.whatsapp && !/^\d{10,11}$/.test(empresa.whatsapp)) {
        throw new Error("O WhatsApp deve possuir 10 ou 11 dígitos.");
    }
    if (empresa.cep && empresa.cep.length !== 8) throw new Error("O CEP deve possuir 8 dígitos.");
    if (empresa.uf && !/^[A-Z]{2}$/.test(empresa.uf)) throw new Error("A UF deve possuir duas letras.");
    return empresa;
}

function administradorPublico(usuario) {
    if (!usuario) return null;
    return {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        trocarSenha: usuario.trocarSenha,
        ultimoLogin: usuario.ultimoLogin,
        bloqueadoAte: usuario.bloqueadoAte
    };
}

function validarAdministrador(dados = {}) {
    const nome = texto(dados.nome);
    const email = texto(dados.email).toLocaleLowerCase("pt-BR");
    if (!nome) throw new Error("O nome do administrador é obrigatório.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Informe um e-mail válido para o administrador.");
    }
    return { nome, email };
}

function obterAtual() {
    const empresa = companyRepository.buscarPorId(obterIdEmpresaAtual());
    if (!empresa) return null;
    return { ...empresa, administrador: administradorPublico(userRepository.buscarAdminEmpresa(empresa.id)) };
}

function listarGerenciamento() {
    return companyRepository.listarComResumo().map((empresa) => ({
        ...empresa,
        administrador: administradorPublico(userRepository.buscarAdminEmpresa(empresa.id))
    }));
}

async function criar(dados = {}, ator) {
    if (ator.perfil !== "SUPER") throw new Error("Acesso não autorizado.");
    const empresa = normalizarEmpresa(dados.empresa, null, ator);
    const administrador = validarAdministrador(dados.administrador);
    if (userRepository.buscarPorEmail(administrador.email)) {
        throw new Error("Já existe um usuário com este e-mail.");
    }
    const senhaHash = await passwordService.criarHash(dados.administrador?.senha);

    return databaseRepository.executarTransacaoImediata(() => {
        const criada = companyRepository.criar(empresa);
        const usuario = userRepository.criar({
            idEmpresa: criada.id,
            nome: administrador.nome,
            email: administrador.email,
            senhaHash,
            perfil: "ADMIN",
            ativo: true,
            trocarSenha: true
        }, ator.idUsuario);
        return { ...criada, administrador: administradorPublico(usuario) };
    });
}

function atualizarAtual(dados = {}, ator) {
    const existente = companyRepository.buscarPorId(obterIdEmpresaAtual());
    if (!existente) return null;
    const empresa = normalizarEmpresa(dados, existente, ator);
    const atualizada = companyRepository.atualizar(existente.id, empresa);
    if (existente.ativo && !atualizada.ativo) {
        userRepository.revogarEmpresa(existente.id);
    }
    return { ...atualizada, administrador: administradorPublico(userRepository.buscarAdminEmpresa(existente.id)) };
}

async function atualizarAdministradorAtual(dados = {}, ator) {
    if (ator.perfil !== "SUPER") throw new Error("Acesso não autorizado.");
    const administrador = userRepository.buscarAdminEmpresa(obterIdEmpresaAtual());
    const normalizado = validarAdministrador(dados);
    const outro = userRepository.buscarPorEmail(normalizado.email);
    if (outro && outro.idUsuario !== administrador?.idUsuario) {
        throw new Error("Já existe um usuário com este e-mail.");
    }
    if (!administrador) {
        const senhaHash = await passwordService.criarHash(dados.senha);
        return administradorPublico(userRepository.criar({
            idEmpresa: obterIdEmpresaAtual(),
            nome: normalizado.nome,
            email: normalizado.email,
            senhaHash,
            perfil: "ADMIN",
            ativo: true,
            trocarSenha: true
        }, ator.idUsuario));
    }
    return administradorPublico(userRepository.atualizar(administrador.idUsuario, {
        nome: normalizado.nome,
        email: normalizado.email,
        perfil: "ADMIN",
        idEmpresa: administrador.idEmpresa,
        ativo: administrador.ativo,
        trocarSenha: Boolean(dados.trocarSenha ?? administrador.trocarSenha),
        revogarSessoes: false
    }, ator.idUsuario));
}

async function redefinirSenhaAdministradorAtual(senha, ator) {
    if (ator.perfil !== "SUPER") throw new Error("Acesso não autorizado.");
    const administrador = userRepository.buscarAdminEmpresa(obterIdEmpresaAtual());
    if (!administrador) throw new Error("Administrador não encontrado.");
    const validada = passwordService.validarFormato(senha);
    if (await passwordService.verificar(administrador.senhaHash, validada)) {
        throw new Error("A nova senha deve ser diferente da senha atual.");
    }
    const hash = await passwordService.criarHash(validada);
    return administradorPublico(userRepository.atualizarSenha(
        administrador.idUsuario, hash, true, ator.idUsuario
    ));
}

module.exports = {
    obterAtual,
    listarGerenciamento,
    criar,
    atualizarAtual,
    atualizarAdministradorAtual,
    redefinirSenhaAdministradorAtual
};

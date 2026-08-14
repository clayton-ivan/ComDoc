const companyRepository = require(
    "../repositories/companyRepository"
);

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
        throw new Error(
            `${nomeCampo} deve estar no formato hexadecimal #RRGGBB.`
        );
    }

    return normalizada;
}

function obterAtual() {
    return companyRepository.buscarPorId(
        obterIdEmpresaAtual()
    );
}

function atualizarAtual(dados = {}) {
    const empresa = {
        nome: texto(dados.nome),
        nomeFantasia: texto(dados.nomeFantasia),
        cnpj: digitos(dados.cnpj),
        email: texto(dados.email).toLowerCase(),
        telefone: digitos(dados.telefone),
        whatsapp: digitos(dados.whatsapp),
        logradouro: texto(dados.logradouro),
        numeroEndereco: texto(dados.numeroEndereco),
        complemento: texto(dados.complemento),
        bairro: texto(dados.bairro),
        cidade: texto(dados.cidade),
        uf: texto(dados.uf).toUpperCase(),
        cep: digitos(dados.cep),
        site: texto(dados.site),
        instagram: texto(dados.instagram),
        slogan: texto(dados.slogan),
        corPrimaria: cor(dados.corPrimaria, "A cor primária"),
        corSecundaria: cor(dados.corSecundaria, "A cor secundária"),
        usuarioEdicao: obterCodigoUsuarioAtual()
    };

    if (!empresa.nome) {
        throw new Error("A razão social é obrigatória.");
    }

    if (!empresa.nomeFantasia) {
        throw new Error("O nome fantasia é obrigatório.");
    }

    if (empresa.cnpj && empresa.cnpj.length !== 14) {
        throw new Error("O CNPJ deve possuir 14 dígitos.");
    }

    if (
        empresa.telefone &&
        !/^\d{10,11}$/.test(empresa.telefone)
    ) {
        throw new Error(
            "O telefone deve possuir 10 ou 11 dígitos."
        );
    }

    if (
        empresa.whatsapp &&
        !/^\d{10,11}$/.test(empresa.whatsapp)
    ) {
        throw new Error(
            "O WhatsApp deve possuir 10 ou 11 dígitos."
        );
    }

    if (empresa.cep && empresa.cep.length !== 8) {
        throw new Error("O CEP deve possuir 8 dígitos.");
    }

    if (empresa.uf && !/^[A-Z]{2}$/.test(empresa.uf)) {
        throw new Error("A UF deve possuir duas letras.");
    }

    return companyRepository.atualizar(
        obterIdEmpresaAtual(),
        empresa
    );
}

module.exports = {
    obterAtual,
    atualizarAtual
};

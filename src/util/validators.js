const {
    CPF_DIGITOS,
    CNPJ_DIGITOS,
    TELEFONE_MIN_DIGITOS,
    TELEFONE_MAX_DIGITOS,
    UF_DIGITOS
} = require("../constants/validation");

/*
|--------------------------------------------------------------------------
| Campos obrigatórios
|--------------------------------------------------------------------------
*/

function validarCampoObrigatorio(
    valor,
    nomeCampo
) {
    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        throw new Error(
            `${nomeCampo} é obrigatório.`
        );
    }
}

/*
|--------------------------------------------------------------------------
| E-mail
|--------------------------------------------------------------------------
*/

function validarEmail(email) {
    if (!email) {
        return;
    }

    const expressaoEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expressaoEmail.test(email)) {
        throw new Error(
            "O endereço de e-mail é inválido."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Quantidade exata de dígitos
|--------------------------------------------------------------------------
*/

function validarQuantidadeDigitos(
    valor,
    quantidade,
    nomeCampo
) {
    if (!valor) {
        return;
    }

    const expressao =
        new RegExp(`^\\d{${quantidade}}$`);

    if (!expressao.test(valor)) {
        throw new Error(
            `${nomeCampo} deve possuir exatamente ${quantidade} dígitos numéricos.`
        );
    }
}

/*
|--------------------------------------------------------------------------
| CPF
|--------------------------------------------------------------------------
*/

function validarCpf(cpf) {
    validarQuantidadeDigitos(
        cpf,
        CPF_DIGITOS,
        "O CPF"
    );
}

/*
|--------------------------------------------------------------------------
| CNPJ
|--------------------------------------------------------------------------
*/

function validarCnpj(cnpj) {
    validarQuantidadeDigitos(
        cnpj,
        CNPJ_DIGITOS,
        "O CNPJ"
    );
}

/*
|--------------------------------------------------------------------------
| Telefone
|--------------------------------------------------------------------------
*/

function validarTelefone(telefone) {
    if (!telefone) {
        return;
    }

    const expressao = new RegExp(
        `^\\d{${TELEFONE_MIN_DIGITOS},${TELEFONE_MAX_DIGITOS}}$`
    );

    if (!expressao.test(telefone)) {
        throw new Error(
            `O telefone deve possuir entre ${TELEFONE_MIN_DIGITOS} e ${TELEFONE_MAX_DIGITOS} dígitos numéricos.`
        );
    }
}

/*
|--------------------------------------------------------------------------
| UF
|--------------------------------------------------------------------------
*/

function validarUf(uf) {
    if (!uf) {
        return;
    }

    const expressao = new RegExp(
        `^[A-Z]{${UF_DIGITOS}}$`
    );

    if (!expressao.test(uf)) {
        throw new Error(
            `A UF deve possuir exatamente ${UF_DIGITOS} letras.`
        );
    }
}

/*
|--------------------------------------------------------------------------
| Identificadores
|--------------------------------------------------------------------------
*/

function validarIdPositivo(
    valor,
    nomeCampo = "O identificador"
) {
    const id = Number(valor);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new Error(
            `${nomeCampo} é inválido.`
        );
    }

    return id;
}

module.exports = {
    validarCampoObrigatorio,
    validarEmail,
    validarQuantidadeDigitos,
    validarCpf,
    validarCnpj,
    validarTelefone,
    validarUf,
    validarIdPositivo
};
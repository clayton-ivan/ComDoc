const {
    CPF_DIGITOS,
    CNPJ_DIGITOS,
    TELEFONE_MIN_DIGITOS,
    TELEFONE_MAX_DIGITOS,
    UF_DIGITOS
} = require("../constants/validation");
const systemParameterService = require("../services/systemParameterService");

function possuiTodosDigitosIguais(valor) {
    return /^(\d)\1+$/.test(valor);
}

function cpfValido(cpf) {
    if (possuiTodosDigitosIguais(cpf)) return false;
    const calcular = (quantidade) => {
        let soma = 0;
        for (let indice = 0; indice < quantidade; indice += 1) {
            soma += Number(cpf[indice]) * (quantidade + 1 - indice);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    return calcular(9) === Number(cpf[9]) && calcular(10) === Number(cpf[10]);
}

function cnpjValido(cnpj) {
    if (possuiTodosDigitosIguais(cnpj)) return false;
    const calcular = (quantidade) => {
        const pesos = quantidade === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const soma = pesos.reduce((total, peso, indice) => total + Number(cnpj[indice]) * peso, 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };
    return calcular(12) === Number(cnpj[12]) && calcular(13) === Number(cnpj[13]);
}

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

    if (cpf && systemParameterService.obter("FG_VALIDAR_DOCUMENTO_REAL") && !cpfValido(cpf)) {
        throw new Error("O CPF informado é inválido.");
    }
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

    if (cnpj && systemParameterService.obter("FG_VALIDAR_DOCUMENTO_REAL") && !cnpjValido(cnpj)) {
        throw new Error("O CNPJ informado é inválido.");
    }
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

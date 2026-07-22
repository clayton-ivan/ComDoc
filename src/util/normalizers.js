/*
|--------------------------------------------------------------------------
| Normalização de textos
|--------------------------------------------------------------------------
*/

function normalizarTexto(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return null;
    }

    const texto = String(valor).trim();

    return texto || null;
}

/*
|--------------------------------------------------------------------------
| Normalização de valores numéricos textuais
|--------------------------------------------------------------------------
|
| Utilizado para documentos e telefones.
|
| Exemplo:
|
| "123.456.789-01" -> "12345678901"
|--------------------------------------------------------------------------
*/

function normalizarSomenteNumeros(valor) {
    const texto = normalizarTexto(valor);

    if (!texto) {
        return null;
    }

    const somenteNumeros =
        texto.replace(/\D/g, "");

    return somenteNumeros || null;
}

/*
|--------------------------------------------------------------------------
| Normalização de números inteiros
|--------------------------------------------------------------------------
*/

function normalizarInteiroNaoNegativo(
    valor,
    nomeCampo = "O valor"
) {
    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return null;
    }

    const numero = Number(valor);

    if (
        !Number.isInteger(numero) ||
        numero < 0
    ) {
        throw new Error(
            `${nomeCampo} deve ser um número inteiro não negativo.`
        );
    }

    return numero;
}

/*
|--------------------------------------------------------------------------
| Normalização de UF
|--------------------------------------------------------------------------
*/

function normalizarUf(valor) {
    const uf = normalizarTexto(valor);

    return uf
        ? uf.toUpperCase()
        : null;
}

module.exports = {
    normalizarTexto,
    normalizarSomenteNumeros,
    normalizarInteiroNaoNegativo,
    normalizarUf
};
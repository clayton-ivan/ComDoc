const argon2 = require("argon2");

function validarFormato(senha) {
    const texto = String(senha ?? "");

    if (texto.length < 7 || texto.length > 128) {
        throw new Error("A senha deve possuir entre 7 e 128 caracteres.");
    }
    if (/\s/.test(texto)) {
        throw new Error("A senha não pode possuir espaços.");
    }
    if (!/[A-Za-z]/.test(texto) || !/\d/.test(texto)) {
        throw new Error("A senha deve possuir pelo menos uma letra e um número.");
    }

    return texto;
}

function criarHash(senha) {
    return argon2.hash(validarFormato(senha), {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
    });
}

function verificar(hash, senha) {
    return argon2.verify(hash, String(senha ?? ""));
}

module.exports = { validarFormato, criarHash, verificar };

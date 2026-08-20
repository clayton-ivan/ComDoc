const repository = require("../repositories/systemParameterRepository");
const databaseRepository = require("../database/databaseRepository");
const { PARAMETROS_SISTEMA, POR_CODIGO } = require("../constants/systemParameters");

let cache = null;

function converter(definicao, valor) {
    if (definicao.tipo === "BOOLEANO") {
        if ([true, 1, "1", "true"].includes(valor)) return true;
        if ([false, 0, "0", "false"].includes(valor)) return false;
        throw new Error(`${definicao.nome} deve ser informado como Sim ou Não.`);
    }

    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < definicao.minimo || numero > definicao.maximo) {
        throw new Error(
            `${definicao.nome} deve ser um número inteiro entre ${definicao.minimo} e ${definicao.maximo}.`
        );
    }
    return numero;
}

function carregar() {
    const registros = new Map(repository.listar().map((item) => [item.codigo, item]));
    cache = new Map(PARAMETROS_SISTEMA.map((definicao) => {
        const registro = registros.get(definicao.codigo);
        const valor = converter(definicao, registro?.valor ?? definicao.valorPadrao);
        return [definicao.codigo, valor];
    }));
}

function obter(codigo) {
    const definicao = POR_CODIGO.get(codigo);
    if (!definicao) throw new Error(`Parâmetro desconhecido: ${codigo}.`);
    if (!cache) carregar();
    return cache.get(codigo);
}

function listar() {
    if (!cache) carregar();
    return PARAMETROS_SISTEMA.map((definicao) => ({
        ...definicao,
        valor: cache.get(definicao.codigo)
    }));
}

function atualizar(parametros, usuario) {
    if (!Array.isArray(parametros) || !parametros.length) {
        throw new Error("Informe ao menos um parâmetro.");
    }

    const preparados = parametros.map((item) => {
        const definicao = POR_CODIGO.get(item.codigo);
        if (!definicao) throw new Error(`Parâmetro desconhecido: ${item.codigo}.`);
        const valor = converter(definicao, item.valor);
        return { codigo: definicao.codigo, valor };
    });

    databaseRepository.executarTransacao(() => {
        preparados.forEach((item) => {
            repository.atualizar(
                item.codigo,
                item.valor === true ? "1" : item.valor === false ? "0" : String(item.valor),
                usuario.idUsuario
            );
        });
    });

    cache = null;
    return listar();
}

function limiteUploadBytes() {
    return obter("MB_LIMITE_UPLOAD_IMAGEM") * 1024 * 1024;
}

module.exports = { obter, listar, atualizar, limiteUploadBytes };

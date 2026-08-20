const config = require("../config/environment");

const PRIORIDADE = { debug: 10, info: 20, warn: 30, error: 40 };
const nivelConfigurado = PRIORIDADE[config.nivelLog] ?? PRIORIDADE.info;

function serializarErro(erro) {
    if (!erro) return undefined;
    return {
        nome: erro.name,
        mensagem: erro.message,
        ...(config.producao ? {} : { stack: erro.stack })
    };
}

function escrever(nivel, mensagem, dados = {}) {
    if (PRIORIDADE[nivel] < nivelConfigurado) return;
    const registro = {
        timestamp: new Date().toISOString(),
        nivel,
        mensagem,
        ...dados
    };
    const linha = JSON.stringify(registro);
    if (nivel === "error") process.stderr.write(`${linha}\n`);
    else process.stdout.write(`${linha}\n`);
}

module.exports = {
    debug: (mensagem, dados) => escrever("debug", mensagem, dados),
    info: (mensagem, dados) => escrever("info", mensagem, dados),
    warn: (mensagem, dados) => escrever("warn", mensagem, dados),
    error: (mensagem, erro, dados = {}) => escrever("error", mensagem, {
        ...dados,
        erro: serializarErro(erro)
    })
};

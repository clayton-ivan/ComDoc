const {
    obterDatabase
} = require("./database");

function executar(sql, parametros = []) {
    const database = obterDatabase();
    const statement = database.prepare(sql);

    return statement.run(...parametros);
}

function buscarUm(sql, parametros = []) {
    const database = obterDatabase();
    const statement = database.prepare(sql);

    return statement.get(...parametros) || null;
}

function buscarTodos(sql, parametros = []) {
    const database = obterDatabase();
    const statement = database.prepare(sql);

    return statement.all(...parametros);
}

function executarTransacao(callback) {
    const database = obterDatabase();

    database.exec("BEGIN TRANSACTION");

    try {
        const resultado = callback();

        database.exec("COMMIT");

        return resultado;
    } catch (erro) {
        database.exec("ROLLBACK");

        throw erro;
    }
}

module.exports = {
    executar,
    buscarUm,
    buscarTodos,
    executarTransacao
};
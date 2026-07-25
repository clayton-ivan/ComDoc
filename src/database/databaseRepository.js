const {
    obterDatabase
} = require("./database");

/*
|--------------------------------------------------------------------------
| Execução
|--------------------------------------------------------------------------
*/

function executar(sql, parametros = []) {
    const database = obterDatabase();

    const statement =
        database.prepare(sql);

    return statement.run(...parametros);
}

/*
|--------------------------------------------------------------------------
| Consulta de um registro
|--------------------------------------------------------------------------
*/

function buscarUm(sql, parametros = []) {
    const database = obterDatabase();

    const statement =
        database.prepare(sql);

    return (
        statement.get(...parametros) ||
        null
    );
}

/*
|--------------------------------------------------------------------------
| Consulta de vários registros
|--------------------------------------------------------------------------
*/

function buscarTodos(
    sql,
    parametros = []
) {
    const database = obterDatabase();

    const statement =
        database.prepare(sql);

    return statement.all(...parametros);
}

/*
|--------------------------------------------------------------------------
| Transação comum
|--------------------------------------------------------------------------
*/

function executarTransacao(callback) {
    const database = obterDatabase();

    database.exec(
        "BEGIN TRANSACTION"
    );

    try {
        const resultado = callback();

        database.exec("COMMIT");

        return resultado;
    } catch (erro) {
        database.exec("ROLLBACK");

        throw erro;
    }
}

/*
|--------------------------------------------------------------------------
| Transação imediata
|--------------------------------------------------------------------------
*/

function executarTransacaoImediata(
    callback
) {
    const database = obterDatabase();

    database.exec(
        "BEGIN IMMEDIATE TRANSACTION"
    );

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
    executarTransacao,
    executarTransacaoImediata
};
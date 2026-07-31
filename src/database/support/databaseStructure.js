function tabelaExiste(database, nomeTabela) {
    const statement = database.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
    `);

    return Boolean(
        statement.get(nomeTabela)
    );
}

function colunaExiste(
    database,
    nomeTabela,
    nomeColuna
) {
    if (!tabelaExiste(database, nomeTabela)) {
        return false;
    }

    const colunas = database
        .prepare(
            `PRAGMA table_info(${nomeTabela})`
        )
        .all();

    return colunas.some(
        (coluna) =>
            coluna.name === nomeColuna
    );
}

function indiceExiste(database, nomeIndice) {
    const statement = database.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'index'
          AND name = ?
    `);

    return Boolean(
        statement.get(nomeIndice)
    );
}

function obterVersaoDatabase(database) {
    const resultado = database
        .prepare("PRAGMA user_version")
        .get();

    return Number(
        resultado.user_version
    ) || 0;
}

function definirVersaoDatabase(
    database,
    versao
) {
    if (
        !Number.isInteger(versao) ||
        versao < 0
    ) {
        throw new Error(
            "A versão do banco deve ser um número inteiro não negativo."
        );
    }

    database.exec(
        `PRAGMA user_version = ${versao}`
    );
}

module.exports = {
    tabelaExiste,
    colunaExiste,
    indiceExiste,
    obterVersaoDatabase,
    definirVersaoDatabase
};

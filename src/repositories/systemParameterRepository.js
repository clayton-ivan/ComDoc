const databaseRepository = require("../database/databaseRepository");

function listar() {
    return databaseRepository.buscarTodos(`
        SELECT cod_parametro AS codigo, vlr_parametro AS valor,
               dt_edicao AS editadoEm, id_usu_edicao AS idUsuarioEdicao
        FROM parametro_sistema
        ORDER BY cod_parametro
    `);
}

function atualizar(codigo, valor, idUsuario) {
    const resultado = databaseRepository.executar(`
        UPDATE parametro_sistema
        SET vlr_parametro = ?,
            dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            id_usu_edicao = ?
        WHERE cod_parametro = ?
    `, [valor, idUsuario, codigo]);

    return Number(resultado.changes) > 0;
}

module.exports = { listar, atualizar };

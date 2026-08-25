const db = require('../database/databaseRepository');

function mapear(registro) {
    if (!registro) return null;
    return {
        idDocumento: registro.id_documento_legal,
        tipo: registro.sg_tipo,
        nome: registro.nom_documento,
        ativo: Boolean(registro.fg_status),
        idVersao: registro.id_documento_legal_versao || null,
        versao: registro.num_versao || null,
        conteudo: registro.dsc_conteudo || '',
        vigente: Boolean(registro.fg_vigente),
        publicadaEm: registro.dt_publicacao || null,
        criadaEm: registro.dt_criacao_versao || registro.dt_criacao
    };
}

const SELECT = `SELECT d.*, v.id_documento_legal_versao, v.num_versao,
    v.dsc_conteudo, v.fg_vigente, v.dt_publicacao,
    v.dt_criacao AS dt_criacao_versao
    FROM documento_legal d LEFT JOIN documento_legal_versao v
      ON v.id_documento_legal = d.id_documento_legal`;

function listar() {
    return db.buscarTodos(`${SELECT} ORDER BY d.nom_documento, v.dt_criacao DESC`)
        .map(mapear);
}

function buscarVersao(idVersao) {
    return mapear(db.buscarUm(`${SELECT} WHERE v.id_documento_legal_versao = ?`, [idVersao]));
}

function buscarVigente(tipo) {
    return mapear(db.buscarUm(`${SELECT} WHERE d.sg_tipo = ? AND d.fg_status = 1 AND v.fg_vigente = 1`, [tipo]));
}

function criarVersao(idDocumento, versao, conteudo, idUsuario) {
    const resultado = db.executar(`INSERT INTO documento_legal_versao
        (id_documento_legal, num_versao, dsc_conteudo, id_usu_criacao)
        VALUES (?, ?, ?, ?)`, [idDocumento, versao, conteudo, idUsuario]);
    return buscarVersao(Number(resultado.lastInsertRowid));
}

function atualizarVersao(idVersao, versao, conteudo, idUsuario) {
    db.executar(`UPDATE documento_legal_versao SET num_versao = ?, dsc_conteudo = ?,
        dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), id_usu_edicao = ?
        WHERE id_documento_legal_versao = ? AND dt_publicacao IS NULL`,
    [versao, conteudo, idUsuario, idVersao]);
    return buscarVersao(idVersao);
}

function publicar(idVersao, idDocumento, idUsuario) {
    db.executar(`UPDATE documento_legal_versao SET fg_vigente = 0
        WHERE id_documento_legal = ?`, [idDocumento]);
    db.executar(`UPDATE documento_legal_versao SET fg_vigente = 1,
        dt_publicacao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), id_usu_publicacao = ?
        WHERE id_documento_legal_versao = ? AND dt_publicacao IS NULL`, [idUsuario, idVersao]);
    return buscarVersao(idVersao);
}

module.exports = { listar, buscarVersao, buscarVigente, criarVersao, atualizarVersao, publicar };

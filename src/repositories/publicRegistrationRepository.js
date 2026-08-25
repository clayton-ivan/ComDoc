const db = require('../database/databaseRepository');

function registrarAceite(idEmpresa, idUsuario, idVersao, contexto) {
    db.executar(`INSERT INTO aceite_documento_legal
        (id_empresa, id_usuario, id_documento_legal_versao, end_ip,
         dsc_agente_usuario, id_requisicao) VALUES (?, ?, ?, ?, ?, ?)`, [
        idEmpresa, idUsuario, idVersao, contexto.ip, contexto.agente, contexto.idRequisicao
    ]);
}

function criarAtivacao(dados) {
    const resultado = db.executar(`INSERT INTO ativacao_empresa
        (id_empresa, id_usuario_admin, id_ativacao_anterior, end_email_destino,
         cod_token_hash, dt_expiracao, end_ip_solicitacao, dsc_agente_usuario, id_requisicao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        dados.idEmpresa, dados.idUsuario, dados.idAnterior || null, dados.email,
        dados.tokenHash, dados.expiracao, dados.ip, dados.agente, dados.idRequisicao
    ]);
    return Number(resultado.lastInsertRowid);
}

function buscarPorHash(tokenHash) {
    return db.buscarUm(`SELECT * FROM ativacao_empresa WHERE cod_token_hash = ?`, [tokenHash]);
}

function ultimaPorUsuario(idUsuario) {
    return db.buscarUm(`SELECT * FROM ativacao_empresa WHERE id_usuario_admin = ?
        ORDER BY id_ativacao_empresa DESC LIMIT 1`, [idUsuario]);
}

function quantidadeUltimaHora(idUsuario) {
    return Number(db.buscarUm(`SELECT COUNT(*) AS qtd FROM ativacao_empresa
        WHERE id_usuario_admin = ? AND julianday(dt_criacao) >= julianday('now', '-1 hour')`, [idUsuario])?.qtd || 0);
}

function invalidar(idAtivacao, motivo) {
    db.executar(`UPDATE ativacao_empresa SET
        dt_invalidacao = COALESCE(dt_invalidacao, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        sg_motivo_invalidacao = COALESCE(sg_motivo_invalidacao, ?)
        WHERE id_ativacao_empresa = ? AND dt_utilizacao IS NULL`, [motivo, idAtivacao]);
}

function utilizar(idAtivacao) {
    db.executar(`UPDATE ativacao_empresa SET
        dt_utilizacao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id_ativacao_empresa = ? AND dt_utilizacao IS NULL AND dt_invalidacao IS NULL`, [idAtivacao]);
}

function buscarCadastroPorEmail(email) {
    return db.buscarUm(`SELECT u.id_usuario, u.id_empresa, u.end_email, u.fg_email_confirmado,
        e.fg_status FROM usuario u JOIN empresa e ON e.id_empresa = u.id_empresa
        WHERE u.end_email = ? COLLATE NOCASE AND e.sg_origem_cadastro = 'PUBLICO'`, [email]);
}

function excluirPendentesAntigos() {
    const empresas = db.buscarTodos(`SELECT id_empresa FROM empresa
        WHERE sg_origem_cadastro = 'PUBLICO' AND fg_status = 0
          AND julianday(dt_criacao) < julianday('now', '-7 days')`);
    empresas.forEach(({ id_empresa: idEmpresa }) => {
        db.executar(`DELETE FROM ativacao_empresa WHERE id_empresa = ?`, [idEmpresa]);
        db.executar(`DELETE FROM aceite_documento_legal WHERE id_empresa = ?`, [idEmpresa]);
        db.executar(`DELETE FROM usuario WHERE id_empresa = ?`, [idEmpresa]);
        db.executar(`DELETE FROM empresa WHERE id_empresa = ?`, [idEmpresa]);
    });
    return empresas.length;
}

module.exports = {
    registrarAceite, criarAtivacao, buscarPorHash, ultimaPorUsuario,
    quantidadeUltimaHora, invalidar, utilizar, buscarCadastroPorEmail,
    excluirPendentesAntigos
};

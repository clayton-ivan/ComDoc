const { obterDatabase } = require("../database/database");

function mapear(registro) {
    if (!registro) return null;
    return {
        idUsuario: registro.id_usuario,
        idEmpresa: registro.id_empresa,
        nome: registro.nom_usuario,
        email: registro.end_email,
        senhaHash: registro.cod_senha_hash,
        perfil: registro.sg_perfil,
        ativo: Boolean(registro.fg_status),
        trocarSenha: Boolean(registro.fg_trocar_senha),
        tentativasLogin: registro.qtd_tentativas_login,
        bloqueadoAte: registro.dt_bloqueado_ate,
        versaoSessao: registro.num_versao_sessao,
        senhaAlteradaEm: registro.dt_senha_alterada,
        ultimoLogin: registro.dt_ultimo_login
    };
}

function buscarPorEmail(email) {
    return mapear(obterDatabase().prepare(`
        SELECT * FROM usuario WHERE end_email = ? COLLATE NOCASE
    `).get(email));
}

function buscarPorId(idUsuario) {
    return mapear(obterDatabase().prepare(`
        SELECT * FROM usuario WHERE id_usuario = ?
    `).get(idUsuario));
}

function listar(idEmpresa, superUsuario) {
    const sql = superUsuario
        ? `SELECT * FROM usuario ORDER BY nom_usuario COLLATE NOCASE`
        : `SELECT * FROM usuario WHERE id_empresa = ? ORDER BY nom_usuario COLLATE NOCASE`;
    const registros = superUsuario
        ? obterDatabase().prepare(sql).all()
        : obterDatabase().prepare(sql).all(idEmpresa);
    return registros.map(mapear);
}

function buscarAdminEmpresa(idEmpresa) {
    return mapear(obterDatabase().prepare(`
        SELECT * FROM usuario
        WHERE id_empresa = ? AND sg_perfil = 'ADMIN'
        ORDER BY fg_status DESC, id_usuario DESC
        LIMIT 1
    `).get(idEmpresa));
}

function criar(usuario, idUsuarioCriacao = null) {
    const resultado = obterDatabase().prepare(`
        INSERT INTO usuario (
            id_empresa, nom_usuario, end_email, cod_senha_hash,
            sg_perfil, fg_status, fg_trocar_senha, id_usu_criacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        usuario.idEmpresa, usuario.nome, usuario.email, usuario.senhaHash,
        usuario.perfil, usuario.ativo ? 1 : 0, usuario.trocarSenha ? 1 : 0,
        idUsuarioCriacao
    );
    return buscarPorId(Number(resultado.lastInsertRowid));
}

function atualizar(idUsuario, usuario, idUsuarioEdicao) {
    obterDatabase().prepare(`
        UPDATE usuario SET
            id_empresa = ?, nom_usuario = ?, end_email = ?, sg_perfil = ?,
            fg_status = ?, fg_trocar_senha = ?,
            num_versao_sessao = num_versao_sessao + ?,
            dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), id_usu_edicao = ?
        WHERE id_usuario = ?
    `).run(
        usuario.idEmpresa, usuario.nome, usuario.email, usuario.perfil,
        usuario.ativo ? 1 : 0, usuario.trocarSenha ? 1 : 0,
        usuario.revogarSessoes ? 1 : 0, idUsuarioEdicao, idUsuario
    );
    return buscarPorId(idUsuario);
}

function atualizarSenha(idUsuario, senhaHash, trocarSenha, idUsuarioEdicao) {
    obterDatabase().prepare(`
        UPDATE usuario SET cod_senha_hash = ?, fg_trocar_senha = ?,
            dt_senha_alterada = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            num_versao_sessao = num_versao_sessao + 1,
            qtd_tentativas_login = 0, dt_bloqueado_ate = NULL,
            dt_edicao = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), id_usu_edicao = ?
        WHERE id_usuario = ?
    `).run(senhaHash, trocarSenha ? 1 : 0, idUsuarioEdicao, idUsuario);
    return buscarPorId(idUsuario);
}

function registrarFalha(idUsuario, tentativas, bloqueadoAte) {
    obterDatabase().prepare(`
        UPDATE usuario SET qtd_tentativas_login = ?, dt_bloqueado_ate = ?
        WHERE id_usuario = ?
    `).run(tentativas, bloqueadoAte, idUsuario);
}

function registrarLogin(idUsuario) {
    obterDatabase().prepare(`
        UPDATE usuario SET qtd_tentativas_login = 0, dt_bloqueado_ate = NULL,
            dt_ultimo_login = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            num_versao_sessao = num_versao_sessao + 1
        WHERE id_usuario = ?
    `).run(idUsuario);
}

function revogarTodas(idUsuario) {
    obterDatabase().prepare(`
        UPDATE usuario SET num_versao_sessao = num_versao_sessao + 1
        WHERE id_usuario = ?
    `).run(idUsuario);
    return buscarPorId(idUsuario);
}

function revogarEmpresa(idEmpresa) {
    obterDatabase().prepare(`
        UPDATE usuario
        SET num_versao_sessao = num_versao_sessao + 1
        WHERE id_empresa = ?
    `).run(idEmpresa);
}

module.exports = {
    buscarPorEmail, buscarPorId, buscarAdminEmpresa, listar, criar, atualizar,
    atualizarSenha, registrarFalha, registrarLogin, revogarTodas,
    revogarEmpresa
};

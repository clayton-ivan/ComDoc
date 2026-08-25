const db = require('../database/databaseRepository');

function registrar(evento = {}) {
    const dados = evento.dados == null ? null : JSON.stringify(evento.dados);
    db.executar(`INSERT INTO auditoria
        (id_empresa, id_usuario, sg_acao, sg_recurso, cod_recurso, dsc_dados,
         end_ip, dsc_agente_usuario, id_requisicao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        evento.idEmpresa || null, evento.idUsuario || null, evento.acao,
        evento.recurso || null, evento.codigo == null ? null : String(evento.codigo),
        dados, evento.ip || null, evento.agente || null, evento.idRequisicao || null
    ]);
}

module.exports = { registrar };

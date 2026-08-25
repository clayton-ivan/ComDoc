const service = require('../services/legalDocumentService');

function contexto(req) {
    return { idEmpresa: req.idEmpresa, idUsuario: req.usuario?.idUsuario,
        ip: req.ip, agente: req.get('user-agent'), idRequisicao: req.idRequisicao };
}

function responderErro(res, erro) {
    const status = /não encontrad/i.test(erro.message) ? 404 : 400;
    return res.status(status).json({ sucesso: false, mensagem: erro.message });
}

function listar(req, res) { return res.json(service.listar()); }
function listarPublicos(req, res) { return res.json(service.vigentesPublicos()); }
function criar(req, res) {
    try { return res.status(201).json({ sucesso: true, documento: service.criar(req.body, contexto(req)) }); }
    catch (erro) { return responderErro(res, erro); }
}
function atualizar(req, res) {
    try {
        const documento = service.atualizar(req.params.id, req.body, contexto(req));
        if (!documento) return res.status(404).json({ sucesso: false, mensagem: 'Versão não encontrada.' });
        return res.json({ sucesso: true, documento });
    } catch (erro) { return responderErro(res, erro); }
}
function publicar(req, res) {
    try {
        const documento = service.publicar(req.params.id, contexto(req));
        if (!documento) return res.status(404).json({ sucesso: false, mensagem: 'Versão não encontrada.' });
        return res.json({ sucesso: true, documento });
    } catch (erro) { return responderErro(res, erro); }
}

module.exports = { listar, listarPublicos, criar, atualizar, publicar };

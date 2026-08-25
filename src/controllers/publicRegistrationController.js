const service = require('../services/publicRegistrationService');

function contexto(req) {
    return { ip: req.ip, agente: req.get('user-agent') || '', idRequisicao: req.idRequisicao };
}

async function cadastrar(req, res) {
    try { return res.status(201).json({ sucesso: true, ...(await service.cadastrar(req.body, contexto(req))) }); }
    catch (erro) { return res.status(400).json({ sucesso: false, mensagem: erro.message }); }
}
async function confirmar(req, res) {
    try { await service.confirmar(req.body?.token, contexto(req)); return res.json({ sucesso: true }); }
    catch (erro) { return res.status(400).json({ sucesso: false, mensagem: erro.message }); }
}
async function reenviar(req, res) {
    try {
        await service.reenviar(req.body?.email, contexto(req));
        return res.json({ sucesso: true, mensagem: 'Se houver um cadastro pendente, o e-mail será enviado.' });
    } catch (erro) { return res.status(400).json({ sucesso: false, mensagem: erro.message }); }
}

module.exports = { cadastrar, confirmar, reenviar };

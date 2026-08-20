const service = require("../services/systemParameterService");

function listar(req, res) {
    try {
        return res.json(service.listar());
    } catch (erro) {
        return res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
}

function atualizar(req, res) {
    try {
        return res.json(service.atualizar(req.body?.parametros, req.usuario));
    } catch (erro) {
        return res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
}

function listarPublicos(req, res) {
    return res.json({
        limiteUploadImagemMb: service.obter("MB_LIMITE_UPLOAD_IMAGEM")
    });
}

module.exports = { listar, atualizar, listarPublicos };

const userService = require("../services/userService");

function erro(res, e) { return res.status(400).json({ sucesso: false, mensagem: e.message }); }
function listar(req, res) { return res.json(userService.listar(req.usuario)); }
async function criar(req, res) { try { return res.status(201).json(await userService.criar(req.usuario, req.body)); } catch (e) { return erro(res, e); } }
function atualizar(req, res) { try { const u = userService.atualizar(req.usuario, req.params.id, req.body); return u ? res.json(u) : res.status(404).json({ sucesso: false }); } catch (e) { return erro(res, e); } }
async function redefinirSenha(req, res) { try { const u = await userService.redefinirSenha(req.usuario, req.params.id, req.body?.senha); return u ? res.json(u) : res.status(404).json({ sucesso: false }); } catch (e) { return erro(res, e); } }
function revogar(req, res) { try { const u = userService.revogar(req.usuario, req.params.id); return u ? res.json(u) : res.status(404).json({ sucesso: false }); } catch (e) { return erro(res, e); } }

module.exports = { listar, criar, atualizar, redefinirSenha, revogar };

const { AsyncLocalStorage } = require("node:async_hooks");
const { ID_EMPRESA_PADRAO } = require("../constants/application");

const storage = new AsyncLocalStorage();

function middleware(req, res, next) {
    storage.run({ req }, next);
}

function obterRequisicao() {
    return storage.getStore()?.req;
}

function obterUsuarioAtual() {
    return obterRequisicao()?.usuario || null;
}

function obterIdEmpresaAtual() {
    return obterRequisicao()?.idEmpresa || ID_EMPRESA_PADRAO;
}

function obterCodigoUsuarioAtual() {
    const usuario = obterUsuarioAtual();
    return usuario ? String(usuario.idUsuario) : "SISTEMA";
}

module.exports = {
    middleware,
    obterUsuarioAtual,
    obterIdEmpresaAtual,
    obterCodigoUsuarioAtual
};

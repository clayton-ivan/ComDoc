const productRepository = require("../repositories/productRepository");
const productImageService = require("../services/productImageService");

function autorizar(req, res, next) {
    let caminho;
    try {
        caminho = decodeURIComponent(req.path);
    } catch {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Caminho de arquivo inválido."
        });
    }
    const empresa = caminho.match(/^\/empresas\/(\d+)\//i);

    if (empresa) {
        if (Number(empresa[1]) !== Number(req.idEmpresa)) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso ao arquivo não autorizado."
            });
        }
        return next();
    }

    const produto = caminho.match(/^\/produtos\/([^/]+)\//i);
    if (produto) {
        const pastaPermitida = productRepository
            .listarCodigos(req.idEmpresa)
            .some((codigo) =>
                productImageService.obterIdentificadorProduto(
                    req.idEmpresa,
                    codigo
                ) === produto[1]
            );

        if (!pastaPermitida) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso ao arquivo não autorizado."
            });
        }
        return next();
    }

    return res.status(404).json({
        sucesso: false,
        mensagem: "Arquivo não encontrado."
    });
}

module.exports = { autorizar };

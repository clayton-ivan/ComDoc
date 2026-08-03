const productBlockService = require(
    "../services/productBlockService"
);

const HTTP = require(
    "../constants/httpStatus"
);

function listarTipos(req, res) {
    try {
        const tipos =
            productBlockService
                .listarTiposAtivos();

        return res.json(tipos);
    } catch (erro) {
        console.error(
            "Erro ao listar tipos de bloco:",
            erro
        );

        return res
            .status(
                HTTP.INTERNAL_SERVER_ERROR
            )
            .json({
                sucesso: false,
                mensagem:
                    "Não foi possível listar os tipos de bloco."
            });
    }
}

function listarPorProduto(req, res) {
    try {
        const blocos =
            productBlockService
                .listarPorCodigoProduto(
                    req.params.codigo
                );

        if (blocos === null) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    sucesso: false,
                    mensagem:
                        "Produto não encontrado."
                });
        }

        return res.json(blocos);
    } catch (erro) {
        console.error(
            "Erro ao listar blocos do produto:",
            erro
        );

        return res
            .status(
                HTTP.INTERNAL_SERVER_ERROR
            )
            .json({
                sucesso: false,
                mensagem:
                    "Não foi possível listar a descrição detalhada."
            });
    }
}

function substituirPorProduto(req, res) {
    try {
        const blocos =
            productBlockService
                .substituirPorCodigoProduto(
                    req.params.codigo,
                    req.body.blocos
                );

        if (blocos === null) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    sucesso: false,
                    mensagem:
                        "Produto não encontrado."
                });
        }

        return res.json({
            sucesso: true,
            blocos
        });
    } catch (erro) {
        console.error(
            "Erro ao salvar blocos do produto:",
            erro
        );

        return res
            .status(HTTP.BAD_REQUEST)
            .json({
                sucesso: false,
                mensagem: erro.message
            });
    }
}

module.exports = {
    listarTipos,
    listarPorProduto,
    substituirPorProduto
};

const multer = require("multer");

const productImageService = require(
    "../services/productImageService"
);

const HTTP = require("../constants/httpStatus");

const receberImagem = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
}).single("imagem");

function upload(req, res) {
    receberImagem(req, res, (erroUpload) => {
        if (erroUpload) {
            const tamanhoExcedido =
                erroUpload.code === "LIMIT_FILE_SIZE";

            return res
                .status(HTTP.BAD_REQUEST)
                .json({
                    sucesso: false,
                    mensagem: tamanhoExcedido
                        ? "A imagem deve possuir no máximo 5 MB."
                        : "Não foi possível receber a imagem."
                });
        }

        try {
            const imagem = productImageService.salvar(
                req.params.codigo,
                req.file
            );

            if (imagem === null) {
                return res
                    .status(HTTP.NOT_FOUND)
                    .json({
                        sucesso: false,
                        mensagem: "Produto não encontrado."
                    });
            }

            return res.status(HTTP.CREATED).json({
                sucesso: true,
                imagem
            });
        } catch (erro) {
            console.error("Erro ao salvar imagem:", erro);

            return res
                .status(HTTP.BAD_REQUEST)
                .json({
                    sucesso: false,
                    mensagem: erro.message
                });
        }
    });
}

function excluir(req, res) {
    try {
        const excluida = productImageService.excluir(
            req.params.codigo,
            req.params.nome
        );

        if (excluida === null) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    sucesso: false,
                    mensagem: "Produto não encontrado."
                });
        }

        if (!excluida) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    sucesso: false,
                    mensagem: "Imagem não encontrada."
                });
        }

        return res.json({ sucesso: true });
    } catch (erro) {
        console.error("Erro ao excluir imagem:", erro);

        return res
            .status(HTTP.BAD_REQUEST)
            .json({
                sucesso: false,
                mensagem: erro.message
            });
    }
}

module.exports = {
    upload,
    excluir
};

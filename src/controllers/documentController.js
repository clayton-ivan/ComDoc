const documentService =
    require(
        "../services/documentService"
    );
const fs = require("node:fs");

const cotacaoService =
    require(
        "../services/cotacaoService"
    );

const productService =
    require(
        "../services/productService"
    );

const productPreviewService =
    require(
        "../services/productPreviewService"
    );

const companyService =
    require(
        "../services/companyService"
    );

const HTTP =
    require(
        "../constants/httpStatus"
    );

const { obterIdEmpresaAtual } = require("../context/requestContext");
const logger = require("../services/loggerService");

/*
|--------------------------------------------------------------------------
| Formatação do número
|--------------------------------------------------------------------------
*/

function formatarNumeroCotacao(numero) {
    return String(numero)
        .padStart(3, "0");
}

/*
|--------------------------------------------------------------------------
| Geração
|--------------------------------------------------------------------------
*/

const gerar = async (req, res) => {
    try {
        /*
         * A cotação é persistida antes da
         * geração do documento.
         */
        const cotacao =
            cotacaoService.criar(
                req.body
            );

        const contexto = {
            ...req.body,

            idEmpresa:
                obterIdEmpresaAtual(),

            empresa:
                companyService.obterAtual(),

            produtoCodigo:
                cotacao.produto.codigo,

            produtoNome:
                cotacao.produto.nome,

            produtoDescricao:
                cotacao.produto.descricao,

            produtoBlocos:
                cotacao.produto.blocos,

            idCotacao:
                cotacao.idCotacao,

            numero:
                formatarNumeroCotacao(
                    cotacao.numero
                ),

            valorTotal:
                cotacao.valorTotal,

            itens:
                cotacao.itens
        };

        const resultado =
            await documentService.gerar({
                template: "cotacao",
                contexto
            });

        logger.info("Cotação criada", {
            idRequisicao: req.idRequisicao,
            idCotacao: cotacao.idCotacao,
            numero: cotacao.numero
        });

        return res.download(
            resultado.caminhoPdf,
            `cotacao-${contexto.numero}.pdf`,
            (erroDownload) => {
                fs.promises.unlink(resultado.caminhoPdf).catch((erroExclusao) => {
                    logger.warn("Não foi possível remover o PDF temporário", {
                        idRequisicao: req.idRequisicao,
                        erro: erroExclusao.message
                    });
                });

                if (erroDownload) {
                    logger.error("Erro durante o download da cotação", erroDownload, {
                        idRequisicao: req.idRequisicao
                    });
                    if (!res.headersSent) {
                        res.status(HTTP.INTERNAL_SERVER_ERROR).json({
                            sucesso: false,
                            mensagem: "Não foi possível enviar o documento."
                        });
                    }
                }
            }
        );
    } catch (erro) {
        logger.error("Erro ao gerar cotação", erro, {
            idRequisicao: req.idRequisicao
        });

        res
            .status(
                HTTP.INTERNAL_SERVER_ERROR
            )
            .json({
                sucesso: false,
                mensagem: erro.message
            });
    }
};

const preVisualizarProduto = async (
    req,
    res
) => {
    try {
        const codigoProduto = String(
            req.body?.codigoProduto || ""
        ).trim();

        const produto =
            productService.buscarPorCodigo(
                codigoProduto
            );

        if (!produto) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    sucesso: false,
                    mensagem:
                        "Produto não encontrado."
                });
        }

        const produtoBlocos = Array.isArray(
            req.body?.blocos
        )
            ? req.body.blocos
            : [];

        const pdf =
            await productPreviewService.gerar({
                idEmpresa:
                    obterIdEmpresaAtual(),
                empresa:
                    companyService.obterAtual(),
                produtoCodigo:
                    produto.codigo,
                produtoNome:
                    produto.nome,
                produtoDescricao:
                    produto.descricao,
                produtoBlocos
            });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition":
                "inline; filename=preview-produto.pdf",
            "Cache-Control":
                "no-store, no-cache, must-revalidate, private"
        });

        return res.send(pdf);
    } catch (erro) {
        logger.error("Erro ao gerar pré-visualização do produto", erro, {
            idRequisicao: req.idRequisicao
        });

        return res
            .status(
                HTTP.INTERNAL_SERVER_ERROR
            )
            .json({
                sucesso: false,
                mensagem: erro.message
            });
    }
};

module.exports = {
    gerar,
    preVisualizarProduto
};

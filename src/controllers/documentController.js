const documentService =
    require(
        "../services/documentService"
    );

const cotacaoService =
    require(
        "../services/cotacaoService"
    );

const HTTP =
    require(
        "../constants/httpStatus"
    );

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
    console.log(
        "Recebi uma solicitação para gerar uma cotação."
    );

    console.log(req.body);

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

        console.log(
            "Cotação criada:",
            {
                idCotacao:
                    cotacao.idCotacao,

                numero:
                    cotacao.numero
            }
        );

        res.download(
            resultado.caminhoPdf,
            `cotacao-${contexto.numero}.pdf`
        );
    } catch (erro) {
        console.error(
            "ERRO NO CONTROLLER:"
        );

        console.error(erro);

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

module.exports = {
    gerar
};
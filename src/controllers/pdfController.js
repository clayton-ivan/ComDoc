const documentService = require("../services/documentService");

const gerar = async (req, res) => {

    try {

        const resultado = await documentService.gerar({
										template: "cotacao",
										dados: req.body
									});

        console.log(resultado);

        res.download(resultado.caminhoPdf);

    } catch (erro) {

        console.error("ERRO NO CONTROLLER:");
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: erro.message
        });

    }

};

module.exports = {
    gerar
};
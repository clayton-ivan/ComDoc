const documentService = require("../services/documentService");

const HTTP = require("../constants/httpStatus");

const gerar = async (req, res) => {
	
	console.log("Recebi uma solicitação para gerar uma cotação.");
	console.log(req.body);
	
	const dados = req.body;
	
	const contexto = {
		...dados,
		numero: "001"
	};

    try {

        const resultado = await documentService.gerar({
			template: "cotacao",
			contexto
		});

        console.log(resultado);

        res.download(resultado.caminhoPdf);

    } catch (erro) {

        console.error("ERRO NO CONTROLLER:");
        console.error(erro);

        res.status(HTTP.INTERNAL_SERVER_ERROR).json({
            sucesso: false,
            mensagem: erro.message
        });

    }

};

module.exports = {
    gerar
};
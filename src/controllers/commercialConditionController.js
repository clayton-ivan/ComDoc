const service = require(
    "../services/commercialConditionService"
);

const HTTP = require("../constants/httpStatus");

function criarControlador(tipo) {
    return {
        listar(req, res) {
            return res.json(service.listar(tipo));
        },

        criar(req, res) {
            try {
                const registro = service.obterOuCriar(
                    tipo,
                    req.body?.descricao
                );

                if (!registro) {
                    throw new Error("A descrição é obrigatória.");
                }

                return res.status(HTTP.CREATED).json(registro);
            } catch (erro) {
                return res.status(HTTP.BAD_REQUEST).json({
                    sucesso: false,
                    mensagem: erro.message
                });
            }
        },

        excluir(req, res) {
            try {
                if (!service.excluir(tipo, req.params.id)) {
                    return res.status(HTTP.NOT_FOUND).json({
                        sucesso: false,
                        mensagem: "Opção não encontrada."
                    });
                }

                return res.json({ sucesso: true });
            } catch (erro) {
                return res.status(HTTP.BAD_REQUEST).json({
                    sucesso: false,
                    mensagem: erro.message
                });
            }
        }
    };
}

module.exports = {
    prazosEntrega: criarControlador("prazoEntrega"),
    formasPagamento: criarControlador("formaPagamento")
};

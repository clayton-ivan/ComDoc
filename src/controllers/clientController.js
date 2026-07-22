const clientService =
    require("../services/clientService");

const HTTP = require("../constants/httpStatus");

const MESSAGES = require("../constants/messages");

/*
|--------------------------------------------------------------------------
| Tratamento de erros
|--------------------------------------------------------------------------
*/

function enviarErro(
    res,
    erro,
    status = BAD_REQUEST
) {
    console.error(erro);

    return res.status(status).json({
        erro: erro.message
    });
}

/*
|--------------------------------------------------------------------------
| Listagem
|--------------------------------------------------------------------------
*/

function listar(req, res) {
    try {
        const clientes =
            clientService.listar();

        return res.status(HTTP.OK).json(
            clientes
        );
    } catch (erro) {
        return enviarErro(
            res,
            erro,
            HTTP.INTERNAL_SERVER_ERROR
        );
    }
}

/*
|--------------------------------------------------------------------------
| Busca por ID
|--------------------------------------------------------------------------
*/

function buscarPorId(req, res) {
    try {
        const cliente =
            clientService.buscarPorId(
                req.params.id
            );

        if (!cliente) {
            return res.status(HTTP.NOT_FOUND).json({
                erro: MESSAGES.CLIENTE_NAO_ENCONTRADO
            });
        }

        return res.status(OK).json(
            cliente
        );
    } catch (erro) {
        return enviarErro(res, erro);
    }
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(req, res) {
    try {
        const cliente =
            clientService.criar(
                req.body
            );

        return res.status(HTTP.CREATED).json(
            cliente
        );
    } catch (erro) {
        return enviarErro(res, erro);
    }
}

/*
|--------------------------------------------------------------------------
| Atualização
|--------------------------------------------------------------------------
*/

function atualizar(req, res) {
    try {
        const cliente =
            clientService.atualizar(
                req.params.id,
                req.body
            );

        if (!cliente) {
            return res.status(HTTP.NOT_FOUND).json({
                erro: MESSAGES.CLIENTE_NAO_ENCONTRADO
            });
        }

        return res.status(OK).json(
            cliente
        );
    } catch (erro) {
        return enviarErro(res, erro);
    }
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

function excluir(req, res) {
    try {
        const excluido =
            clientService.excluir(
                req.params.id
            );

        if (!excluido) {
            return res.status(HTTP.NOT_FOUND).json({
                erro: MESSAGES.CLIENTE_NAO_ENCONTRADO
            });
        }

        return res.status(NO_CONTENT).send();
    } catch (erro) {
        return enviarErro(res, erro);
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    excluir
};
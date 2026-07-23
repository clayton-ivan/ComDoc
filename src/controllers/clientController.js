const clientService = require(
    "../services/clientService"
);

const HTTP = require(
    "../constants/httpStatus"
);

const MESSAGES = require(
    "../constants/messages"
);

/*
|--------------------------------------------------------------------------
| Tratamento de erros
|--------------------------------------------------------------------------
*/

function enviarErro(
    res,
    erro,
    status = HTTP.BAD_REQUEST
) {
    console.error(erro);

    return res
        .status(status)
        .json({
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

        return res
            .status(HTTP.OK)
            .json(clientes);
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
| Busca por CPF
|--------------------------------------------------------------------------
*/

function buscarPorCpf(req, res) {
    try {
        const cliente =
            clientService.buscarPorCpf(
                req.params.cpf
            );

        if (!cliente) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    erro:
                        MESSAGES.CLIENTE_NAO_ENCONTRADO
                });
        }

        return res
            .status(HTTP.OK)
            .json(cliente);
    } catch (erro) {
        return enviarErro(
            res,
            erro
        );
    }
}

/*
|--------------------------------------------------------------------------
| Busca por CNPJ
|--------------------------------------------------------------------------
*/

function buscarPorCnpj(req, res) {
    try {
        const cliente =
            clientService.buscarPorCnpj(
                req.params.cnpj
            );

        if (!cliente) {
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    erro:
                        MESSAGES.CLIENTE_NAO_ENCONTRADO
                });
        }

        return res
            .status(HTTP.OK)
            .json(cliente);
    } catch (erro) {
        return enviarErro(
            res,
            erro
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
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    erro:
                        MESSAGES.CLIENTE_NAO_ENCONTRADO
                });
        }

        return res
            .status(HTTP.OK)
            .json(cliente);
    } catch (erro) {
        return enviarErro(
            res,
            erro
        );
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

        return res
            .status(HTTP.CREATED)
            .json(cliente);
    } catch (erro) {
        return enviarErro(
            res,
            erro
        );
    }
}

/*
|--------------------------------------------------------------------------
| Obtenção ou criação
|--------------------------------------------------------------------------
*/

function obterOuCriarCliente(req, res) {
    try {
        const resultado =
            clientService.obterOuCriarCliente(
                req.body
            );

        const status = resultado.criado
            ? HTTP.CREATED
            : HTTP.OK;

        return res
            .status(status)
            .json(resultado);
    } catch (erro) {
        return enviarErro(
            res,
            erro
        );
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
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    erro:
                        MESSAGES.CLIENTE_NAO_ENCONTRADO
                });
        }

        return res
            .status(HTTP.OK)
            .json(cliente);
    } catch (erro) {
        return enviarErro(
            res,
            erro
        );
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
            return res
                .status(HTTP.NOT_FOUND)
                .json({
                    erro:
                        MESSAGES.CLIENTE_NAO_ENCONTRADO
                });
        }

        return res
            .status(HTTP.NO_CONTENT)
            .send();
    } catch (erro) {
        return enviarErro(
            res,
            erro
        );
    }
}

module.exports = {
    listar,
    buscarPorCpf,
    buscarPorCnpj,
    buscarPorId,
    criar,
    obterOuCriarCliente,
    atualizar,
    excluir
};
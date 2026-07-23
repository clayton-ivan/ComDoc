const express = require("express");

const clientController = require(
    "../controllers/clientController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Consultas
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    clientController.listar
);

/*
 * Estas rotas precisam ficar antes de "/:id".
 *
 * Caso contrário, o Express pode interpretar
 * "cpf" ou "cnpj" como o valor do parâmetro "id".
 */

router.get(
    "/cpf/:cpf",
    clientController.buscarPorCpf
);

router.get(
    "/cnpj/:cnpj",
    clientController.buscarPorCnpj
);

router.get(
    "/:id",
    clientController.buscarPorId
);

/*
|--------------------------------------------------------------------------
| Alterações
|--------------------------------------------------------------------------
*/

router.post(
    "/obter-ou-criar",
    clientController.obterOuCriarCliente
);

router.post(
    "/",
    clientController.criar
);

router.put(
    "/:id",
    clientController.atualizar
);

router.delete(
    "/:id",
    clientController.excluir
);

module.exports = router;
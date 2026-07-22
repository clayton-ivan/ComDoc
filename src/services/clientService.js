const clientRepository =
    require("../repositories/clientRepository");

const {
    normalizarTexto,
    normalizarSomenteNumeros,
    normalizarInteiroNaoNegativo,
    normalizarUf
} = require("../util/normalizers");

const {
    validarCampoObrigatorio,
    validarEmail,
    validarCpf,
    validarCnpj,
    validarTelefone,
    validarUf,
    validarIdPositivo
} = require("../util/validators");

/*
|--------------------------------------------------------------------------
| Normalização
|--------------------------------------------------------------------------
*/

function normalizarCliente(dados = {}) {
    return {
        nome: normalizarTexto(
            dados.nome
        ),

        email: normalizarTexto(
            dados.email
        ),

        telefone: normalizarSomenteNumeros(
            dados.telefone
        ),

        cpf: normalizarSomenteNumeros(
            dados.cpf
        ),

        cnpj: normalizarSomenteNumeros(
            dados.cnpj
        ),

        logradouro: normalizarTexto(
            dados.logradouro
        ),

        numeroEndereco:
            normalizarInteiroNaoNegativo(
                dados.numeroEndereco,
                "O número do endereço"
            ),

        complemento: normalizarTexto(
            dados.complemento
        ),

        cidade: normalizarTexto(
            dados.cidade
        ),

        uf: normalizarUf(
            dados.uf
        )
    };
}

/*
|--------------------------------------------------------------------------
| Validação do cliente
|--------------------------------------------------------------------------
*/

function validarCliente(cliente) {
    validarCampoObrigatorio(
        cliente.nome,
        "O nome do cliente"
    );

    if (
        cliente.cpf &&
        cliente.cnpj
    ) {
        throw new Error(
            "Informe apenas CPF ou CNPJ, não os dois."
        );
    }

    validarEmail(cliente.email);
    validarTelefone(cliente.telefone);
    validarCpf(cliente.cpf);
    validarCnpj(cliente.cnpj);
    validarUf(cliente.uf);
}

/*
|--------------------------------------------------------------------------
| Validação de documentos duplicados
|--------------------------------------------------------------------------
*/

function validarDocumentoDuplicado(
    cliente,
    idClienteAtual = null
) {
    if (cliente.cpf) {
        const clienteComCpf =
            clientRepository.buscarPorCpf(
                cliente.cpf
            );

        if (
            clienteComCpf &&
            clienteComCpf.idCliente !==
                idClienteAtual
        ) {
            throw new Error(
                "Já existe um cliente cadastrado com este CPF."
            );
        }
    }

    if (cliente.cnpj) {
        const clienteComCnpj =
            clientRepository.buscarPorCnpj(
                cliente.cnpj
            );

        if (
            clienteComCnpj &&
            clienteComCnpj.idCliente !==
                idClienteAtual
        ) {
            throw new Error(
                "Já existe um cliente cadastrado com este CNPJ."
            );
        }
    }
}

/*
|--------------------------------------------------------------------------
| Listagem
|--------------------------------------------------------------------------
*/

function listar() {
    return clientRepository.listar();
}

/*
|--------------------------------------------------------------------------
| Busca por ID
|--------------------------------------------------------------------------
*/

function buscarPorId(idCliente) {
    const id = validarIdPositivo(
        idCliente,
        "O identificador do cliente"
    );

    return clientRepository.buscarPorId(id);
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(dadosCliente) {
    const cliente =
        normalizarCliente(dadosCliente);

    validarCliente(cliente);
    validarDocumentoDuplicado(cliente);

    return clientRepository.criar(cliente);
}

/*
|--------------------------------------------------------------------------
| Atualização
|--------------------------------------------------------------------------
*/

function atualizar(
    idCliente,
    dadosCliente
) {
    const id = validarIdPositivo(
        idCliente,
        "O identificador do cliente"
    );

    const clienteExistente =
        clientRepository.buscarPorId(id);

    if (!clienteExistente) {
        return null;
    }

    const cliente =
        normalizarCliente(dadosCliente);

    validarCliente(cliente);

    validarDocumentoDuplicado(
        cliente,
        id
    );

    return clientRepository.atualizar(
        id,
        cliente
    );
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

function excluir(idCliente) {
    const id = validarIdPositivo(
        idCliente,
        "O identificador do cliente"
    );

    return clientRepository.excluir(id);
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    excluir
};
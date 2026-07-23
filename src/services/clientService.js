const clientRepository = require(
    "../repositories/clientRepository"
);

const {
    ID_EMPRESA_PADRAO,
    COD_USUARIO_SISTEMA
} = require(
    "../constants/application"
);

const {
    normalizarTexto,
    normalizarSomenteNumeros,
    normalizarInteiroNaoNegativo,
    normalizarUf
} = require(
    "../util/normalizers"
);

const {
    validarCampoObrigatorio,
    validarEmail,
    validarCpf,
    validarCnpj,
    validarTelefone,
    validarUf,
    validarIdPositivo
} = require(
    "../util/validators"
);

/*
|--------------------------------------------------------------------------
| Empresa atual
|--------------------------------------------------------------------------
|
| Temporariamente, todas as operações utilizam a empresa padrão.
|
| No futuro, esta informação virá do usuário autenticado, por exemplo:
|
| req.usuario.idEmpresa
|
*/

function obterIdEmpresaAtual() {
    return ID_EMPRESA_PADRAO;
}

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

        telefone:
            normalizarSomenteNumeros(
                dados.telefone
            ),

        cpf:
            normalizarSomenteNumeros(
                dados.cpf
            ),

        cnpj:
            normalizarSomenteNumeros(
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
    idEmpresa,
    cliente,
    idClienteAtual = null
) {
    if (cliente.cpf) {
        const clienteComCpf =
            clientRepository.buscarPorCpf(
                idEmpresa,
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
                idEmpresa,
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
    const idEmpresa =
        obterIdEmpresaAtual();

    return clientRepository.listar(
        idEmpresa
    );
}

/*
|--------------------------------------------------------------------------
| Busca por ID
|--------------------------------------------------------------------------
*/

function buscarPorId(idCliente) {
    const idEmpresa =
        obterIdEmpresaAtual();

    const id = validarIdPositivo(
        idCliente,
        "O identificador do cliente"
    );

    return clientRepository.buscarPorId(
        idEmpresa,
        id
    );
}

/*
|--------------------------------------------------------------------------
| Busca por CNPJ
|--------------------------------------------------------------------------
*/

function buscarPorCnpj(cnpj) {
    const idEmpresa =
        obterIdEmpresaAtual();

    const cnpjNormalizado =
        normalizarSomenteNumeros(cnpj);

    validarCampoObrigatorio(
        cnpjNormalizado,
        "O CNPJ"
    );

    validarCnpj(cnpjNormalizado);

    return clientRepository.buscarPorCnpj(
        idEmpresa,
        cnpjNormalizado
    );
}

/*
|--------------------------------------------------------------------------
| Criação
|--------------------------------------------------------------------------
*/

function criar(
    dadosCliente,
    codUsuarioEdicao = null
) {
    const idEmpresa =
        obterIdEmpresaAtual();

    const cliente =
        normalizarCliente(dadosCliente);

    validarCliente(cliente);

    validarDocumentoDuplicado(
        idEmpresa,
        cliente
    );

    return clientRepository.criar(
        idEmpresa,
        cliente,
        codUsuarioEdicao
    );
}

/*
|--------------------------------------------------------------------------
| Obtenção ou criação
|--------------------------------------------------------------------------
|
| Este método será chamado internamente pela geração da proposta.
|
| Regra:
|
| - se o CNPJ já existir, retorna o cadastro existente;
| - se não existir, cadastra o cliente;
| - não atualiza automaticamente um cliente existente;
| - os dados específicos da proposta continuam sendo os dados enviados
|   no formulário da cotação.
|
*/

function obterOuCriarCliente(
    dadosCliente,
    codUsuarioEdicao =
        COD_USUARIO_SISTEMA
) {
    const idEmpresa =
        obterIdEmpresaAtual();

    const cliente =
        normalizarCliente(dadosCliente);

    validarCliente(cliente);

    if (!cliente.cnpj) {
        throw new Error(
            [
                "O CNPJ é obrigatório",
                "para obter ou criar o cliente",
                "durante a geração da proposta."
            ].join(" ")
        );
    }

    const clienteExistente =
        clientRepository.buscarPorCnpj(
            idEmpresa,
            cliente.cnpj
        );

    if (clienteExistente) {
        return {
            cliente: clienteExistente,
            criado: false
        };
    }

    validarDocumentoDuplicado(
        idEmpresa,
        cliente
    );

    const clienteCriado =
        clientRepository.criar(
            idEmpresa,
            cliente,
            codUsuarioEdicao
        );

    return {
        cliente: clienteCriado,
        criado: true
    };
}

/*
|--------------------------------------------------------------------------
| Atualização
|--------------------------------------------------------------------------
*/

function atualizar(
    idCliente,
    dadosCliente,
    codUsuarioEdicao = null
) {
    const idEmpresa =
        obterIdEmpresaAtual();

    const id = validarIdPositivo(
        idCliente,
        "O identificador do cliente"
    );

    const clienteExistente =
        clientRepository.buscarPorId(
            idEmpresa,
            id
        );

    if (!clienteExistente) {
        return null;
    }

    const cliente =
        normalizarCliente(dadosCliente);

    validarCliente(cliente);

    validarDocumentoDuplicado(
        idEmpresa,
        cliente,
        id
    );

    return clientRepository.atualizar(
        idEmpresa,
        id,
        cliente,
        codUsuarioEdicao
    );
}

/*
|--------------------------------------------------------------------------
| Exclusão
|--------------------------------------------------------------------------
*/

function excluir(idCliente) {
    const idEmpresa =
        obterIdEmpresaAtual();

    const id = validarIdPositivo(
        idCliente,
        "O identificador do cliente"
    );

    return clientRepository.excluir(
        idEmpresa,
        id
    );
}

module.exports = {
    listar,
    buscarPorId,
    buscarPorCnpj,
    criar,
    obterOuCriarCliente,
    atualizar,
    excluir
};
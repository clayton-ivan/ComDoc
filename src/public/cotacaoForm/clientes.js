/*
|--------------------------------------------------------------------------
| Leitura segura da resposta
|--------------------------------------------------------------------------
*/

async function lerRespostaJson(resposta) {
    try {
        return await resposta.json();
    } catch {
        return null;
    }
}

/*
|--------------------------------------------------------------------------
| Tratamento de erro
|--------------------------------------------------------------------------
*/

function obterMensagemErro(
    resposta,
    resultado,
    mensagemPadrao
) {
    return (
        resultado?.erro ||
        resultado?.mensagem ||
        `${mensagemPadrao} Status: ${resposta.status}.`
    );
}

/*
|--------------------------------------------------------------------------
| Busca por documento
|--------------------------------------------------------------------------
*/

async function buscarClientePorDocumento(
    tipoDocumento,
    documento
) {
    if (
        tipoDocumento !== "cpf" &&
        tipoDocumento !== "cnpj"
    ) {
        throw new Error(
            "Tipo de documento inválido."
        );
    }

    if (!documento) {
        throw new Error(
            "Documento não informado."
        );
    }

    const url =
        `/clientes/${tipoDocumento}/` +
        encodeURIComponent(documento);

    const resposta =
        await fetch(url);

    const resultado =
        await lerRespostaJson(resposta);

    /*
     * Cliente inexistente faz parte do fluxo normal
     * da cotação, portanto não deve gerar exceção.
     */
    if (resposta.status === 404) {
        return null;
    }

    if (!resposta.ok) {
        throw new Error(
            obterMensagemErro(
                resposta,
                resultado,
                "Não foi possível consultar o cliente."
            )
        );
    }

    return resultado;
}

/*
|--------------------------------------------------------------------------
| Busca por CPF
|--------------------------------------------------------------------------
*/

export async function buscarClientePorCpf(cpf) {
    return buscarClientePorDocumento(
        "cpf",
        cpf
    );
}

/*
|--------------------------------------------------------------------------
| Busca por CNPJ
|--------------------------------------------------------------------------
*/

export async function buscarClientePorCnpj(cnpj) {
    return buscarClientePorDocumento(
        "cnpj",
        cnpj
    );
}

/*
|--------------------------------------------------------------------------
| Obtenção ou criação
|--------------------------------------------------------------------------
*/

export async function obterOuCriarCliente(
    dadosCliente
) {
    const resposta =
        await fetch(
            "/clientes/obter-ou-criar",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        dadosCliente
                    )
            }
        );

    const resultado =
        await lerRespostaJson(resposta);

    if (!resposta.ok) {
        throw new Error(
            obterMensagemErro(
                resposta,
                resultado,
                "Não foi possível resolver o cliente."
            )
        );
    }

    if (!resultado?.cliente?.idCliente) {
        throw new Error(
            "O servidor não retornou o cliente resolvido."
        );
    }

    return resultado;
}
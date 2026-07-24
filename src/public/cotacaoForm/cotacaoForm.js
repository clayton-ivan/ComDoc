import {
    aplicarMascaraTelefone,
    formatarCpf,
    formatarCnpj,
    somenteDigitos
} from "./mascaras.js";

import {
    buscarProdutoPorCodigo,
    preencherComboProdutos
} from "./produtos.js";

import {
    criarGerenciadorItens
} from "./itens.js";

import {
    buscarClientePorCpf,
    buscarClientePorCnpj,
    obterOuCriarCliente
} from "./clientes.js";

/*
|--------------------------------------------------------------------------
| Elementos do formulário
|--------------------------------------------------------------------------
*/

const formulario =
    document.getElementById("formulario");

const campoProduto =
    document.getElementById("produto");

const campoContato =
    document.getElementById("contato");

const campoEmail =
    document.getElementById("email");

const campoTelefone =
    document.getElementById("telefone");

const campoEndereco =
    document.getElementById("endereco");

const campoDocumento =
    document.getElementById("documento");

const labelDocumento =
    document.getElementById("labelDocumento");

const tipoDocumentoCnpj =
    document.getElementById("tipoDocumentoCnpj");

const tipoDocumentoCpf =
    document.getElementById("tipoDocumentoCpf");

const corpoItensProduto =
    document.getElementById("itensProduto");

const campoValorTotal =
    document.getElementById("valorTotal");

const statusCliente =
    document.getElementById("statusCliente");

const gerenciadorItens =
    criarGerenciadorItens(
        corpoItensProduto,
        campoValorTotal
    );

/*
|--------------------------------------------------------------------------
| Estado da tela
|--------------------------------------------------------------------------
*/

let produtoSelecionado = null;

let idCliente = null;

let documentoClienteResolvido = "";

let numeroBuscaCliente = 0;

/*
|--------------------------------------------------------------------------
| Status da consulta do cliente
|--------------------------------------------------------------------------
*/

function limparStatusCliente() {
    statusCliente.textContent = "";

    statusCliente.className =
        "status-cliente";
}

function definirStatusCliente(
    tipo,
    mensagem
) {
    statusCliente.textContent =
        mensagem;

    statusCliente.className =
        `status-cliente visivel ${tipo}`;
}

/*
|--------------------------------------------------------------------------
| Documento do cliente
|--------------------------------------------------------------------------
*/

function obterTipoDocumentoSelecionado() {
    return tipoDocumentoCpf.checked
        ? "cpf"
        : "cnpj";
}

function obterQuantidadeDocumento() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    return tipoDocumento === "cpf"
        ? 11
        : 14;
}

function obterDocumentoAtual() {
    return somenteDigitos(
        campoDocumento.value
    );
}

function obterDocumentoCliente() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    const documento =
        obterDocumentoAtual();

    return {
        tipoDocumento,

        cpf:
            tipoDocumento === "cpf"
                ? documento
                : "",

        cnpj:
            tipoDocumento === "cnpj"
                ? documento
                : ""
    };
}

/*
|--------------------------------------------------------------------------
| Limpeza dos dados do cliente
|--------------------------------------------------------------------------
*/

function limparDadosCliente() {
    campoContato.value = "";
    campoEmail.value = "";
    campoTelefone.value = "";
    campoEndereco.value = "";
}

function invalidarClienteResolvido({
    limparCampos = false
} = {}) {
    idCliente = null;
    documentoClienteResolvido = "";

    /*
     * Invalida qualquer consulta anterior que ainda
     * esteja aguardando resposta do servidor.
     */
    numeroBuscaCliente += 1;
	
	limparStatusCliente();

    if (limparCampos) {
        limparDadosCliente();
    }
}

/*
|--------------------------------------------------------------------------
| Configuração do documento
|--------------------------------------------------------------------------
*/

function configurarCampoDocumento() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    campoDocumento.value = "";

    invalidarClienteResolvido({
        limparCampos: true
    });

    campoDocumento.setCustomValidity("");

    if (tipoDocumento === "cpf") {
        labelDocumento.textContent = "CPF";

        campoDocumento.maxLength = 14;

        campoDocumento.placeholder =
            "000.000.000-00";
    } else {
        labelDocumento.textContent = "CNPJ";

        campoDocumento.maxLength = 18;

        campoDocumento.placeholder =
            "00.000.000/0000-00";
    }

    campoDocumento.focus();
}

function formatarCampoDocumento() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    if (tipoDocumento === "cpf") {
        campoDocumento.value =
            formatarCpf(
                campoDocumento.value
            );
    } else {
        campoDocumento.value =
            formatarCnpj(
                campoDocumento.value
            );
    }

    campoDocumento.setCustomValidity("");
}

/*
|--------------------------------------------------------------------------
| Endereço do cliente
|--------------------------------------------------------------------------
*/

function montarEnderecoCliente(cliente) {
    const logradouro =
        String(
            cliente.logradouro ?? ""
        ).trim();

    const numeroEndereco =
        cliente.numeroEndereco !== null &&
        cliente.numeroEndereco !== undefined &&
        String(cliente.numeroEndereco).trim() !== ""
            ? String(cliente.numeroEndereco).trim()
            : "";

    const complemento =
        String(
            cliente.complemento ?? ""
        ).trim();

    const cidade =
        String(
            cliente.cidade ?? ""
        ).trim();

    const uf =
        String(
            cliente.uf ?? ""
        ).trim();

    const enderecoPrincipal = [
        logradouro,
        numeroEndereco
    ]
        .filter(Boolean)
        .join(", ");

    const cidadeUf = [
        cidade,
        uf
    ]
        .filter(Boolean)
        .join(" - ");

    return [
        enderecoPrincipal,
        complemento,
        cidadeUf
    ]
        .filter(Boolean)
        .join(" - ");
}

/*
|--------------------------------------------------------------------------
| Preenchimento do cliente
|--------------------------------------------------------------------------
*/

function preencherDadosCliente(cliente) {
    campoContato.value =
        cliente.nome ?? "";

    campoEmail.value =
        cliente.email ?? "";

    campoTelefone.value =
        cliente.telefone ?? "";

    /*
     * Dispara o evento já utilizado pela máscara
     * existente do telefone.
     */
    campoTelefone.dispatchEvent(
        new Event(
            "input",
            {
                bubbles: true
            }
        )
    );

    campoEndereco.value =
        montarEnderecoCliente(cliente);
}

/*
|--------------------------------------------------------------------------
| Consulta do cliente
|--------------------------------------------------------------------------
*/

async function buscarClientePorDocumento() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    const documento =
        obterDocumentoAtual();

    const quantidadeEsperada =
        obterQuantidadeDocumento();

    if (
        documento !==
        documentoClienteResolvido
    ) {
        idCliente = null;
        documentoClienteResolvido = "";
    }

    if (
        documento.length !==
        quantidadeEsperada
    ) {
        numeroBuscaCliente += 1;
        limparStatusCliente();
        return;
    }

    definirStatusCliente(
        "consultando",
        "Consultando cliente..."
    );

    const numeroBuscaAtual =
        ++numeroBuscaCliente;

    try {
        const cliente =
            tipoDocumento === "cpf"
                ? await buscarClientePorCpf(
                    documento
                )
                : await buscarClientePorCnpj(
                    documento
                );

        /*
         * Ignora respostas de consultas antigas.
         */
        if (
            numeroBuscaAtual !==
            numeroBuscaCliente
        ) {
            return;
        }

        if (!cliente) {
            idCliente = null;
            documentoClienteResolvido = "";

            limparDadosCliente();

            definirStatusCliente(
                "novo",
                "Cliente novo. Ele será cadastrado ao gerar a cotação."
            );

            return;
        }

        idCliente =
            cliente.idCliente;

        documentoClienteResolvido =
            documento;

        preencherDadosCliente(cliente);

        definirStatusCliente(
            "encontrado",
            "Cliente encontrado!"
        );
    } catch (erro) {
        if (
            numeroBuscaAtual !==
            numeroBuscaCliente
        ) {
            return;
        }

        console.error(
            "Erro ao buscar cliente:",
            erro
        );

        idCliente = null;
        documentoClienteResolvido = "";

        definirStatusCliente(
            "erro",
            "Não foi possível consultar o cliente."
        );

        campoDocumento.setCustomValidity(
            erro.message
        );

        campoDocumento.reportValidity();
    }
}

function tratarAlteracaoDocumento() {
    formatarCampoDocumento();

    const documento =
        obterDocumentoAtual();

    /*
     * Se o usuário alterar um documento que já havia
     * resolvido um cliente, os dados carregados deixam
     * de ser confiáveis e são apagados.
     */
    if (
        documentoClienteResolvido &&
        documento !== documentoClienteResolvido
    ) {
        invalidarClienteResolvido({
            limparCampos: true
        });
    }

    buscarClientePorDocumento();
}

/*
|--------------------------------------------------------------------------
| Máscaras
|--------------------------------------------------------------------------
*/

aplicarMascaraTelefone(
    campoTelefone
);

/*
|--------------------------------------------------------------------------
| Produto
|--------------------------------------------------------------------------
*/

async function carregarProdutoSelecionado() {
    const codigoProduto =
        campoProduto.value;

    if (!codigoProduto) {
        produtoSelecionado = null;

        gerenciadorItens.limparItens();

        return;
    }

    try {
        produtoSelecionado =
            await buscarProdutoPorCodigo(
                codigoProduto
            );

        gerenciadorItens.renderizarItens(
            produtoSelecionado.itens
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar produto:",
            erro
        );

        produtoSelecionado = null;

        gerenciadorItens.limparItens();

        alert(
            "Não foi possível carregar o produto."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Dados cadastrais do cliente
|--------------------------------------------------------------------------
*/

function obterDadosCadastraisCliente() {
    const documentoCliente =
        obterDocumentoCliente();

    return {
        nome:
            campoContato.value.trim(),

        email:
            campoEmail.value.trim(),

        telefone:
            somenteDigitos(
                campoTelefone.value
            ),

        cpf:
            documentoCliente.cpf,

        cnpj:
            documentoCliente.cnpj,

        /*
         * O formulário atual possui somente um campo
         * de endereço. Enquanto não separarmos os seus
         * componentes, o conteúdo completo será salvo
         * como logradouro.
         */
        logradouro:
            campoEndereco.value.trim(),

        numeroEndereco: null,
        complemento: "",
        cidade: "",
        uf: ""
    };
}

/*
|--------------------------------------------------------------------------
| Resolução do cliente
|--------------------------------------------------------------------------
*/

async function resolverClienteAntesDaCotacao() {
    if (idCliente) {
        return idCliente;
    }
	
	if (!campoContato.value.trim()) {
		campoContato.focus();

		throw new Error(
			"Informe o nome do cliente."
		);
	}

    definirStatusCliente(
        "consultando",
        "Cadastrando cliente..."
    );

    const dadosCliente =
        obterDadosCadastraisCliente();

    const resultado =
        await obterOuCriarCliente(
            dadosCliente
        );

    idCliente =
        resultado.cliente.idCliente;

    documentoClienteResolvido =
        obterDocumentoAtual();

    preencherDadosCliente(
        resultado.cliente
    );

    definirStatusCliente(
        "encontrado",
        resultado.criado
            ? "Cliente cadastrado!"
            : "Cliente encontrado!"
    );

    return idCliente;
}

/*
|--------------------------------------------------------------------------
| Geração da cotação
|--------------------------------------------------------------------------
*/

async function gerarCotacao(evento) {
    evento.preventDefault();

    if (!produtoSelecionado) {
        alert("Selecione um produto.");
        return;
    }
	
	let idClienteResolvido;

	try {
		idClienteResolvido =
			await resolverClienteAntesDaCotacao();
	} catch (erro) {
		console.error(
			"Erro ao resolver cliente:",
			erro
		);

		definirStatusCliente(
			"erro",
			"Não foi possível cadastrar o cliente."
		);

		alert(erro.message);

		return;
	}
	
    const itens =
        gerenciadorItens
            .obterItensPreenchidos();

    const valorTotal =
        itens.reduce(
            (total, item) =>
                total + item.valorTotal,
            0
        );

    const documentoCliente =
        obterDocumentoCliente();

    const dados = {
        /*
         * Nesta versão o ID fica resolvido apenas
         * no frontend. Ele será usado efetivamente
         * na v0.6.3.
         */
        idCliente: idClienteResolvido,

        contato:
            campoContato.value,

        email:
            campoEmail.value,

        telefone:
            campoTelefone.value,

        endereco:
            campoEndereco.value,

        tipoDocumento:
            documentoCliente.tipoDocumento,

        cpf:
            documentoCliente.cpf,

        cnpj:
            documentoCliente.cnpj,

        produtoCodigo:
            produtoSelecionado.codigo,

        produtoNome:
            produtoSelecionado.nome,

        produtoDescricao:
            produtoSelecionado.descricao,

        itens,

        valorTotal,

        prazoEntrega:
            document.getElementById(
                "prazoEntrega"
            ).value,

        pagamento:
            document.getElementById(
                "pagamento"
            ).value,

        dataGeracao:
            new Date()
                .toLocaleDateString(
                    "pt-BR"
                )
    };

    try {
        const resposta =
            await fetch(
                "/documentos/gerar",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(dados)
                }
            );

        if (!resposta.ok) {
            const mensagemErro =
                await resposta.text();

            console.error(
                "Erro retornado pelo servidor:",
                mensagemErro
            );

            throw new Error(
                `Erro ao gerar documento.
Status: ${resposta.status}`
            );
        }

        const arquivoPdf =
            await resposta.blob();

        const urlPdf =
            window.URL
                .createObjectURL(
                    arquivoPdf
                );

        const linkDownload =
            document.createElement("a");

        linkDownload.href =
            urlPdf;

        linkDownload.download =
            "cotacao.pdf";

        document.body.appendChild(
            linkDownload
        );

        linkDownload.click();
        linkDownload.remove();

        window.URL.revokeObjectURL(
            urlPdf
        );
    } catch (erro) {
        console.error(
            "Erro ao gerar cotação:",
            erro
        );

        alert(
            "Erro ao gerar documento."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Eventos
|--------------------------------------------------------------------------
*/

tipoDocumentoCnpj.addEventListener(
    "change",
    configurarCampoDocumento
);

tipoDocumentoCpf.addEventListener(
    "change",
    configurarCampoDocumento
);

campoDocumento.addEventListener(
    "input",
    tratarAlteracaoDocumento
);

campoProduto.addEventListener(
    "change",
    carregarProdutoSelecionado
);

formulario.addEventListener(
    "submit",
    gerarCotacao
);

/*
|--------------------------------------------------------------------------
| Inicialização
|--------------------------------------------------------------------------
*/

preencherComboProdutos(
    campoProduto
);
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

const formulario =
    document.getElementById("formulario");

const campoProduto =
    document.getElementById("produto");

const campoTelefone =
    document.getElementById("telefone");

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

const gerenciadorItens = criarGerenciadorItens(
    corpoItensProduto,
    campoValorTotal
);

let produtoSelecionado = null;

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

function configurarCampoDocumento() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    campoDocumento.value = "";

    if (tipoDocumento === "cpf") {
        labelDocumento.textContent = "CPF";
        campoDocumento.maxLength = 14;
        campoDocumento.placeholder = "000.000.000-00";
    } else {
        labelDocumento.textContent = "CNPJ";
        campoDocumento.maxLength = 18;
        campoDocumento.placeholder = "00.000.000/0000-00";
    }

    campoDocumento.focus();
}

function formatarCampoDocumento() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    if (tipoDocumento === "cpf") {
        campoDocumento.value =
            formatarCpf(campoDocumento.value);

        return;
    }

    campoDocumento.value =
        formatarCnpj(campoDocumento.value);
}

function obterDocumentoCliente() {
    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    const documento =
        somenteDigitos(campoDocumento.value);

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

aplicarMascaraTelefone(campoTelefone);

async function carregarProdutoSelecionado() {
    const codigoProduto = campoProduto.value;

    if (!codigoProduto) {
        produtoSelecionado = null;
        gerenciadorItens.limparItens();
        return;
    }

    try {
        produtoSelecionado =
            await buscarProdutoPorCodigo(codigoProduto);

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

        alert("Não foi possível carregar o produto.");
    }
}

async function gerarCotacao(evento) {
    evento.preventDefault();

    if (!produtoSelecionado) {
        alert("Selecione um produto.");
        return;
    }

    const itens =
        gerenciadorItens.obterItensPreenchidos();

    const valorTotal = itens.reduce(
        (total, item) => total + item.valorTotal,
        0
    );
	
	const documentoCliente = obterDocumentoCliente();

    const dados = {
        contato:
            document.getElementById("contato").value,

        email:
            document.getElementById("email").value,

        telefone:
            campoTelefone.value,

        endereco:
            document.getElementById("endereco").value,
		
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
            document.getElementById("prazoEntrega").value,

        pagamento:
            document.getElementById("pagamento").value,

        dataGeracao:
            new Date().toLocaleDateString("pt-BR")
    };

    try {
        const resposta = await fetch(
            "/documentos/gerar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
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
                `Erro ao gerar documento. Status: ${resposta.status}`
            );
        }

        const arquivoPdf =
            await resposta.blob();

        const urlPdf =
            window.URL.createObjectURL(arquivoPdf);

        const linkDownload =
            document.createElement("a");

        linkDownload.href = urlPdf;
        linkDownload.download = "cotacao.pdf";

        document.body.appendChild(linkDownload);

        linkDownload.click();
        linkDownload.remove();

        window.URL.revokeObjectURL(urlPdf);
    } catch (erro) {
        console.error(
            "Erro ao gerar cotação:",
            erro
        );

        alert("Erro ao gerar documento.");
    }
}

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
    formatarCampoDocumento
);

campoProduto.addEventListener(
    "change",
    carregarProdutoSelecionado
);

formulario.addEventListener(
    "submit",
    gerarCotacao
);

preencherComboProdutos(campoProduto);
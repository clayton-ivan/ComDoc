import {
    aplicarMascaraCnpj,
    aplicarMascaraTelefone
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

const campoCnpj =
    document.getElementById("cnpj");

const corpoItensProduto =
    document.getElementById("itensProduto");

const campoValorTotal =
    document.getElementById("valorTotal");

const gerenciadorItens = criarGerenciadorItens(
    corpoItensProduto,
    campoValorTotal
);

let produtoSelecionado = null;

aplicarMascaraTelefone(campoTelefone);
aplicarMascaraCnpj(campoCnpj);

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

    const dados = {
        contato:
            document.getElementById("contato").value,

        email:
            document.getElementById("email").value,

        telefone:
            campoTelefone.value,

        endereco:
            document.getElementById("endereco").value,

        cnpj:
            campoCnpj.value,

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

campoProduto.addEventListener(
    "change",
    carregarProdutoSelecionado
);

formulario.addEventListener(
    "submit",
    gerarCotacao
);

preencherComboProdutos(campoProduto);
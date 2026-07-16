const campoPesquisa =
    document.getElementById("pesquisaProduto");

const containerProdutos =
    document.getElementById("produtos");

const mensagemLista =
    document.getElementById("mensagemLista");

const botaoNovoProduto =
    document.getElementById("botaoNovoProduto");

const dialogProduto =
    document.getElementById("dialogProduto");

const formProduto =
    document.getElementById("formProduto");

const tituloDialog =
    document.getElementById("tituloDialog");

const botaoFecharDialog =
    document.getElementById("botaoFecharDialog");

const botaoCancelar =
    document.getElementById("botaoCancelar");

const botaoAdicionarItem =
    document.getElementById("botaoAdicionarItem");

const containerItens =
    document.getElementById("itensProduto");

const campoCodigoProduto =
    document.getElementById("codigoProduto");

const campoNomeProduto =
    document.getElementById("nomeProduto");

const campoDescricaoProduto =
    document.getElementById("descricaoProduto");

let produtos = [];
let codigoProdutoEmEdicao = null;

function permitirSomenteInteiros(campo) {
    campo.setAttribute("type", "text");
    campo.setAttribute("inputmode", "numeric");

    campo.addEventListener("beforeinput", (evento) => {
        const operacaoPermitida =
            evento.inputType.startsWith("delete") ||
            evento.inputType === "insertFromPaste" ||
            evento.inputType === "insertFromDrop";

        if (operacaoPermitida) {
            return;
        }

        if (evento.data && !/^\d+$/.test(evento.data)) {
            evento.preventDefault();
        }
    });

    campo.addEventListener("input", () => {
        campo.value = campo.value.replace(/\D/g, "");
    });
}

permitirSomenteInteiros(campoCodigoProduto);


function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function criarItemProduto(item = {}) {
    const linha = document.createElement("tr");

    linha.className = "item-produto";

    linha.innerHTML = `
        <td class="coluna-codigo">
            <input
                type="text"
                inputmode="numeric"
                class="item-codigo"
                value="${escaparHtml(item.codigo || "")}"
                required>
        </td>

        <td class="coluna-descricao">
            <input
                type="text"
                class="item-descricao"
                value="${escaparHtml(item.descricao || "")}"
                required>
        </td>

        <td class="coluna-quantidade">
            <input
                type="text"
                inputmode="numeric"
                class="item-quantidade"
                value="${item.quantidade || 1}"
                required>
        </td>

        <td class="coluna-valor">
            <input
                type="text"
                inputmode="numeric"
                class="item-valor"
                value="${item.valorSugerido ?? 0}"
                required>
        </td>

        <td class="coluna-acao">
            <button
                type="button"
                class="botao-remover-item">
                Remover
            </button>
        </td>
    `;

    containerItens.appendChild(linha);

    const campoCodigoItem =
        linha.querySelector(".item-codigo");

    const campoQuantidadeItem =
        linha.querySelector(".item-quantidade");

    const campoValorItem =
        linha.querySelector(".item-valor");

    permitirSomenteInteiros(campoCodigoItem);
    permitirSomenteInteiros(campoQuantidadeItem);
    permitirSomenteInteiros(campoValorItem);

    linha
        .querySelector(".botao-remover-item")
        .addEventListener("click", () => {
            linha.remove();

            if (
                containerItens.querySelectorAll(".item-produto")
                    .length === 0
            ) {
                criarItemProduto();
            }
        });
}

function obterItensFormulario() {
    return Array
        .from(
            containerItens.querySelectorAll(".item-produto")
        )
        .map((linha) => ({
            codigo:
                linha
                    .querySelector(".item-codigo")
                    .value
                    .trim(),

            descricao:
                linha
                    .querySelector(".item-descricao")
                    .value
                    .trim(),

            quantidade:
                Number(
                    linha.querySelector(".item-quantidade")
                        .value
                ),

            valorSugerido:
                Number(
                    linha.querySelector(".item-valor")
                        .value
                )
        }));
}

function limparFormularioProduto() {
    formProduto.reset();
    containerItens.innerHTML = "";
    codigoProdutoEmEdicao = null;
    campoCodigoProduto.disabled = false;
}

function abrirNovoProduto() {
    limparFormularioProduto();

    tituloDialog.textContent = "Novo produto";

    criarItemProduto();

    dialogProduto.showModal();
}

async function abrirEdicaoProduto(codigo) {
    try {
        const resposta = await fetch(
            `/produtos/${encodeURIComponent(codigo)}`
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar produto. Status: ${resposta.status}`
            );
        }

        const produto = await resposta.json();

        limparFormularioProduto();

        codigoProdutoEmEdicao = produto.codigo;

        tituloDialog.textContent = "Editar produto";

        campoCodigoProduto.value = produto.codigo;
        campoCodigoProduto.disabled = true;

        campoNomeProduto.value = produto.nome;
        campoDescricaoProduto.value = produto.descricao;

        produto.itens.forEach((item) => {
            criarItemProduto(item);
        });

        dialogProduto.showModal();
    } catch (erro) {
        console.error("Erro ao abrir produto:", erro);
        alert("Não foi possível carregar o produto.");
    }
}

function fecharDialog() {
    dialogProduto.close();
    limparFormularioProduto();
}

function renderizarProdutos(lista) {
    containerProdutos.innerHTML = "";

    if (lista.length === 0) {
        mensagemLista.style.display = "block";
        mensagemLista.textContent =
            "Nenhum produto encontrado.";
        return;
    }

    mensagemLista.style.display = "none";

    lista.forEach((produto) => {
        const elemento = document.createElement("article");

        elemento.className = "produto";

        elemento.innerHTML = `
            <div>
                <h2>${escaparHtml(produto.nome)}</h2>
                <p>
                    Código:
                    ${escaparHtml(produto.codigo)}
                </p>
            </div>

            <div class="acoes-produto">
                <button
                    type="button"
                    class="botao-secundario botao-editar">
                    Editar
                </button>

                <button
                    type="button"
                    class="botao-perigo botao-excluir">
                    Excluir
                </button>
            </div>
        `;

        elemento
            .querySelector(".botao-editar")
            .addEventListener("click", () => {
                abrirEdicaoProduto(produto.codigo);
            });

        elemento
            .querySelector(".botao-excluir")
            .addEventListener("click", () => {
                excluirProduto(produto);
            });

        containerProdutos.appendChild(elemento);
    });
}

async function carregarProdutos() {
    mensagemLista.style.display = "block";
    mensagemLista.textContent =
        "Carregando produtos...";

    try {
        const resposta = await fetch("/produtos");

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar produtos. Status: ${resposta.status}`
            );
        }

        produtos = await resposta.json();

        renderizarProdutos(produtos);
    } catch (erro) {
        console.error(
            "Erro ao carregar produtos:",
            erro
        );

        mensagemLista.style.display = "block";
        mensagemLista.textContent =
            "Não foi possível carregar os produtos.";
    }
}

async function salvarProduto(evento) {
    evento.preventDefault();

    const produto = {
        codigo: codigoProdutoEmEdicao ||
            campoCodigoProduto.value.trim(),

        nome: campoNomeProduto.value.trim(),

        descricao:
            campoDescricaoProduto.value.trim(),

        itens: obterItensFormulario()
    };

    const estaEditando =
        codigoProdutoEmEdicao !== null;

    const url = estaEditando
        ? `/produtos/${encodeURIComponent(
            codigoProdutoEmEdicao
        )}`
        : "/produtos";

    const metodo = estaEditando
        ? "PUT"
        : "POST";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                "Erro ao salvar produto."
            );
        }

        fecharDialog();
        await carregarProdutos();
    } catch (erro) {
        console.error(
            "Erro ao salvar produto:",
            erro
        );

        alert(erro.message);
    }
}

async function excluirProduto(produto) {
    const confirmou = window.confirm(
        `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmou) {
        return;
    }

    try {
        const resposta = await fetch(
            `/produtos/${encodeURIComponent(
                produto.codigo
            )}`,
            {
                method: "DELETE"
            }
        );

        if (!resposta.ok) {
            let mensagem =
                "Não foi possível excluir o produto.";

            try {
                const resultado =
                    await resposta.json();

                mensagem =
                    resultado.mensagem || mensagem;
            } catch {
                // A resposta 204 não possui JSON.
            }

            throw new Error(mensagem);
        }

        await carregarProdutos();
    } catch (erro) {
        console.error(
            "Erro ao excluir produto:",
            erro
        );

        alert(erro.message);
    }
}

function pesquisarProdutos() {
    const termo = campoPesquisa.value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const filtrados = produtos.filter((produto) => {
        const nome = produto.nome
            .toLocaleLowerCase("pt-BR");

        const codigo = produto.codigo
            .toLocaleLowerCase("pt-BR");

        return (
            nome.includes(termo) ||
            codigo.includes(termo)
        );
    });

    renderizarProdutos(filtrados);
}

botaoNovoProduto.addEventListener(
    "click",
    abrirNovoProduto
);

botaoFecharDialog.addEventListener(
    "click",
    fecharDialog
);

botaoCancelar.addEventListener(
    "click",
    fecharDialog
);

botaoAdicionarItem.addEventListener(
    "click",
    () => criarItemProduto()
);

campoPesquisa.addEventListener(
    "input",
    pesquisarProdutos
);

formProduto.addEventListener(
    "submit",
    salvarProduto
);

carregarProdutos();
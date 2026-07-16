export async function listarProdutos() {
    const resposta = await fetch("/produtos");

    if (!resposta.ok) {
        throw new Error(
            `Erro ao listar produtos. Status: ${resposta.status}`
        );
    }

    return resposta.json();
}

export async function buscarProdutoPorCodigo(codigo) {
    const resposta = await fetch(
        `/produtos/${encodeURIComponent(codigo)}`
    );

    if (!resposta.ok) {
        throw new Error(
            `Erro ao buscar produto. Status: ${resposta.status}`
        );
    }

    return resposta.json();
}

export async function preencherComboProdutos(campoProduto) {
    campoProduto.innerHTML =
        '<option value="">Carregando produtos...</option>';

    try {
        const produtos = await listarProdutos();

        campoProduto.innerHTML =
            '<option value="">Selecione um produto</option>';

        produtos.forEach((produto) => {
            const opcao = document.createElement("option");

            opcao.value = produto.codigo;
            opcao.textContent = produto.nome;

            campoProduto.appendChild(opcao);
        });
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        campoProduto.innerHTML =
            '<option value="">Erro ao carregar produtos</option>';

        throw erro;
    }
}
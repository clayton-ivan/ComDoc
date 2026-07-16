import {
    aplicarMascaraMoeda,
    formatarMoeda,
    moedaParaNumero,
    permitirSomenteInteiros
} from "./mascaras.js";

export function criarGerenciadorItens(
    corpoItensProduto,
    campoValorTotal
) {
    function atualizarTotais() {
        const linhas =
            corpoItensProduto.querySelectorAll("tr[data-codigo]");

        let valorTotalProposta = 0;

        linhas.forEach((linha) => {
            const campoQuantidade =
                linha.querySelector(".item-quantidade");

            const campoValorUnitario =
                linha.querySelector(".item-valor-unitario");

            const campoTotal =
                linha.querySelector(".item-total");

            const quantidade =
                Number(campoQuantidade.value) || 0;

            const valorUnitario =
                moedaParaNumero(campoValorUnitario.value);

            const totalItem =
                quantidade * valorUnitario;

            campoTotal.value =
                formatarMoeda(totalItem);

            valorTotalProposta += totalItem;
        });

        campoValorTotal.value =
            formatarMoeda(valorTotalProposta);
    }

    function renderizarItens(itens) {
        corpoItensProduto.innerHTML = "";

        itens.forEach((item) => {
            const linha = document.createElement("tr");

            linha.dataset.codigo = item.codigo;
            linha.dataset.descricao = item.descricao;

            linha.innerHTML = `
                <td>${item.descricao}</td>

                <td>
                    <input
                        type="text"
                        inputmode="numeric"
                        class="item-quantidade"
                        value="${item.quantidade}"
                        required>
                </td>

                <td>
                    <input
                        type="text"
                        inputmode="numeric"
                        class="item-valor-unitario"
                        value="${formatarMoeda(item.valorSugerido)}"
                        required>
                </td>

                <td>
                    <input
                        type="text"
                        class="item-total"
                        readonly>
                </td>
            `;

            corpoItensProduto.appendChild(linha);

            const campoQuantidade =
                linha.querySelector(".item-quantidade");

            const campoValorUnitario =
                linha.querySelector(".item-valor-unitario");

            permitirSomenteInteiros(
                campoQuantidade,
                atualizarTotais
            );

            aplicarMascaraMoeda(
                campoValorUnitario,
                atualizarTotais
            );
        });

        atualizarTotais();
    }

    function obterItensPreenchidos() {
        const linhas =
            corpoItensProduto.querySelectorAll("tr[data-codigo]");

        return Array.from(linhas).map((linha) => {
            const campoQuantidade =
                linha.querySelector(".item-quantidade");

            const campoValorUnitario =
                linha.querySelector(".item-valor-unitario");

            const quantidade =
                Number(campoQuantidade.value) || 0;

            const valorUnitario =
                moedaParaNumero(campoValorUnitario.value);

            return {
                codigo: linha.dataset.codigo,
                descricao: linha.dataset.descricao,
                quantidade,
                valorUnitario,
                valorTotal: quantidade * valorUnitario
            };
        });
    }

    function limparItens() {
        corpoItensProduto.innerHTML = `
            <tr>
                <td colspan="4">
                    Selecione um produto.
                </td>
            </tr>
        `;

        campoValorTotal.value = "";
    }

    return {
        atualizarTotais,
        renderizarItens,
        obterItensPreenchidos,
        limparItens
    };
}
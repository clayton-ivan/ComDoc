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
        const cards =
            corpoItensProduto.querySelectorAll(
                ".item-proposta[data-codigo]"
            );

        let valorTotalProposta = 0;

        cards.forEach((card) => {
            const campoQuantidade =
                card.querySelector(".item-quantidade");

            const campoValorUnitario =
                card.querySelector(".item-valor-unitario");

            const campoTotal =
                card.querySelector(".item-total");

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

        if (!Array.isArray(itens) || itens.length === 0) {
            corpoItensProduto.innerHTML = `
                <p class="mensagem-itens">
                    Este produto não possui itens cadastrados.
                </p>
            `;

            campoValorTotal.value =
                formatarMoeda(0);

            return;
        }

        itens.forEach((item, indice) => {
            const card =
                document.createElement("article");

            card.classList.add("item-proposta");

            card.dataset.codigo = item.codigo;

            card.innerHTML = `
                <div class="item-proposta-identificacao">
                    <div class="item-proposta-codigo">
                        <label for="item-codigo-${indice}">
                            Código
                        </label>

                        <input
                            type="text"
                            id="item-codigo-${indice}"
                            class="item-codigo"
                            value="${item.codigo}"
                            readonly>
                    </div>

                    <div class="item-proposta-nome">
                        <label for="item-descricao-${indice}">
                            Item
                        </label>

                        <input
                            type="text"
                            id="item-descricao-${indice}"
                            class="item-descricao"
                            value="${item.descricao}"
                            required>
                    </div>
                </div>

                <div class="item-proposta-campos">
                    <div
                        class="
                            item-proposta-campo
                            item-proposta-quantidade
                        ">

                        <label for="item-quantidade-${indice}">
                            Qtde.
                        </label>

                        <input
                            type="text"
                            id="item-quantidade-${indice}"
                            inputmode="numeric"
                            class="item-quantidade"
                            value="${item.quantidade}"
                            required>
                    </div>

                    <div
                        class="
                            item-proposta-campo
                            item-proposta-valor
                        ">

                        <label for="item-valor-${indice}">
                            Valor unit.
                        </label>

                        <input
                            type="text"
                            id="item-valor-${indice}"
                            inputmode="numeric"
                            class="item-valor-unitario"
                            value="${formatarMoeda(
                                item.valorSugerido
                            )}"
                            required>
                    </div>

                    <div
                        class="
                            item-proposta-campo
                            item-proposta-total
                        ">

                        <label for="item-total-${indice}">
                            Total
                        </label>

                        <input
                            type="text"
                            id="item-total-${indice}"
                            class="item-total"
                            readonly>
                    </div>
                </div>
            `;

            corpoItensProduto.appendChild(card);

            const campoQuantidade =
                card.querySelector(".item-quantidade");

            const campoValorUnitario =
                card.querySelector(".item-valor-unitario");

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
        const cards =
            corpoItensProduto.querySelectorAll(
                ".item-proposta[data-codigo]"
            );

        return Array.from(cards).map((card) => {
            const campoDescricao =
                card.querySelector(".item-descricao");

            const campoQuantidade =
                card.querySelector(".item-quantidade");

            const campoValorUnitario =
                card.querySelector(".item-valor-unitario");

            const quantidade =
                Number(campoQuantidade.value) || 0;

            const valorUnitario =
                moedaParaNumero(campoValorUnitario.value);

            return {
                codigo: card.dataset.codigo,
                descricao: campoDescricao.value.trim(),
                quantidade,
                valorUnitario,
                valorTotal:
                    quantidade * valorUnitario
            };
        });
    }

    function limparItens() {
        corpoItensProduto.innerHTML = `
            <p class="mensagem-itens">
                Selecione um produto.
            </p>
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
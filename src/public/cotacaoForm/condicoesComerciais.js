async function listar(caminho) {
    const resposta = await fetch(`/empresa/${caminho}`);

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as condições comerciais.");
    }

    return resposta.json();
}

function normalizarPesquisa(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

function configurarCombobox(campo, lista, registros) {
    const container = campo.closest(".combobox-editavel");
    const botaoAbrir = container.querySelector(".abrir-combobox");

    function fechar() {
        lista.hidden = true;
        campo.setAttribute("aria-expanded", "false");
    }

    function selecionar(descricao) {
        campo.value = descricao;
        fechar();
        campo.focus();
    }

    function renderizar() {
        const pesquisa = normalizarPesquisa(campo.value.trim());
        const filtrados = registros.filter((registro) =>
            normalizarPesquisa(registro.descricao).includes(pesquisa)
        );

        lista.replaceChildren();

        if (filtrados.length === 0) {
            const mensagem = document.createElement("li");
            mensagem.className = "sem-opcoes";
            mensagem.textContent = campo.value.trim()
                ? "Nenhuma opção cadastrada. O novo texto será cadastrado ao gerar a cotação."
                : "Nenhuma opção cadastrada.";
            lista.appendChild(mensagem);
        } else {
            filtrados.forEach((registro) => {
                const item = document.createElement("li");
                const botao = document.createElement("button");

                botao.type = "button";
                botao.role = "option";
                botao.textContent = registro.descricao;
                botao.addEventListener("click", () =>
                    selecionar(registro.descricao)
                );

                item.appendChild(botao);
                lista.appendChild(item);
            });
        }

        lista.hidden = false;
        campo.setAttribute("aria-expanded", "true");
    }

    campo.addEventListener("focus", renderizar);
    campo.addEventListener("input", renderizar);
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fechar();
        }

        if (evento.key === "ArrowDown") {
            evento.preventDefault();
            renderizar();
            lista.querySelector("button")?.focus();
        }
    });

    botaoAbrir.addEventListener("click", () => {
        if (lista.hidden) {
            renderizar();
            campo.focus();
        } else {
            fechar();
        }
    });

    document.addEventListener("click", (evento) => {
        if (!container.contains(evento.target)) {
            fechar();
        }
    });
}

async function preencherCondicoesComerciais() {
    const [prazosEntrega, formasPagamento] = await Promise.all([
        listar("prazos-entrega"),
        listar("formas-pagamento")
    ]);

    configurarCombobox(
        document.getElementById("prazoEntrega"),
        document.getElementById("opcoesPrazoEntrega"),
        prazosEntrega
    );
    configurarCombobox(
        document.getElementById("pagamento"),
        document.getElementById("opcoesFormaPagamento"),
        formasPagamento
    );
}

export {
    preencherCondicoesComerciais
};

import { requisitar, mostrarToast } from "/auth/auth.js";

const NOMES_GRUPOS = {
    SEGURANCA: "Segurança e login",
    SESSOES: "Sessões",
    CADASTROS: "Validação de cadastros",
    UPLOADS: "Uploads"
};

const form = document.getElementById("formParametros");
const gruposElemento = document.getElementById("grupos");
let parametros = [];

function criarControle(parametro) {
    if (parametro.tipo === "BOOLEANO") {
        const label = document.createElement("label");
        label.className = "controle-booleano";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = parametro.valor;
        input.dataset.codigo = parametro.codigo;
        const texto = document.createElement("span");
        texto.textContent = "Ativo";
        label.append(input, texto);
        return label;
    }

    const input = document.createElement("input");
    input.type = "number";
    input.required = true;
    input.min = parametro.minimo;
    input.max = parametro.maximo;
    input.step = "1";
    input.value = parametro.valor;
    input.dataset.codigo = parametro.codigo;
    input.setAttribute("aria-label", parametro.nome);
    return input;
}

function renderizar() {
    gruposElemento.replaceChildren();
    const grupos = parametros.reduce((resultado, parametro) => {
        if (!resultado.has(parametro.grupo)) resultado.set(parametro.grupo, []);
        resultado.get(parametro.grupo).push(parametro);
        return resultado;
    }, new Map());

    grupos.forEach((itens, codigoGrupo) => {
        const secao = document.createElement("section");
        secao.className = "grupo-parametros";
        const titulo = document.createElement("h2");
        titulo.textContent = NOMES_GRUPOS[codigoGrupo] || codigoGrupo;
        secao.appendChild(titulo);

        itens.forEach((parametro) => {
            const linha = document.createElement("div");
            linha.className = "parametro";
            const informacoes = document.createElement("div");
            const rotulo = document.createElement("label");
            rotulo.textContent = parametro.nome;
            const descricao = document.createElement("p");
            descricao.textContent = parametro.descricao;
            informacoes.append(rotulo, descricao);
            linha.append(informacoes, criarControle(parametro));
            secao.appendChild(linha);
        });
        gruposElemento.appendChild(secao);
    });
}

async function salvar(evento) {
    evento?.preventDefault();
    if (!form.reportValidity()) return;

    const alterados = parametros.map((parametro) => {
        const campo = form.querySelector(`[data-codigo="${parametro.codigo}"]`);
        return {
            codigo: parametro.codigo,
            valor: parametro.tipo === "BOOLEANO" ? campo.checked : Number(campo.value)
        };
    });

    try {
        parametros = await requisitar("/parametros", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parametros: alterados })
        });
        renderizar();
        mostrarToast("Parâmetros salvos com sucesso.");
    } catch (erro) {
        mostrarToast(erro.message, true);
    }
}

form.addEventListener("submit", salvar);
document.getElementById("salvarSuperior").addEventListener("click", salvar);

requisitar("/parametros")
    .then((dados) => {
        parametros = dados;
        renderizar();
    })
    .catch((erro) => mostrarToast(erro.message, true));

import { requisitar, mostrarToast } from "/auth/auth.js";

const lista = document.getElementById("lista");
const pesquisa = document.getElementById("pesquisa");
let empresas = [];

function cnpj(valor) {
    const d = String(valor || "").replace(/\D/g, "");
    return d.length === 14
        ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
        : "CNPJ não informado";
}

async function selecionar(empresa, destino) {
    await requisitar("/auth/selecionar-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEmpresa: empresa.id })
    });
    location.href = destino;
}

function renderizar() {
    const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
    const filtradas = empresas.filter((empresa) =>
        `${empresa.nomeFantasia} ${empresa.nome} ${empresa.cnpj}`
            .toLocaleLowerCase("pt-BR").includes(termo)
    );
    lista.replaceChildren();
    document.getElementById("mensagem").textContent = filtradas.length
        ? ""
        : "Nenhuma empresa encontrada.";

    filtradas.forEach((empresa) => {
        const card = document.createElement("article");
        card.className = "empresa-card";
        const titulo = document.createElement("h2");
        titulo.textContent = empresa.nomeFantasia;
        const razao = document.createElement("p");
        razao.textContent = empresa.nome;
        const documento = document.createElement("p");
        documento.textContent = cnpj(empresa.cnpj);
        const admin = document.createElement("p");
        admin.textContent = empresa.administrador
            ? `Administrador: ${empresa.administrador.nome}`
            : "Administrador não cadastrado";
        const resumo = document.createElement("p");
        resumo.textContent = `${empresa.quantidadeUsuariosAtivos} usuário(s) ativo(s)`;
        const status = document.createElement("p");
        status.className = `status${empresa.ativo ? "" : " inativa"}`;
        status.textContent = empresa.ativo ? "Ativa" : "Inativa";
        const acoes = document.createElement("div");
        acoes.className = "acoes-card";
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.onclick = () => selecionar(empresa, "/admin/empresa");
        const acessar = document.createElement("button");
        acessar.type = "button";
        acessar.textContent = "Acessar empresa";
        acessar.onclick = () => selecionar(empresa, "/");
        acoes.append(editar, acessar);
        card.append(titulo, razao, documento, admin, resumo, status, acoes);
        lista.appendChild(card);
    });
}

pesquisa.addEventListener("input", renderizar);
requisitar("/empresas").then((dados) => {
    empresas = dados;
    renderizar();
}).catch((erro) => mostrarToast(erro.message, true));
